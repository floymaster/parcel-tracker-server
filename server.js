const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

// Включаем CORS для обработки запросов от расширения
app.use(cors());

// Маршрут для отслеживания посылок
app.get('/track', async (req, res) => {
  try {
    const { code } = req.query;
    
    if (!code) {
      return res.status(400).json({ error: 'Tracking code is required' });
    }
    
    // Получаем HTML страницу с track24.net
    const response = await axios.get(`https://track24.net/?code=${code}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://track24.net/'
      }
    });
    
    // Парсим HTML с помощью cheerio
    const $ = cheerio.load(response.data);
    const events = [];
    
    // Находим и извлекаем информацию о событиях отслеживания
    $('.event-list .event-item').each((index, element) => {
      const status = $(element).find('.event-status').text().trim();
      const date = $(element).find('.event-date').text().trim().split(' ')[0];
      const time = $(element).find('.event-date').text().trim().split(' ')[1] || '';
      const location = $(element).find('.event-location').text().trim();
      
      events.push({
        status,
        date,
        time,
        location
      });
    });
    
    // Если не нашли события в стандартном формате, попробуем альтернативный
    if (events.length === 0) {
      $('.tracking-events .tracking-event').each((index, element) => {
        const status = $(element).find('.status').text().trim();
        const dateTime = $(element).find('.date').text().trim();
        const date = dateTime.split(' ')[0];
        const time = dateTime.split(' ')[1] || '';
        const location = $(element).find('.location').text().trim();
        
        events.push({
          status,
          date,
          time,
          location
        });
      });
    }
    
    res.json(events);
  } catch (error) {
    console.error('Error tracking parcel:', error);
    res.status(500).json({ error: 'Failed to track parcel' });
  }
});

// Простой маршрут для проверки работоспособности сервера
app.get('/', (req, res) => {
  res.send('Parcel Tracker API is running');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
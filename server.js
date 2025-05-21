const express = require('express');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

// Включаем плагин Stealth для обхода обнаружения
puppeteer.use(StealthPlugin());

app.use(cors());

app.get('/track', async (req, res) => {
  const { code } = req.query;
  
  if (!code) {
    return res.status(400).json({ error: 'Tracking code is required' });
  }
  
  let browser = null;
  
  try {
    // Настройка для Railway без Docker
    browser = await puppeteer.launch({
      headless: true,
      // executablePath is removed to allow Puppeteer to use its bundled Chromium
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process', // Keep if memory is very constrained, otherwise optional
        '--disable-gpu'
      ]
    });
    
    // Остальной код...
    const page = await browser.newPage();
    
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    
    await page.goto(`https://track24.net/?code=${code}`, {
      waitUntil: 'networkidle2',
      timeout: 60000
    });
    
    await page.waitForSelector('.event-list, .tracking-events', { timeout: 30000 }).catch(() => {});
    
    const events = await page.evaluate(() => {
      const results = [];
      
      // Пробуем найти события в первом формате
      const eventItems = document.querySelectorAll('.event-list .event-item');
      if (eventItems.length > 0) {
        eventItems.forEach(item => {
          const status = item.querySelector('.event-status')?.textContent.trim() || '';
          const dateTime = item.querySelector('.event-date')?.textContent.trim() || '';
          const dateParts = dateTime.split(' ');
          const date = dateParts[0] || '';
          const time = dateParts[1] || '';
          const location = item.querySelector('.event-location')?.textContent.trim() || '';
          
          results.push({ status, date, time, location });
        });
      }
      
      // Если не нашли, пробуем второй формат
      if (results.length === 0) {
        const trackingEvents = document.querySelectorAll('.tracking-events .tracking-event');
        trackingEvents.forEach(item => {
          const status = item.querySelector('.status')?.textContent.trim() || '';
          const dateTime = item.querySelector('.date')?.textContent.trim() || '';
          const dateParts = dateTime.split(' ');
          const date = dateParts[0] || '';
          const time = dateParts[1] || '';
          const location = item.querySelector('.location')?.textContent.trim() || '';
          
          results.push({ status, date, time, location });
        });
      }
      
      return results;
    });
    
    res.json(events);
  } catch (error) {
    console.error('Error tracking parcel:', error);
    res.status(500).json({ error: 'Failed to track parcel' });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
});

app.get('/', (req, res) => {
  res.send('Parcel Tracker API is running');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
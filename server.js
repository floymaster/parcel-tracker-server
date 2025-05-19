const express = require('express');
const cors = require('cors');
const puppeteer = require('puppeteer-core'); // Используем puppeteer-core

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.get('/', async (req, res) => {
  try {
    // Запускаем браузер с указанием пути к Chromium
    const browser = await puppeteer.launch({
      executablePath: '/usr/bin/chromium-browser', // Путь к установленному Chromium
      headless: true, // Открываем в headless-режиме (без графического интерфейса)
    });

    const page = await browser.newPage();
    await page.goto('https://example.com'); // Здесь ваш код для парсинга

    // Выполнение операций с page, например:
    const title = await page.title();
    res.send(`Page title: ${title}`);

    await page.close();
    await browser.close();
  } catch (error) {
    console.error('Ошибка при запуске Puppeteer:', error);
    res.status(500).send('Ошибка при парсинге');
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

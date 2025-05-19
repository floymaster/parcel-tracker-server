const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const port = process.env.PORT || 3000;

// Статическая страница, чтобы проверить работу сервера
app.get('/', (req, res) => {
  res.send('Hello, your server is running!');
});

// Роут для тестирования Puppeteer
app.get('/test-puppeteer', async (req, res) => {
  try {
    // Запуск браузера в headless режиме
    const browser = await puppeteer.launch({
      headless: true, // Браузер будет работать без интерфейса
      args: ['--no-sandbox', '--disable-setuid-sandbox'], // Для Linux/Render
    });

    // Открытие новой страницы
    const page = await browser.newPage();

    // Переход на страницу Google
    await page.goto('https://www.google.com');

    // Получение заголовка страницы
    const title = await page.title();

    // Отправляем результат пользователю
    res.send(`Puppeteer test: Page title is ${title}`);

    // Закрытие браузера
    await browser.close();
  } catch (error) {
    console.error('Error during Puppeteer operation:', error);
    res.status(500).send('Something went wrong while running Puppeteer');
  }
});

// Старт сервера
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

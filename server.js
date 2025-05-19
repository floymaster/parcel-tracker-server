const puppeteer = require('puppeteer-core'); // используем puppeteer-core вместо полного puppeteer
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

const { exec } = require('child_process');

// Функция для получения пути к браузеру
async function getChromiumPath() {
  return new Promise((resolve, reject) => {
    exec('which chromium-browser', (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        reject(stderr);
      }
      console.log(`Chromium path: ${stdout}`);
      resolve(stdout.trim()); // Возвращаем путь к Chromium
    });
  });
}

// Функция запуска браузера
async function launchBrowser() {
  const chromiumPath = await getChromiumPath();
  const browser = await puppeteer.launch({
    executablePath: chromiumPath || '/usr/bin/chromium-browser', // Указываем путь к браузеру
    headless: true, // без графического интерфейса
  });

  const page = await browser.newPage();
  await page.goto('https://example.com'); // Пример действия
  console.log('Page loaded');

  await browser.close();
}

// Запуск сервера
app.get('/', async (req, res) => {
  try {
    await launchBrowser(); // Запускаем Puppeteer
    res.send('Page parsed successfully');
  } catch (err) {
    console.error('Error during browser launch:', err);
    res.status(500).send('Error while launching browser');
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

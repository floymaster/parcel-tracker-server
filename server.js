const express = require('express');
const puppeteer = require('puppeteer-core');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.get('/test-puppeteer', async (req, res) => {
  try {
    // Путь к бинарному файлу Chrome
    const browserExecutablePath = process.env.CHROME_EXECUTABLE_PATH || '/usr/bin/google-chrome';

    // Инициализация браузера Puppeteer с указанием пути
    const browser = await puppeteer.launch({
      executablePath: browserExecutablePath,
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.goto('https://www.google.com');
    const title = await page.title();
    await browser.close();

    res.send(`Puppeteer test: Page title is ${title}`);
  } catch (error) {
    console.error('Error during Puppeteer operation:', error);
    res.status(500).send('Error during Puppeteer operation');
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

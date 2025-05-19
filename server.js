const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');
const { exec } = require('child_process');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

exec('which chromium-browser', (error, stdout, stderr) => {
  if (error) {
    console.error(`exec error: ${error}`);
    return;
  }
  console.log(`Chromium path: ${stdout}`);
});

app.get('/', async (req, res) => {
  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto('https://example.com');
    const title = await page.title();
    await browser.close();
    res.send(`Page title is: ${title}`);
  } catch (err) {
    console.error('Ошибка при запуске Puppeteer:', err);
    res.status(500).send('Error occurred while scraping data.');
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

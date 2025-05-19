const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

// Путь к каталогу кеша Puppeteer
const cacheDir = '/opt/render/.cache/puppeteer';

// Проверка, существует ли каталог кеша, если нет — создаем его
if (!fs.existsSync(cacheDir)) {
  fs.mkdirSync(cacheDir, { recursive: true });
}

// Теперь вы можете запустить Puppeteer
(async () => {
  try {
    const browser = await puppeteer.launch({
      executablePath: '/usr/bin/chromium-browser', // Путь к вашему Chromium (проверьте правильность)
      args: ['--no-sandbox', '--disable-setuid-sandbox'], // Часто требуется в облаке
    });

    const page = await browser.newPage();
    await page.goto('https://example.com');
    await page.screenshot({ path: 'example.png' });

    await browser.close();
  } catch (err) {
    console.error('Ошибка при запуске Puppeteer:', err);
  }
})();

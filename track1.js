const puppeteer = require('puppeteer');

// URL для отслеживания
const url = 'https://track24.net/service/track/tracking/01505456808145';

async function getTrackingData() {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });

    console.log('Данные загружены...');

    // Ждем, пока не появятся события отслеживания
    const trackingInfo = await page.$$('.trackingInfoRow');

    if (!trackingInfo.length) {
      console.log('Не удалось найти блоки с данными отслеживания.');
      await browser.close();
      return;
    }

    // Собираем данные о событиях
    const events = [];
    for (let i = 0; i < trackingInfo.length; i++) {
      const date = await trackingInfo[i].$eval('.trackingInfoDateTime .date b', el => el.textContent);
      const time = await trackingInfo[i].$eval('.trackingInfoDateTime .time', el => el.textContent);
      const status = await trackingInfo[i].$eval('.operationAttribute', el => el.textContent);
      const location = await trackingInfo[i].$eval('.operationPlace', el => el.textContent);

      if (date && status && location) {
        events.push({ date, time, status, location });
      }
    }

    if (events.length === 0) {
      console.log('Не удалось найти события отслеживания.');
    } else {
      console.log('Данные о посылке:');
      console.log(events);
    }

    await browser.close();
  } catch (error) {
    console.error('Ошибка при получении данных:', error);
  }
}

getTrackingData();

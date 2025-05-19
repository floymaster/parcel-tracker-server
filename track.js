const puppeteer = require('puppeteer');

async function trackParcel(code) {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  const url = `https://track24.net/?code=${code}`;

  await page.goto(url, { waitUntil: 'networkidle2' });
  await page.waitForSelector('#trackingEvents', { timeout: 15000 });

  const events = await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('#trackingEvents .trackingInfoRow'));
    return rows.map(row => {
      const date = row.querySelector('.date b')?.innerText?.trim() || '';
      const time = row.querySelector('.time')?.innerText?.trim() || '';
      const status = row.querySelector('.operationAttribute')?.innerText?.trim() || '';
      const location = row.querySelector('.operationPlace')?.innerText?.trim() || '';
      return { date, time, status, location };
    });
  });

  await browser.close();
  return events;
}

module.exports = trackParcel;

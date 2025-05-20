const puppeteer = require('puppeteer');

async function trackParcel(code) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox','--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
    'AppleWebKit/537.36 (KHTML, like Gecko) ' +
    'Chrome/114.0.0.0 Safari/537.36'
  );
  const url = `https://track24.net/?code=${encodeURIComponent(code)}`;
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
  await page.waitForSelector('#trackingEvents', { timeout: 15000 });

  const events = await page.evaluate(() => {
    return Array.from(
      document.querySelectorAll('#trackingEvents .trackingInfoRow')
    ).map(row => {
      const date     = row.querySelector('.date b')?.innerText.trim() || '';
      const time     = row.querySelector('.time')?.innerText.trim() || '';
      const status   = row.querySelector('.operationAttribute')?.innerText.trim() || '';
      const location = row.querySelector('.operationPlace')?.innerText.trim() || '';
      return { date, time, status, location };
    });
  });

  await browser.close();
  return events;
}

module.exports = trackParcel;
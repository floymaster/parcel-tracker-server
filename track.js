const cloudscraper = require('cloudscraper');
const cheerio = require('cheerio');

const BASE = 'https://track24.net';

async function trackParcel(code) {
  // 1) Получаем HTML страницы с кодом — cloudscraper обойдёт CF
  const html = await cloudscraper.get({
    url:     `${BASE}/?code=${encodeURIComponent(code)}`,
    method:  'GET',
    gzip:    true,
    timeout: 20000,
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
        'AppleWebKit/537.36 (KHTML, like Gecko) ' +
        'Chrome/114.0.0.0 Safari/537.36',
      'Accept':
        'text/html,application/xhtml+xml,application/xml;' +
        'q=0.9,*/*;q=0.8',
      'Accept-Language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
      'Connection': 'keep-alive'
    }
  });

  // 2) Парсим таблицу #trackingEvents
  const $ = cheerio.load(html);
  const rows = $('#trackingEvents .trackingInfoRow');
  const events = [];

  rows.each((_, el) => {
    const date     = $(el).find('.date b').text().trim();
    const time     = $(el).find('.time').text().trim();
    const status   = $(el).find('.operationAttribute').text().trim();
    const location = $(el).find('.operationPlace').text().trim();
    if (status) {
      events.push({ date, time, status, location });
    }
  });

  return events;
}

module.exports = trackParcel;
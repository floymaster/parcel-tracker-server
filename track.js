const fetch = require('node-fetch');
const fetchCookie = require('fetch-cookie');
const tough = require('tough-cookie');
const cheerio = require('cheerio');

// создаём jar и «оборачиваем» fetch
const jar = new tough.CookieJar();
const cookieFetch = fetchCookie(fetch, jar);

// заголовки, эмулирующие браузер
const HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
    'AppleWebKit/537.36 (KHTML, like Gecko) ' +
    'Chrome/114.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  'Connection': 'keep-alive'
};

async function trackParcel(code) {
  const base = 'https://track24.net';

  // 1) Захватим CF-куки
  await cookieFetch(base, { headers: HEADERS, timeout: 15000 });

  // 2) Открываем страницу с кодом
  const url = `${base}/?code=${encodeURIComponent(code)}`;
  const resp = await cookieFetch(url, { headers: HEADERS, timeout: 20000 });
  if (!resp.ok) throw new Error(`Failed to load page: ${resp.status}`);

  // 3) Парсим HTML
  const html = await resp.text();
  const $ = cheerio.load(html);
  const events = [];

  $('#trackingEvents .trackingInfoRow').each((_, el) => {
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
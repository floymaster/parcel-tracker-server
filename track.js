// track.js
const cheerio = require('cheerio');
const axios = require('axios').default;
const tough = require('tough-cookie');
const { wrapper } = require('axios-cookiejar-support');

// Создаём cookie-банку и «оборачиваем» axios
const jar = new tough.CookieJar();
const client = wrapper(axios.create({ jar, withCredentials: true }));

// Обёртка для единого набора заголовков
const defaultHeaders = {
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

  // 1) Зайдём на главную, чтобы получить CF-куки
  await client.get(base, { headers: defaultHeaders, timeout: 15000 });

  // 2) Зайдём на страницу с трек-кодом
  const url = `${base}/?code=${encodeURIComponent(code)}`;
  const resp = await client.get(url, {
    headers: defaultHeaders,
    timeout: 20000
  });

  if (resp.status !== 200) {
    throw new Error(`Failed to load page: ${resp.status}`);
  }

  // 3) Парсим HTML
  const $ = cheerio.load(resp.data);
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
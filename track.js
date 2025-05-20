const nodeFetch = require('node-fetch');
const fetchCookie = require('fetch-cookie/node-fetch');
const { CookieJar } = require('tough-cookie');

const jar = new CookieJar();
const fetch = fetchCookie(nodeFetch, jar);

const HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
    'AppleWebKit/537.36 (KHTML, like Gecko) ' +
    'Chrome/114.0.0.0 Safari/537.36',
  'Accept': 'application/json, text/plain, */*',
  'Accept-Language': 'en-US,en;q=0.9',
  'Origin': 'https://track24.net',
  'Referer': 'https://track24.net/'
};

async function trackParcel(code) {
  const base = 'https://track24.net';

  // 1) Инициализируем куки, заходя на главную
  await fetch(base, { headers: HEADERS, timeout: 15000 });

  // 2) Бьем по JSON API
  const apiUrl = `${base}/service/track/tracking/${encodeURIComponent(code)}`;
  const resp = await fetch(apiUrl, { headers: HEADERS, timeout: 15000 });

  if (!resp.ok) {
    throw new Error(`Failed to load JSON API: ${resp.status}`);
  }

  const json = await resp.json();
  const eventsRaw =
    (json.data?.data?.events) ||
    (json.data?.events) ||
    [];

  // Маппим в формат для popup.js
  return eventsRaw.map(ev => ({
    status:   ev.status || ev.event || '',
    date:     ev.date   || (ev.dateTime ? ev.dateTime.split(' ')[0] : ''),
    time:     ev.time   || (ev.dateTime ? ev.dateTime.split(' ')[1] : ''),
    location: ev.location || ev.city || ''
  }));
}

module.exports = trackParcel;
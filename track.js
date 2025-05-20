const got = require('got');
const { CookieJar } = require('tough-cookie');

// Собираем CookieJar и создаём клиента got, который его юзает
const jar = new CookieJar();
const client = got.extend({
  cookieJar: jar,
  // не будем автоматически переваривать JSON, нам нужен текст 1-го запроса
  responseType: 'json', 
  timeout: { request: 20000 },
  headers: {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
      'AppleWebKit/537.36 (KHTML, like Gecko) ' +
      'Chrome/114.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'en-US,en;q=0.9'
  },
  retry: 0
});

const BASE = 'https://track24.net';

async function trackParcel(code) {
  // 1) Захватываем Cloudflare-cookies на главной странице
  //    здесь responseType: 'json' не нужен, но got.extend уже установил
  //    поймаем текст, чтобы CF-челлендж закешировал куки
  try {
    await client.get(BASE, { responseType: 'text' });
  } catch (e) {
    console.warn('Warning: main page fetch failed:', e.message);
    // иногда можно игнорировать, если защита не срабатывает
  }

  // 2) Бьём по JSON-эндпоинту с теми же куками
  const url = `${BASE}/service/track/tracking/${encodeURIComponent(code)}`;
  const resp = await client.get(url, { responseType: 'json' });

  if (resp.statusCode !== 200) {
    throw new Error(`Failed to load JSON API: ${resp.statusCode}`);
  }

  const json = resp.body;
  const eventsRaw =
    (json.data?.data?.events) ||
    (json.data?.events) ||
    [];

  // 3) Маппим в формат {date,time,status,location}
  return eventsRaw.map(ev => ({
    status:   ev.status   || ev.event   || '',
    date:     ev.date     || (ev.dateTime ? ev.dateTime.split(' ')[0] : ''),
    time:     ev.time     || (ev.dateTime ? ev.dateTime.split(' ')[1] : ''),
    location: ev.location || ev.city     || ''
  }));
}

module.exports = trackParcel;
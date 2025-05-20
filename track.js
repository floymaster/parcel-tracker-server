// track.js

const cloudscraper = require('cloudscraper');

async function trackParcel(code) {
  // Собираем URL внутреннего JSON-API Track24
  const url = `https://track24.net/service/track/tracking/${encodeURIComponent(code)}`;

  // Делаем запрос через cloudscraper (он обходит Cloudflare-защиту)
  const json = await cloudscraper({
    method:  'GET',
    url:     url,
    json:    true,
    gzip:    true,
    timeout: 20000,
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
        'AppleWebKit/537.36 (KHTML, like Gecko) ' +
        'Chrome/114.0.0.0 Safari/537.36',
      'Accept':           'application/json, text/plain, */*',
      'Origin':           'https://track24.net',
      'Referer':          'https://track24.net/',
      'X-Requested-With': 'XMLHttpRequest'
    }
  });

  // Внутри ответа события лежат в одной из этих веток
  const eventsRaw =
    (json.data?.data?.events) ||
    (json.data?.events) ||
    [];

  // Мапим на формат, который ждёт ваше popup.js
  const events = eventsRaw.map(ev => ({
    status:   ev.status   || ev.event   || '',
    date:     ev.date     || (ev.dateTime ? ev.dateTime.split(' ')[0] : ''),
    time:     ev.time     || (ev.dateTime ? ev.dateTime.split(' ')[1] : ''),
    location: ev.location || ev.city     || ''
  }));

  return events;
}

module.exports = trackParcel;
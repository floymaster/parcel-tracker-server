// track.js

const cloudscraper = require('cloudscraper');

async function trackParcel(code) {
  // URL внутреннего JSON-API Track24
  const url = `https://track24.net/service/track/tracking/${encodeURIComponent(code)}`;

  // Делаем запрос через cloudscraper.get, чтобы обойти защиту
  const json = await cloudscraper.get({
    url:     url,
    method:  'GET',
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

  // В ответе события могут лежать в data.data.events или data.events
  const eventsRaw =
    json.data?.data?.events ||
    json.data?.events ||
    [];

  // Приводим к нужному формату
  return eventsRaw.map(ev => ({
    status:   ev.status   || ev.event   || '',
    date:     ev.date     || (ev.dateTime ? ev.dateTime.split(' ')[0] : ''),
    time:     ev.time     || (ev.dateTime ? ev.dateTime.split(' ')[1] : ''),
    location: ev.location || ev.city     || ''
  }));
}

module.exports = trackParcel;
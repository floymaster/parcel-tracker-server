const cloudscraper = require('cloudscraper');

async function trackParcel(code) {
  const url = `https://track24.net/service/track/tracking/${encodeURIComponent(code)}`;

  // стучимся прямо в JSON API, минуя браузерную защиту
  const json = await cloudscraper.get({
    uri: url,
    json:    true,
    gzip:    true,
    timeout: 20000,
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
        'AppleWebKit/537.36 (KHTML, like Gecko) ' +
        'Chrome/114.0.0.0 Safari/537.36',
      'Accept':             'application/json, text/plain, */*',
      'Origin':             'https://track24.net',
      'Referer':            'https://track24.net/',
      'X-Requested-With':   'XMLHttpRequest'
    }
  });

  // путь к событиям бывает в json.data.data.events или в json.data.events
  const eventsRaw =
    (json.data?.data?.events) ||
    (json.data?.events) ||
    [];

  return eventsRaw.map(ev => ({
    status:   ev.status || ev.event || '',
    date:     ev.date   || (ev.dateTime ? ev.dateTime.split(' ')[0] : ''),
    time:     ev.time   || (ev.dateTime ? ev.dateTime.split(' ')[1] : ''),
    location: ev.location || ev.city || ''
  }));
}

module.exports = trackParcel;
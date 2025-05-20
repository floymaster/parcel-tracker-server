// track.js
const fetch = require('node-fetch');

async function trackParcel(code) {
  const url = `https://track24.net/service/track/tracking/${encodeURIComponent(code)}`;

  const res = await fetch(url, {
    headers: {
      // Обязательные заголовки
      'Accept': 'application/json, text/plain, */*',
      'Origin': 'https://track24.net',
      'Referer': 'https://track24.net/',
      // Сменим User-Agent на реальный браузерный
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
        'AppleWebKit/537.36 (KHTML, like Gecko) ' +
        'Chrome/114.0.0.0 Safari/537.36',
      // иногда без этого не пашет, но чаще достаточно первых трёх
      'X-Requested-With': 'XMLHttpRequest'
    }
  });

  if (!res.ok) {
    throw new Error(`Failed to load JSON API: ${res.status}`);
  }

  const json = await res.json();
  // Путь к событиям может быть либо json.data.data.events, либо json.data.events
  const eventsRaw =
    (json.data && json.data.data && json.data.data.events) ||
    (json.data && json.data.events) ||
    [];

  // Мапим в вид, который ждёт popup.js
  const events = eventsRaw.map(ev => ({
    status: ev.status || ev.event || '',
    date:
      ev.date ||
      (ev.dateTime ? ev.dateTime.split(' ')[0] : '') ||
      '',
    time:
      ev.time ||
      (ev.dateTime ? ev.dateTime.split(' ')[1] : '') ||
      '',
    location: ev.location || ev.city || ''
  }));

  return events;
}

module.exports = trackParcel;
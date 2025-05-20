const fetch = require('node-fetch');
const cheerio = require('cheerio');

async function trackParcel(code) {
  const url = `https://track24.net/?code=${encodeURIComponent(code)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load page: ${res.status}`);
  const html = await res.text();
  const $ = cheerio.load(html);

  const rows = $('#trackingEvents .trackingInfoRow');
  const events = [];

  rows.each((i, row) => {
    const date     = $(row).find('.date b').text().trim();
    const time     = $(row).find('.time').text().trim();
    const status   = $(row).find('.operationAttribute').text().trim();
    const location = $(row).find('.operationPlace').text().trim();
    if (status) events.push({ date, time, status, location });
  });

  return events;
}

module.exports = trackParcel;
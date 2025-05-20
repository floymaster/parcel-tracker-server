const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
app.use(cors()); // откроем всем доступ

// GET /track?code=XXXX
app.get('/track', async (req, res) => {
  const code = req.query.code;
  if (!code) {
    return res.status(400).json({ error: 'Missing code parameter' });
  }

  try {
    // Проксируем запрос к Track24 API
    const upstream = await fetch(`https://track24.net/service/track/tracking/${encodeURIComponent(code)}`);
    if (!upstream.ok) {
      return res.status(upstream.status).json({ error: 'Error from track24.net' });
    }

    const json = await upstream.json();

    // Предположим, что response имеет структуру { data: { data: { events: [...] } } }
    // Подтяните актуальный путь к событиям в вашем случае
    const eventsRaw = json.data?.data?.events || [];

    // Маппим в вид, который хочет ваш popup.js
    const events = eventsRaw.map(ev => ({
      status: ev.status,      // или ev.event
      date: ev.date,          // или разбить по `ev.dateTime`
      time: ev.time,
      location: ev.location   // или ev.city / ev.country
    }));

    return res.json(events);
  } catch (err) {
    console.error('Tracking error:', err);
    return res.status(500).json({ error: 'Server error', details: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Parcel tracker server started on port ${PORT}`));
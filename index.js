const express = require('express');
const cors = require('cors');
const trackParcel = require('./track');

const app = express();
app.use(cors());

app.get('/track', async (req, res) => {
  const code = req.query.code;
  if (!code) {
    return res.status(400).json({ error: 'Missing "code" parameter' });
  }

  try {
    const events = await trackParcel(code);
    if (!events || !events.length) {
      return res.json([]);  // позволим фронту показать «не найдено»
    }
    return res.json(events);
  } catch (err) {
    console.error('⛔ Tracking failed:', err);
    return res.status(500).json({
      error: 'Failed to fetch or parse parcel data',
      details: err.message
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`📦 Parcel tracker listening on port ${PORT}`);
});
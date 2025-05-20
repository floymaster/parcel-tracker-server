const express = require('express');
const cors = require('cors');
const trackParcel = require('./track');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.get('/', (req, res) => {
  res.send('🚀 Parcel Tracker API is running');
});

app.get('/track', async (req, res) => {
  const code = req.query.tracking;
  if (!code) {
    return res.status(400).json({ error: 'Missing tracking number' });
  }

  try {
    const data = await trackParcel(code);
    res.json({ trackingNumber: code, events: data });
  } catch (err) {
    console.error('❌ Error during tracking:', err.message);
    res.status(500).json({ error: 'Failed to track the parcel' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});

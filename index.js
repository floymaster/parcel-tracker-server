const express = require('express');
const cors = require('cors');
const trackParcel = require('./track');

const app = express();
app.use(cors());

app.get('/track', async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).json({ error: 'Missing code' });
  try {
    const events = await trackParcel(code);
    return res.json(events);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
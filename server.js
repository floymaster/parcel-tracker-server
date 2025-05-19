const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.get('/track', async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).send({ error: 'No code provided' });

  try {
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.goto(`https://track24.net/service/track/tracking/${code}`, { waitUntil: 'networkidle2' });

    const data = await page.evaluate(() => {
      const events = [];
      document.querySelectorAll('#trackingEvents .trackingInfoRow').forEach(row => {
        const date = row.querySelector('.date')?.textContent?.trim();
        const time = row.querySelector('.time')?.textContent?.trim();
        const status = row.querySelector('.operationAttribute')?.textContent?.trim();
        const location = row.querySelector('.operationPlace')?.textContent?.trim();
        if (date && status) {
          events.push({ date, time, status, location });
        }
      });
      return events;
    });

    await browser.close();
    res.json(data);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send({ error: 'Failed to fetch tracking info' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});

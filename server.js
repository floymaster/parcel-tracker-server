const express = require('express');
const { chromium } = require('playwright'); // встроенный Chromium

const app = express();
const PORT = process.env.PORT || 3000;

// Корневая проверка
app.get('/', (req, res) => {
  res.send('🚀 Parcel Tracker Server is running!');
});

// Пример запроса от расширения: ?tracking=123456789
app.get('/track', async (req, res) => {
  const trackingNumber = req.query.tracking;
  if (!trackingNumber) {
    return res.status(400).send('Missing tracking number');
  }

  try {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    // 💡 Здесь ты подставляешь URL нужного почтового сервиса
    await page.goto('https://www.google.com');

    // Это просто заглушка. Вместо этого делай то, что нужно (поиск посылки, парсинг и т.д.)
    const title = await page.title();

    await browser.close();

    res.json({
      trackingNumber,
      status: 'Example OK',
      pageTitle: title
    });
  } catch (err) {
    console.error('Tracking error:', err);
    res.status(500).send('Tracking failed');
  }
});

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});

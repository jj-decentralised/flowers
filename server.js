require('dotenv').config();

const express = require('express');
const { getFlower, getContext } = require('./lib/flower-service');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(__dirname));

app.get('/api/flower', async (req, res) => {
  try {
    const data = await getFlower({ force: req.query.force === '1' });
    res.json(data);
  } catch (err) {
    console.error('Flower generation failed:', err.message);
    res.status(500).json({
      error: err.message,
      hint: 'Set RECRAFT_API_KEY in .env and ensure your Recraft account has API credits.'
    });
  }
});

app.get('/api/context', async (_req, res) => {
  try {
    res.json(await getContext());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log('Flowers for Vyshnavi → http://localhost:' + PORT);
  if (!process.env.RECRAFT_API_KEY) {
    console.warn('Warning: RECRAFT_API_KEY is not set. Flower generation will fail until you add it.');
  }
});

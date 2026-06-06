require('dotenv').config();

const fs = require('fs');
const path = require('path');
const express = require('express');
const { gatherFlowerContext, MONTHS } = require('./lib/context');
const { buildRecraftPrompt } = require('./lib/prompt');
const { generateFlowerImage } = require('./lib/recraft');

const app = express();
const PORT = process.env.PORT || 3000;
const CACHE_DIR = path.join(__dirname, 'cache', 'flowers');

fs.mkdirSync(CACHE_DIR, { recursive: true });

function cachePath(dateKey) {
  return path.join(CACHE_DIR, dateKey + '.json');
}

function readCache(dateKey) {
  const file = cachePath(dateKey);
  if (!fs.existsSync(file)) return null;
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return null;
  }
}

function writeCache(dateKey, payload) {
  fs.writeFileSync(cachePath(dateKey), JSON.stringify(payload, null, 2));
}

app.use(express.static(__dirname));

app.get('/api/flower', async (req, res) => {
  try {
    const force = req.query.force === '1';
    const { ctx, caption } = await gatherFlowerContext();
    const dateKey = ctx.dateKey;

    if (!force) {
      const cached = readCache(dateKey);
      if (cached) {
        return res.json({
          ...cached,
          cached: true,
          dateLine: MONTHS[ctx.now.getMonth()] + ' ' + ctx.now.getDate() + ', ' + ctx.now.getFullYear()
        });
      }
    }

    const prompt = buildRecraftPrompt(ctx);
    const image = await generateFlowerImage(prompt);
    const imageUrl = image.b64_json
      ? 'data:image/png;base64,' + image.b64_json
      : image.url;

    const payload = {
      imageUrl,
      caption,
      prompt,
      model: 'recraftv4',
      dateKey,
      seed: ctx.seed,
      isBirthday: ctx.isBirthday,
      dateLine: MONTHS[ctx.now.getMonth()] + ' ' + ctx.now.getDate() + ', ' + ctx.now.getFullYear()
    };

    writeCache(dateKey, payload);

    res.json({
      ...payload,
      cached: false
    });
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
    const { ctx, caption } = await gatherFlowerContext();
    res.json({
      caption,
      dateKey: ctx.dateKey,
      seed: ctx.seed,
      isBirthday: ctx.isBirthday,
      prompt: buildRecraftPrompt(ctx),
      dateLine: MONTHS[ctx.now.getMonth()] + ' ' + ctx.now.getDate() + ', ' + ctx.now.getFullYear()
    });
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

const fs = require('fs');
const path = require('path');
const { gatherFlowerContext, MONTHS } = require('./context');
const { buildRecraftPrompt } = require('./prompt');
const { generateFlowerImage } = require('./recraft');

const LOCAL_CACHE_DIR = path.join(__dirname, '..', 'cache', 'flowers');
const isVercel = !!process.env.VERCEL;

function localCachePath(dateKey) {
  return path.join(LOCAL_CACHE_DIR, dateKey + '.json');
}

function readLocalCache(dateKey) {
  const file = localCachePath(dateKey);
  if (!fs.existsSync(file)) return null;
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return null;
  }
}

function writeLocalCache(dateKey, payload) {
  fs.mkdirSync(LOCAL_CACHE_DIR, { recursive: true });
  fs.writeFileSync(localCachePath(dateKey), JSON.stringify(payload));
}

async function readBlobCache(dateKey) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return null;

  try {
    const { head } = await import('@vercel/blob');
    const meta = await head('flowers/' + dateKey + '.json');
    const res = await fetch(meta.url);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function writeBlobCache(dateKey, payload) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return payload;

  const { put } = await import('@vercel/blob');
  let imageUrl = payload.imageUrl;

  if (imageUrl && !imageUrl.startsWith('data:') && !imageUrl.includes('blob.vercel-storage.com')) {
    const imageRes = await fetch(imageUrl);
    if (imageRes.ok) {
      const buffer = Buffer.from(await imageRes.arrayBuffer());
      const uploaded = await put('flowers/' + dateKey + '.png', buffer, {
        access: 'public',
        contentType: 'image/png',
        addRandomSuffix: false,
        allowOverwrite: true
      });
      imageUrl = uploaded.url;
    }
  }

  const stored = { ...payload, imageUrl };
  await put('flowers/' + dateKey + '.json', JSON.stringify(stored), {
    access: 'public',
    contentType: 'application/json',
    addRandomSuffix: false,
    allowOverwrite: true
  });

  return stored;
}

async function readCache(dateKey) {
  if (isVercel) {
    return readBlobCache(dateKey);
  }
  return readLocalCache(dateKey);
}

async function writeCache(dateKey, payload) {
  if (isVercel) {
    return writeBlobCache(dateKey, payload);
  }
  writeLocalCache(dateKey, payload);
  return payload;
}

function secondsUntilSingaporeMidnight(now = new Date()) {
  const singaporeNow = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Singapore' }));
  const singaporeEnd = new Date(singaporeNow);
  singaporeEnd.setHours(24, 0, 0, 0);
  return Math.max(300, Math.floor((singaporeEnd - singaporeNow) / 1000));
}

function formatDateLine(now) {
  const singapore = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Singapore' }));
  return MONTHS[singapore.getMonth()] + ' ' + singapore.getDate() + ', ' + singapore.getFullYear();
}

async function getFlower({ force = false } = {}) {
  const { ctx, caption } = await gatherFlowerContext();
  const dateKey = ctx.dateKey;
  const dateLine = formatDateLine(ctx.now);

  if (!force) {
    const cached = await readCache(dateKey);
    if (cached) {
      return {
        ...cached,
        cached: true,
        dateLine
      };
    }
  }

  const prompt = buildRecraftPrompt(ctx);
  const image = await generateFlowerImage(prompt, {
    response_format: isVercel ? 'url' : 'b64_json'
  });

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
    dateLine
  };

  const stored = await writeCache(dateKey, payload);

  return {
    ...stored,
    cached: false
  };
}

async function getContext() {
  const { ctx, caption } = await gatherFlowerContext();
  return {
    caption,
    dateKey: ctx.dateKey,
    seed: ctx.seed,
    isBirthday: ctx.isBirthday,
    prompt: buildRecraftPrompt(ctx),
    dateLine: formatDateLine(ctx.now)
  };
}

module.exports = {
  getFlower,
  getContext,
  secondsUntilSingaporeMidnight
};

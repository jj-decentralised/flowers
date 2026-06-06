const RECRAFT_API_URL = 'https://external.api.recraft.ai/v1/images/generations';

// Recraft V4 portrait sizes (V3's 1024x1280 is not supported on V4)
const V4_SIZES = {
  recraftv4: '832x1280',
  recraftv4_1: '832x1280',
  recraftv4_pro: '1664x2560',
  recraftv4_1_pro: '1664x2560'
};

function defaultSize(model) {
  return V4_SIZES[model] || '2:3';
}

async function generateFlowerImage(prompt, options = {}) {
  const apiKey = process.env.RECRAFT_API_KEY;
  if (!apiKey) {
    throw new Error('RECRAFT_API_KEY is not set. Add it to your .env file.');
  }

  const model = options.model || 'recraftv4';

  const body = {
    prompt,
    model,
    size: options.size || defaultSize(model),
    n: 1,
    response_format: options.response_format || 'b64_json'
  };

  const res = await fetch(RECRAFT_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + apiKey
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error('Recraft API error (' + res.status + '): ' + errText);
  }

  const data = await res.json();
  const image = data.data && data.data[0];
  if (!image) {
    throw new Error('Recraft API returned no image data');
  }

  return image;
}

module.exports = { generateFlowerImage };

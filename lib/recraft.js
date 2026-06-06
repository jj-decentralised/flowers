const RECRAFT_API_URL = 'https://external.api.recraft.ai/v1/images/generations';

async function generateFlowerImage(prompt, options = {}) {
  const apiKey = process.env.RECRAFT_API_KEY;
  if (!apiKey) {
    throw new Error('RECRAFT_API_KEY is not set. Add it to your .env file.');
  }

  const body = {
    prompt,
    model: options.model || 'recraftv4',
    size: options.size || '1024x1280',
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

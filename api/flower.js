const { getFlower, secondsUntilSingaporeMidnight } = require('../lib/flower-service');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const force = req.query.force === '1';
    const preview = req.query.preview === '1';
    const data = await getFlower({ force, preview });

    res.setHeader('Cache-Control', (force || preview)
      ? 'no-store'
      : 'public, s-maxage=' + secondsUntilSingaporeMidnight() + ', stale-while-revalidate=3600'
    );

    return res.status(200).json(data);
  } catch (err) {
    console.error('Flower generation failed:', err.message);
    return res.status(500).json({
      error: err.message,
      hint: 'Add RECRAFT_API_KEY in Vercel project Settings → Environment Variables.'
    });
  }
};

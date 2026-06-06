const { getFlower } = require('../../lib/flower-service');

module.exports = async function handler(req, res) {
  const authHeader = req.headers.authorization;
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== 'Bearer ' + cronSecret) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const data = await getFlower({ force: false });
    return res.status(200).json({
      ok: true,
      dateKey: data.dateKey,
      cached: data.cached,
      isBirthday: data.isBirthday
    });
  } catch (err) {
    console.error('Cron flower generation failed:', err.message);
    return res.status(500).json({ error: err.message });
  }
};

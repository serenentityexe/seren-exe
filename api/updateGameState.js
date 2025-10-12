import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export default async function handler(req, res) {
  try {
    const { password, gameAvailable } =
      typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

    if (password !== 'Seren1987') {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    await redis.set('gameActive', gameAvailable ? 'true' : 'false');
    res.status(200).json({ success: true, gameAvailable });
  } catch (e) {
    console.error('Error updating game state:', e);
    res.status(500).json({ success: false, error: 'Error updating game state' });
  }
}

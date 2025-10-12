import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export default async function handler(req, res) {
  try {
    const gameActive = await redis.get('gameActive');
    res.status(200).json({ gameAvailable: gameActive === 'true' });
  } catch (e) {
    console.error('Error fetching game state:', e);
    res.status(500).json({ success: false, error: 'Error fetching game state' });
  }
}

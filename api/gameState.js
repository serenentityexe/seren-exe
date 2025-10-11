import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const state = await redis.get('gameState');
      res.status(200).json({ status: state || 'off' });
    } catch (error) {
      console.error('Error fetching game state:', error);
      res.status(500).json({ error: 'Error fetching game state' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

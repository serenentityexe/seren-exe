import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const currentState = await redis.get('gameState');
      const newState = currentState === 'on' ? 'off' : 'on';
      await redis.set('gameState', newState);
      console.log('Game state updated to:', newState);
      res.status(200).json({ status: newState });
    } catch (error) {
      console.error('Error updating game state:', error);
      res.status(500).json({ error: 'Error updating game state' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

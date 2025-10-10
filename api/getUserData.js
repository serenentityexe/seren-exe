import { Redis } from '@upstash/redis';
const redis = new Redis({ url: process.env.UPSTASH_REDIS_REST_URL, token: process.env.UPSTASH_REDIS_REST_TOKEN });

export default async function handler(req,res){
  const { userId } = req.query;
  if(!userId) return res.status(400).json({error:'Missing userId'});
  const data = await redis.get(`user:${userId}`);
  res.status(200).json({userData: data ? JSON.parse(data) : null});
}

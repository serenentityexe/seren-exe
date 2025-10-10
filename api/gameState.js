import { Redis } from '@upstash/redis';
const redis = new Redis({ url: process.env.UPSTASH_REDIS_REST_URL, token: process.env.UPSTASH_REDIS_REST_TOKEN });

export default async function handler(req,res){
  try{
    const gameAvailable = await redis.get('gameActive');
    res.status(200).json({gameAvailable:gameAvailable===true});
  }catch(e){ res.status(500).json({error:'SERVER ERROR'});}
}

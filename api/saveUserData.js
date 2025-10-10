import { Redis } from '@upstash/redis';
const redis = new Redis({ url: process.env.UPSTASH_REDIS_REST_URL, token: process.env.UPSTASH_REDIS_REST_TOKEN });

export default async function handler(req,res){
  try{
    const { userId, userData } = await req.json?.() || await req.body;
    if(!userId || !userData) return res.status(400).json({error:'Missing data'});
    await redis.set(`user:${userId}`, JSON.stringify(userData));
    res.status(200).json({success:true});
  }catch(e){ res.status(500).json({error:'SERVER ERROR'});}
}

import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export default async function handler(req, res) {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: "Missing userId" });

  try {
    const userData = await redis.get(`user:${userId}`);
    return res.status(200).json({ userData: userData || {} });
  } catch (err) {
    console.error("Error fetching user data:", err);
    return res.status(500).json({ error: "Failed to fetch user data" });
  }
}

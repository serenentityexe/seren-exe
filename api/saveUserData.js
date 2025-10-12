import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REST_TOKEN,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { userId, userData } = req.body;
  if (!userId || !userData) {
    return res.status(400).json({ error: "Missing userId or userData" });
  }

  try {
    await redis.set(`user:${userId}`, userData);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error saving user data:", error);
    res.status(500).json({ success: false, error: "Error saving user data" });
  }
}

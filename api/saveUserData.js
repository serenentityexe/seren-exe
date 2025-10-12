import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { userId, data } = req.body;
    if (!userId) return res.status(400).json({ error: "Missing userId" });

    await redis.set(`user:${userId}`, JSON.stringify(data));
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Error saving user data:", err);
    return res.status(500).json({ error: "Failed to save user data" });
  }
}

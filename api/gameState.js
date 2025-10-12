import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export default async function handler(req, res) {
  try {
    const state = await redis.get("gameAvailable");
    const gameAvailable = state === "true";
    return res.status(200).json({ gameAvailable });
  } catch (err) {
    console.error("❌ Error fetching game state:", err);
    return res.status(500).json({ error: "Failed to fetch game state" });
  }
}

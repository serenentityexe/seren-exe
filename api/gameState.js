import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export default async function handler(req, res) {
  try {
    let gameAvailable = await redis.get("gameAvailable");
    if (gameAvailable === null) {
      await redis.set("gameAvailable", false);
      gameAvailable = false;
    }
    res.status(200).json({ gameAvailable });
  } catch (error) {
    console.error("Error fetching game state:", error);
    res.status(500).json({ error: "Error fetching game state" });
  }
}

import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { password, gameAvailable } = req.body;

  if (password !== "Seren1987") {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    await redis.set("gameAvailable", gameAvailable);
    const current = await redis.get("gameAvailable");
    res.status(200).json({ success: true, gameAvailable: current });
  } catch (error) {
    console.error("Error updating game state:", error);
    res.status(500).json({ success: false, error: "Error updating game state" });
  }
}


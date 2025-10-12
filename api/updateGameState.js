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
    const { password, gameAvailable } = req.body;

    if (password !== "Seren1987") {
      return res.status(403).json({ error: "Invalid password" });
    }

    await redis.set("gameAvailable", gameAvailable ? "true" : "false");
    return res.status(200).json({ success: true, gameAvailable });
  } catch (err) {
    console.error("❌ Error updating game state:", err);
    return res.status(500).json({ error: "Failed to update game state" });
  }
}

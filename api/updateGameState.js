import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: "https://busy-toad-11432.upstash.io",
  token: "ASyoAAIncDIxOWE2YTAyYzUzODE0MzEzYjdkODI2NDlkMzE0MzU1Y3AyMTE0MzI",
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
    console.log("Game state updated:", current);
    res.status(200).json({ success: true, gameAvailable: current });
  } catch (error) {
    console.error("Error updating game state:", error);
    res.status(500).json({ success: false, error: "Error updating game state" });
  }
}

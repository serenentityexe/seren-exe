import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: "https://busy-toad-11432.upstash.io",
  token: "ASyoAAIncDIxOWE2YTAyYzUzODE0MzEzYjdkODI2NDlkMzE0MzU1Y3AyMTE0MzI",
});

export default async function handler(req, res) {
  try {
    let gameAvailable = await redis.get("gameAvailable");
    if (gameAvailable === null) {
      // Se non esiste ancora, inizializza a OFF
      await redis.set("gameAvailable", false);
      gameAvailable = false;
    }
    res.status(200).json({ gameAvailable });
  } catch (error) {
    console.error("Error fetching game state:", error);
    res.status(500).json({ error: "Error fetching game state" });
  }
}

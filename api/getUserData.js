import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: "https://busy-toad-11432.upstash.io",
  token: "ASyoAAIncDIxOWE2YTAyYzUzODE0MzEzYjdkODI2NDlkMzE0MzU1Y3AyMTE0MzI",
});

export default async function handler(req, res) {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: "Missing userId" });

  try {
    const userData = await redis.get(`user:${userId}`);
    res.status(200).json({ userData: userData || null });
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ error: "Error fetching user data" });
  }
}

import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: "https://busy-toad-11432.upstash.io",
  token: "ASyoAAIncDIxOWE2YTAyYzUzODE0MzEzYjdkODI2NDlkMzE0MzU1Y3AyMTE0MzI",
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

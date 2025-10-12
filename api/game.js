import fetch from "node-fetch";

// Variabili ambiente Vercel
const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

export default async function handler(req, res) {
  const { method } = req;

  if (!UPSTASH_URL || !UPSTASH_TOKEN) {
    return res.status(500).json({ error: "Upstash config missing" });
  }

  const headers = {
    Authorization: `Bearer ${UPSTASH_TOKEN}`,
    "Content-Type": "application/json",
  };

  try {
    if (method === "GET") {
      const response = await fetch(`${UPSTASH_URL}/get/gameActive`, { headers });
      const data = await response.json();
      const active = data.result === "true";
      res.status(200).json({ gameActive: active });
    } else if (method === "POST") {
      const { gameActive } = req.body;
      if (typeof gameActive !== "boolean") return res.status(400).json({ error: "gameActive must be boolean" });
      await fetch(`${UPSTASH_URL}/set/gameActive/${gameActive}`, { headers, method: "POST" });
      res.status(200).json({ gameActive });
    } else {
      res.setHeader("Allow", ["GET", "POST"]);
      res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

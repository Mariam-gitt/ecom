import { Router } from "express";
import { readCollection } from "../services/jsonStore.js";
import { parseVoiceQuery } from "../services/llmClient.js";

export const voiceSearchRouter = Router();

// POST /api/voice-search
// body: { transcript: "show me cheap electronics under 50 dollars" }
//
// Returns structured filters the frontend can apply directly to its
// existing category/sortBy/searchText state, PLUS minPrice/maxPrice
// (new — the old client-only version had no price parsing at all).
voiceSearchRouter.post("/", async (req, res) => {
  const { transcript } = req.body;

  if (!transcript || typeof transcript !== "string" || !transcript.trim()) {
    return res.status(400).json({ error: "transcript is required" });
  }

  const products = readCollection("products", []);
  const categories = [...new Set(products.map((p) => p.category))];

  try {
    const filters = await parseVoiceQuery(transcript.trim(), categories);
    res.json({ transcript, filters });
  } catch (err) {
    console.error("[voice-search] LLM parse failed:", err.message);
    // 502 = "we talked to an upstream service and it failed" — distinct
    // from a 400 (bad request from the client) or 500 (bug in our own
    // code). Lets the frontend distinguish "your mic input was fine,
    // but the AI step is down" and fall back gracefully instead of
    // showing a generic error.
    res.status(502).json({ error: "Could not interpret voice query", detail: err.message });
  }
});

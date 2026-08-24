/**
 * THE CONCEPT — natural language to structured query.
 *
 * A voice transcript like "show me cheap electronics under 50 dollars"
 * needs to become a small, fixed set of fields our filtering code can
 * actually use: { category, minPrice, maxPrice, sortBy, keywords }.
 * An LLM is well-suited to exactly this: not creative writing, just
 * flexible extraction — turning many different phrasings of the same
 * intent into the same structured shape.
 *
 * THIS VERSION USES GROQ — a hosted API (like Anthropic's or OpenAI's)
 * with a genuinely free tier, no credit card required to sign up. It
 * runs open-weight models (Llama, etc.) on very fast custom hardware,
 * so responses come back quickly even though it's a network call.
 * Groq's API is "OpenAI-compatible", meaning it accepts the same
 * request/response shape as OpenAI's Chat Completions API — that's
 * why this looks slightly different from the old Anthropic version
 * (messages array includes the system prompt directly, instead of a
 * separate `system` field; the reply is parsed from
 * choices[0].message.content instead of a content array).
 */

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

function buildSystemPrompt(categories) {
  return `You convert a spoken shopping search into a strict JSON filter object.

Valid categories (use EXACTLY one of these strings, or null if none fit):
${categories.map((c) => `- ${c}`).join("\n")}

Return ONLY a JSON object, no other text, matching this exact shape:
{
  "keywords": string | null,
  "category": string | null,
  "minPrice": number | null,
  "maxPrice": number | null,
  "sortBy": "price-asc" | "price-desc" | null
}

Rules:
- "keywords" should NOT include price phrases, category names already captured in "category", or filler words like "show me" / "find" / "search for".
- If the user says "under $50" or "less than 50 dollars", set maxPrice: 50.
- If the user says "over $20" or "more than 20", set minPrice: 20.
- If the user says "between 10 and 30", set minPrice: 10 and maxPrice: 30.
- "sortBy" is "price-asc" for cheap/affordable/lowest, "price-desc" for expensive/premium/highest, else null.
- Never invent a category that isn't in the valid list above.
- Output raw JSON only. No markdown fences, no explanation, no leading/trailing text.`;
}

export async function parseVoiceQuery(transcript, categories) {
  // Fail fast with a clear message rather than letting a missing key
  // surface as a confusing 401 from Groq's servers.
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not set — copy .env.example to .env and add your free key from console.groq.com.");
  }

  const model = process.env.GROQ_MODEL || "llama-3.1-8b-instant";

  const response = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // Bearer token auth — the standard for OpenAI-compatible APIs,
      // different from Anthropic's custom "x-api-key" header.
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        // OpenAI-style APIs fold the system prompt INTO the messages
        // array (role: "system") rather than passing it as a separate
        // top-level field like Anthropic's API does.
        { role: "system", content: buildSystemPrompt(categories) },
        { role: "user", content: transcript },
      ],
      // Tells Groq to constrain output to a valid JSON object — the
      // OpenAI-compatible equivalent of Anthropic's "respond with
      // JSON only" instruction-following, but enforced by the API
      // itself rather than relying purely on the prompt.
      response_format: { type: "json_object" },
      temperature: 0.1, // low temperature: consistent extraction, not creative variation
      max_tokens: 300, // the output is one small JSON object, not an essay
    }),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => "");
    throw new Error(`Groq API error ${response.status}: ${errText}`);
  }

  const data = await response.json();

  // OpenAI-compatible shape: an array of "choices", each with a
  // message object. We only ever ask for one completion, so [0].
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("No content in Groq response.");
  }

  // Defensive parsing: even with response_format: json_object, it's
  // cheap insurance to strip stray markdown fences before parsing, so
  // a rare malformed reply doesn't crash JSON.parse and take the
  // whole feature down with it.
  const cleaned = content.replace(/```json|```/g, "").trim();

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error(`Could not parse Groq response as JSON: ${cleaned.slice(0, 200)}`);
  }

  // Normalize shape defensively — never trust external input (even
  // from your own LLM call) to always have every key present and
  // correctly typed.
  return {
    keywords: parsed.keywords ?? null,
    category: parsed.category ?? null,
    minPrice: typeof parsed.minPrice === "number" ? parsed.minPrice : null,
    maxPrice: typeof parsed.maxPrice === "number" ? parsed.maxPrice : null,
    sortBy: parsed.sortBy === "price-asc" || parsed.sortBy === "price-desc" ? parsed.sortBy : null,
  };
}

import { readCollection, writeCollection, collectionExists } from "./jsonStore.js";

/**
 * The problem: the frontend used to call fakestoreapi.com directly,
 * from the browser, on every single page load. That has three real
 * costs:
 *   1. Every visitor depends on a third-party site's uptime.
 *   2. There's nowhere to add YOUR OWN products later — you're stuck
 *      with whatever fakestoreapi happens to serve.
 *   3. No server means no place to safely add things like an
 *      Anthropic API key (an API key in frontend code is visible to
 *      anyone who opens devtools — it must live on a server).
 *
 * The fix here is a classic "seed once, serve from our own store from
 * then on" pattern: on first boot, if we don't have a local products
 * collection yet, fetch fakestoreapi ONE time and save the result as
 * our own data. Every request after that is served from our own
 * store — no third party in the request path, and it's now trivial to
 * add/edit/remove products directly in data/products.json or, later,
 * from an admin dashboard.
 */
export async function ensureProductsSeeded() {
  if (collectionExists("products")) {
    const existing = readCollection("products", []);
    if (existing.length > 0) {
      console.log(`[seed] products.json already has ${existing.length} items — skipping fetch.`);
      return;
    }
  }

  console.log("[seed] No local product catalog found — fetching from fakestoreapi.com once...");
  try {
    const res = await fetch("https://fakestoreapi.com/products");
    if (!res.ok) throw new Error(`fakestoreapi responded ${res.status}`);
    const products = await res.json();
    writeCollection("products", products);
    console.log(`[seed] Saved ${products.length} products to data/products.json.`);
  } catch (err) {
    console.error("[seed] Could not seed products:", err.message);
    console.error("[seed] Starting with an empty catalog — add products manually to data/products.json.");
    writeCollection("products", []);
  }
}

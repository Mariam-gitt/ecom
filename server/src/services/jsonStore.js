import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Same __dirname trick you'd get for free in CommonJS — ESM doesn't
// have __dirname built in, so this recreates it from import.meta.url.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "..", "..", "data");

/**
 * A tiny file-based "database". This is the exact same concept as
 * loadCartFromStorage()/JSON.stringify in CartContext.jsx — read a
 * string, JSON.parse it into real data, mutate it in memory, then
 * JSON.stringify it back out — just using Node's `fs` module instead
 * of the browser's `localStorage`, since a server has a real
 * filesystem instead of per-browser storage.
 *
 * This is intentionally NOT a real database. It's fine for
 * development, a portfolio project, or low write-volume use. Two
 * requests writing at the exact same instant could clobber each
 * other's changes (there's no locking) — a real production store
 * (Postgres, MongoDB, etc.) solves that with transactions. Swapping
 * this out later only means rewriting THIS file — every route just
 * calls readCollection/writeCollection and doesn't know or care how
 * the data is actually persisted.
 */
export function readCollection(name, fallback = []) {
  const filePath = path.join(DATA_DIR, `${name}.json`);
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw);
  } catch {
    // File doesn't exist yet, or is corrupted — fail safe, same
    // pattern as loadCartFromStorage's try/catch on the frontend.
    return fallback;
  }
}

export function writeCollection(name, data) {
  const filePath = path.join(DATA_DIR, `${name}.json`);
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

export function collectionExists(name) {
  return fs.existsSync(path.join(DATA_DIR, `${name}.json`));
}

import "dotenv/config";
import express from "express";
import cors from "cors";
import { productsRouter } from "./routes/products.js";
import { ordersRouter } from "./routes/orders.js";
import { voiceSearchRouter } from "./routes/voiceSearch.js";
import { paymentsRouter } from "./routes/payments.js";
import { adminRouter } from "./routes/admin.js";
import { ensureProductsSeeded } from "./services/seed.js";

const app = express();
const PORT = process.env.PORT || 4000;

// cors() with no args allows every origin — fine for local dev, but
// worth tightening before deploying (restrict to your real frontend's
// domain via { origin: process.env.CLIENT_ORIGIN }).
app.use(cors({ origin: process.env.CLIENT_ORIGIN || "*" }));
app.use(express.json());

// Simple request log — nothing fancy, just enough to see what's
// hitting the server while developing.
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

app.use("/api/products", productsRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/voice-search", voiceSearchRouter);
app.use("/api/payments", paymentsRouter);
app.use("/api/admin", adminRouter);

// Catch-all error handler — any route that throws (or calls next(err))
// ends up here instead of crashing the whole server or hanging the
// request forever.
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

async function start() {
  await ensureProductsSeeded();
  app.listen(PORT, () => {
    console.log(`API running at http://localhost:${PORT}`);
  });
}

start();

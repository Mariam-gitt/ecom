import { Router } from "express";
import { randomUUID } from "node:crypto";
import { readCollection, writeCollection } from "../services/jsonStore.js";
import { requireAdmin } from "../middleware/adminAuth.js";

export const ordersRouter = Router();

/**
 * POST /api/orders — creates a new order.
 *
 * This is called at the START of checkout now (before payment), with
 * status "pending". The payment step (server/src/routes/payments.js)
 * is what later flips that same order's status to "paid", once Stripe
 * confirms the charge succeeded. Recording the order BEFORE payment,
 * rather than only after, means we still have a record even if the
 * customer abandons the Stripe checkout page — useful for an admin to
 * see "pending" orders that never completed.
 */
ordersRouter.post("/", (req, res) => {
  const { name, email, items } = req.body;

  if (!name?.trim() || !email?.trim()) {
    return res.status(400).json({ error: "Name and email are required." });
  }
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Cart is empty." });
  }

  const total = items.reduce((sum, item) => sum + item.price * item.qty, 0);

  const order = {
    id: randomUUID(),
    name: name.trim(),
    email: email.trim(),
    items,
    total: Number(total.toFixed(2)),
    status: "pending", // "pending" -> "paid" (payments.js) -> "shipped"/"cancelled" (admin, manually)
    createdAt: new Date().toISOString(),
  };

  const orders = readCollection("orders", []);
  orders.push(order);
  writeCollection("orders", orders);

  res.status(201).json(order);
});

// GET /api/orders — admin dashboard's order list.
// requireAdmin runs FIRST: if the x-admin-token header doesn't match
// ADMIN_PASSWORD, the request never reaches this handler at all — see
// middleware/adminAuth.js for what that check does.
ordersRouter.get("/", requireAdmin, (req, res) => {
  const orders = readCollection("orders", []);
  // Newest first — an admin almost always cares about recent orders
  // more than old ones, so sort here rather than making the frontend
  // do it every time it renders.
  const sorted = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(sorted);
});

// GET /api/orders/:id
// NOT behind requireAdmin — the checkout success page needs to read a
// single order right after a customer pays, before they've "logged
// in" as anyone. Safe in practice because the id is a random UUID
// (effectively unguessable), which acts like a one-time access token
// for that specific order. This is a reasonable tradeoff for a small
// project; a larger app would issue a short-lived, purpose-specific
// token instead of relying on the id itself being secret.
ordersRouter.get("/:id", (req, res) => {
  const orders = readCollection("orders", []);
  const order = orders.find((o) => o.id === req.params.id);
  if (!order) {
    return res.status(404).json({ error: "Order not found" });
  }
  res.json(order);
});

// PATCH /api/orders/:id — admin updates an order's status (e.g. mark
// "shipped" or "cancelled"). Also behind requireAdmin: this MUTATES
// data, so it needs at least as much protection as just reading it.
ordersRouter.patch("/:id", requireAdmin, (req, res) => {
  const { status } = req.body;
  const allowedStatuses = ["pending", "paid", "shipped", "cancelled"];

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ error: `status must be one of: ${allowedStatuses.join(", ")}` });
  }

  const orders = readCollection("orders", []);
  const index = orders.findIndex((o) => o.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: "Order not found" });
  }

  orders[index] = { ...orders[index], status };
  writeCollection("orders", orders);

  res.json(orders[index]);
});

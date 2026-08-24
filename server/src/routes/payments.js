import { Router } from "express";
import { randomUUID } from "node:crypto";
import { readCollection, writeCollection } from "../services/jsonStore.js";

export const paymentsRouter = Router();

/**
 * THE SITUATION: Stripe doesn't support Pakistan for account creation
 * (not even test mode), and every real Pakistani gateway (Safepay,
 * GoPayFast, JazzCash, etc.) requires business KYC before you even get
 * sandbox API keys — real paperwork, not something to sort out just to
 * test whether a checkout FEATURE works.
 *
 * THE FIX: a simulated gateway that mimics the exact same SHAPE as a
 * real one — "create a checkout session, redirect the customer to a
 * payment page, confirm payment, verify server-side before trusting
 * it" — without any real money, cards, or third-party account
 * anywhere. The concepts you're testing (hosted checkout instead of
 * collecting card data yourself, server-side verification instead of
 * trusting the redirect URL) are IDENTICAL to the real Stripe version
 * this replaced. Only the "who actually processes the money" part is
 * fake.
 *
 * THIS IS NOT A REAL PAYMENT GATEWAY. It doesn't touch real money,
 * doesn't validate a real card, and must never be used for a live
 * store. Its entire job is to let you test and understand the FLOW.
 * When you're ready to accept real payments, this file is the ONLY
 * one that needs to be rewritten — every route elsewhere in the app
 * just calls createCheckoutSession()/verify() by name and doesn't
 * know or care what's actually behind them (same reasoning as
 * llmClient.js being the one file that changes when swapping LLM
 * providers).
 */

// POST /api/payments/create-checkout-session
// body: { orderId: "..." }
//
// Looks up the "pending" order, creates a "session" record (our stand-
// in for what Stripe calls a Checkout Session), and returns a URL —
// just like the real version did. The only difference: this URL
// points to OUR OWN frontend's mock payment page, not stripe.com.
paymentsRouter.post("/create-checkout-session", (req, res) => {
  const { orderId } = req.body;
  const orders = readCollection("orders", []);
  const order = orders.find((o) => o.id === orderId);

  if (!order) {
    return res.status(404).json({ error: "Order not found." });
  }

  const session = {
    id: randomUUID(),
    orderId: order.id,
    amount: order.total,
    status: "pending", // -> "paid" once /mock-pay is called
    createdAt: new Date().toISOString(),
  };

  const sessions = readCollection("payment_sessions", []);
  sessions.push(session);
  writeCollection("payment_sessions", sessions);

  const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";
  // Real Stripe would return a stripe.com URL here. We return a URL on
  // OUR OWN frontend instead — src/pages/MockCheckoutPage.jsx renders
  // a fake "enter your card" screen and calls /mock-pay when the
  // pretend-customer clicks Pay.
  const url = `${clientOrigin}/mock-checkout?session_id=${session.id}&orderId=${order.id}`;

  res.json({ url });
});

// POST /api/payments/mock-pay
// body: { session_id: "..." }
//
// Stands in for "the customer successfully paid on the gateway's
// page" — called by MockCheckoutPage.jsx when its Pay button is
// clicked. A real gateway would only reach this point after actually
// validating a card and moving real money; here we just flip a status
// flag, since the whole point is testing the SURROUNDING flow, not
// building a real card processor.
paymentsRouter.post("/mock-pay", (req, res) => {
  const { session_id } = req.body;

  const sessions = readCollection("payment_sessions", []);
  const index = sessions.findIndex((s) => s.id === session_id);
  if (index === -1) {
    return res.status(404).json({ error: "Payment session not found." });
  }

  sessions[index] = { ...sessions[index], status: "paid" };
  writeCollection("payment_sessions", sessions);

  res.json({ ok: true });
});

// GET /api/payments/verify?session_id=...&orderId=...
//
// Called by CheckoutSuccessPage right after the mock payment page
// "completes". Same principle as the real version: we do NOT just
// trust that the browser landed on a success URL — anyone could type
// that URL in directly. We check OUR OWN session record's status
// instead of trusting the request itself, which is the same shape of
// check a real integration does against Stripe's records.
paymentsRouter.get("/verify", (req, res) => {
  const { session_id, orderId } = req.query;

  if (!session_id || !orderId) {
    return res.status(400).json({ error: "session_id and orderId are required." });
  }

  const sessions = readCollection("payment_sessions", []);
  const session = sessions.find((s) => s.id === session_id);

  if (!session) {
    return res.status(404).json({ error: "Payment session not found." });
  }
  if (session.orderId !== orderId) {
    return res.status(400).json({ error: "Session does not match this order." });
  }
  if (session.status !== "paid") {
    return res.status(402).json({ error: "Payment not completed.", status: session.status });
  }

  const orders = readCollection("orders", []);
  const index = orders.findIndex((o) => o.id === orderId);
  if (index === -1) {
    return res.status(404).json({ error: "Order not found." });
  }

  orders[index] = { ...orders[index], status: "paid" };
  writeCollection("orders", orders);

  res.json(orders[index]);
});

/**
 * SWAPPING IN A REAL GATEWAY LATER (e.g. Safepay, GoPayFast, once you
 * have a business account and real API keys):
 *   1. Replace the body of createCheckoutSession with a call to the
 *      real gateway's "create a checkout session/order" API — it'll
 *      return a URL on THEIR site, not ours.
 *   2. Remove /mock-pay entirely — real gateways call YOUR server via
 *      a webhook when payment completes, you don't simulate it.
 *   3. Rewrite /verify to check with the REAL gateway's API (or trust
 *      their webhook) instead of our own payment_sessions.json.
 * Nothing in orders.js, CheckoutForm.jsx, or CheckoutSuccessPage.jsx
 * needs to change — they only know about createCheckoutSession() and
 * verify() by name, not what's behind them.
 */

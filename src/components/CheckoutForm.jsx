import { useState } from "react";
import { api } from "../lib/api";

// CheckoutForm takes "cart" and "totalPrice" as props from
// CheckoutPage, since it needs to know what's being ordered.
//
// CHANGED (payment integration): submitting no longer finishes the
// order itself — it now does two backend calls, then leaves the page
// entirely:
//   1. api.createOrder(...)            -> creates a "pending" order
//   2. api.createCheckoutSession(id)   -> asks our (simulated)
//                                          gateway for a hosted
//                                          payment page for that order
//   3. window.location.href = url      -> sends the BROWSER there
//                                          (a real navigation, not a
//                                          fetch) — see
//                                          server/src/routes/payments.js
//                                          for why this is a mock
//                                          gateway right now, not a
//                                          real one (Stripe doesn't
//                                          support Pakistan; real
//                                          local gateways need
//                                          business KYC to even get
//                                          test keys)
//
// The cart is intentionally NOT cleared here anymore. It only clears
// on CheckoutSuccessPage, after the gateway confirms the payment
// actually went through — so if the customer abandons the payment
// page (closes the tab, hits back), their cart is still exactly as
// they left it.
export default function CheckoutForm({ cart, totalPrice }) {
  const [formData, setFormData] = useState({ name: "", email: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim()) {
      setError("Both fields are required.");
      return;
    }
    if (cart.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      // Step 1: record the order server-side, status "pending".
      const order = await api.createOrder({
        name: formData.name,
        email: formData.email,
        items: cart,
      });

      // Step 2: ask our backend for a checkout URL scoped to this
      // exact order (currently our own simulated gateway's page).
      const { url } = await api.createCheckoutSession(order.id);

      // Step 3: send the whole browser tab to the payment page. This
      // is a real page navigation (not a fetch) — React state on this
      // page is about to go away entirely, which is fine, since
      // the gateway will redirect back to /checkout/success when done.
      window.location.href = url;
      // No setSubmitting(false) here on purpose — the page is
      // navigating away, so there's nothing left to reset.
    } catch (err) {
      setError(err.message || "Something went wrong starting checkout. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-6 space-y-3 h-fit"
    >
      <p className="text-sm font-medium dark:text-white">Checkout details</p>
      <input
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="Full name"
        className="w-full px-3 py-2 text-sm border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white rounded-lg focus:outline-none focus:border-neutral-400"
      />
      <input
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="Email address"
        className="w-full px-3 py-2 text-sm border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white rounded-lg focus:outline-none focus:border-neutral-400"
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-neutral-900 dark:bg-white dark:text-neutral-900 text-white text-sm py-2 rounded-lg hover:bg-neutral-700 dark:hover:bg-neutral-200 transition-colors disabled:opacity-60"
      >
        {submitting ? "Redirecting to payment..." : `Continue to payment — $${totalPrice}`}
      </button>
      <p className="text-[11px] text-neutral-400 text-center">
        You'll land on a simulated payment page — no real card or gateway is involved yet.
      </p>
    </form>
  );
}

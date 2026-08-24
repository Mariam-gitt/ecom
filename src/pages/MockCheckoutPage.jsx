import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CreditCard, Loader2 } from "lucide-react";
import { api } from "../lib/api";

// THIS PAGE STANDS IN FOR STRIPE'S HOSTED CHECKOUT PAGE.
//
// In the real version, the customer would never see anything on OUR
// site at this point — CheckoutForm.jsx would send their whole browser
// tab to a page Stripe itself hosts and controls. Since there's no
// real gateway wired up yet (see server/src/routes/payments.js for
// why), this page fills that same SLOT in the flow — same URL
// parameters (session_id, orderId), same "confirm, then redirect to
// /checkout/success" shape — just rendered by our own frontend instead
// of a payment provider's.
//
// IMPORTANT: this form does NOT actually validate or process a card.
// Whatever you type here is never sent anywhere — clicking Pay just
// tells our backend "mark this session paid", exactly the way a real
// integration would only be told that AFTER a real gateway confirmed
// a real charge.
export default function MockCheckoutPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get("session_id");
  const orderId = searchParams.get("orderId");

  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");

  async function handlePay(e) {
    e.preventDefault();

    if (!sessionId || !orderId) {
      setError("Missing session details — go back and try checkout again.");
      return;
    }

    setPaying(true);
    setError("");

    try {
      // Tell our backend "payment succeeded" — see the big comment in
      // payments.js for exactly what this does and doesn't prove.
      await api.mockPay(sessionId);
      // Same redirect target a real gateway would send the browser
      // to — CheckoutSuccessPage then verifies with OUR backend
      // (not trusting this navigation alone) before clearing the cart.
      navigate(`/checkout/success?session_id=${sessionId}&orderId=${orderId}`);
    } catch (err) {
      setError(err.message || "Something went wrong confirming payment.");
      setPaying(false);
    }
  }

  return (
    <main className="max-w-sm mx-auto px-6 py-16">
      <div className="text-center mb-6">
        <CreditCard size={28} className="mx-auto mb-3 text-neutral-400" />
        <h1 className="text-lg font-medium dark:text-white">Simulated payment</h1>
        <p className="text-xs text-amber-500 mt-1">
          This is a test gateway — no real card is charged.
        </p>
      </div>

      <form
        onSubmit={handlePay}
        className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-6 space-y-3"
      >
        {/* Purely visual — none of these fields are read or sent
            anywhere. They exist so the flow FEELS like a real
            checkout page while you're testing it. */}
        <input
          disabled
          placeholder="4242 4242 4242 4242"
          className="w-full px-3 py-2 text-sm border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white rounded-lg opacity-60"
        />
        <div className="flex gap-3">
          <input
            disabled
            placeholder="MM/YY"
            className="w-full px-3 py-2 text-sm border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white rounded-lg opacity-60"
          />
          <input
            disabled
            placeholder="CVC"
            className="w-full px-3 py-2 text-sm border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white rounded-lg opacity-60"
          />
        </div>

        {error && <p className="text-xs text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={paying}
          className="w-full flex items-center justify-center gap-2 bg-neutral-900 dark:bg-white dark:text-neutral-900 text-white text-sm py-2 rounded-lg hover:bg-neutral-700 dark:hover:bg-neutral-200 transition-colors disabled:opacity-60"
        >
          {paying && <Loader2 size={14} className="animate-spin" />}
          {paying ? "Confirming..." : "Pay now (simulated)"}
        </button>

        <button
          type="button"
          onClick={() => navigate("/checkout")}
          className="w-full text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
        >
          Cancel and go back
        </button>
      </form>
    </main>
  );
}

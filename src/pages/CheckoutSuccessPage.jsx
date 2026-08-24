import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { useCart } from "../context/CartContext";
import { api } from "../lib/api";

// This page is where the payment gateway redirects the browser back
// to after payment — see server/src/routes/payments.js. We build the
// ?session_id=...&orderId=... URL ourselves right now (a real gateway
// would append its own session_id, same idea).
//
// THE KEY IDEA: we do NOT trust the URL alone as proof of payment —
// anyone could type a fake "success" URL into their browser. Instead,
// on mount, we ask OUR backend to verify (server-to-server) that this
// session really is marked paid. Only once that comes back confirmed
// do we clear the cart and show a real success state. This is the
// exact same check a real Stripe/Safepay/GoPayFast integration would
// do — only WHERE the verification data lives differs (our own
// payment_sessions.json right now, vs. a real gateway's servers).
export default function CheckoutSuccessPage() {
  const [searchParams] = useSearchParams();
  const { dispatch } = useCart();

  // "verifying" | "success" | "error" — three distinct states, same
  // reasoning as the loading/error/data pattern in useProducts.js: a
  // network request has three real moments in time, and cramming them
  // into fewer variables gets ambiguous fast (e.g. is empty `order`
  // because it's still loading, or because it genuinely failed?).
  const [status, setStatus] = useState("verifying");
  const [order, setOrder] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    const orderId = searchParams.get("orderId");

    if (!sessionId || !orderId) {
      setStatus("error");
      setErrorMessage("Missing payment confirmation details.");
      return;
    }

    api
      .verifyPayment(sessionId, orderId)
      .then((confirmedOrder) => {
        setOrder(confirmedOrder);
        setStatus("success");
        // Only clear the cart now — after the backend has confirmed,
        // via our payment gateway, that payment genuinely succeeded. This is the
        // step that used to happen immediately on form submit, back
        // when there was no real payment step to wait for.
        dispatch({ type: "CLEAR" });
      })
      .catch((err) => {
        setStatus("error");
        setErrorMessage(err.message);
      });
    // Empty deps — this should run exactly once, when the page first
    // loads after the gateway's redirect, not on every re-render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (status === "verifying") {
    return (
      <main className="max-w-md mx-auto px-6 py-16 text-center">
        <Loader2 size={32} className="mx-auto mb-4 animate-spin text-neutral-400" />
        <p className="text-sm text-neutral-500">Confirming your payment...</p>
      </main>
    );
  }

  if (status === "error") {
    return (
      <main className="max-w-md mx-auto px-6 py-16 text-center">
        <XCircle size={32} className="mx-auto mb-4 text-red-500" />
        <p className="text-sm font-medium mb-1 dark:text-white">Couldn't confirm payment</p>
        <p className="text-xs text-neutral-400 mb-6">{errorMessage}</p>
        <Link to="/checkout" className="text-xs text-neutral-500 underline">
          Back to checkout
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-md mx-auto px-6 py-16 text-center">
      <CheckCircle2 size={32} className="mx-auto mb-4 text-green-500" />
      <p className="text-sm font-medium mb-1 dark:text-white">Thanks, {order.name}!</p>
      <p className="text-xs text-neutral-400 mb-6">
        Order total ${order.total.toFixed(2)} — a confirmation would go to {order.email}.
      </p>
      <Link to="/" className="text-xs text-neutral-500 underline">
        Continue shopping
      </Link>
    </main>
  );
}

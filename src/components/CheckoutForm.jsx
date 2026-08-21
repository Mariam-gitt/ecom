import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

// CheckoutForm now takes "cart" and "totalPrice" as props from
// CheckoutPage — it's no longer fully standalone like it was before,
// now that it needs to know what's being ordered and clear the cart
// once the order actually succeeds.
export default function CheckoutForm({ cart, totalPrice }) {
  const { dispatch } = useCart();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ name: "", email: "" });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e) {
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
    setSubmitted(true);
    // The order "succeeded" (no real backend yet) — so this is the
    // moment a real store would actually clear the cart. Doing it now,
    // not before, means if something above had failed, the cart would
    // still be intact for the user to try again.
    dispatch({ type: "CLEAR" });
  }

  if (submitted) {
    return (
      <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-6 text-center h-fit">
        <p className="text-sm font-medium mb-1 dark:text-white">Thanks, {formData.name}!</p>
        <p className="text-xs text-neutral-400 mb-4">
          Order total ${totalPrice} — a confirmation would go to {formData.email}.
        </p>
        <button
          onClick={() => navigate("/")}
          className="text-xs text-neutral-500 underline"
        >
          Continue shopping
        </button>
      </div>
    );
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
        className="w-full bg-neutral-900 dark:bg-white dark:text-neutral-900 text-white text-sm py-2 rounded-lg hover:bg-neutral-700 dark:hover:bg-neutral-200 transition-colors"
      >
        Place order — ${totalPrice}
      </button>
    </form>
  );
}

// Link for navigating onward to checkout. useNavigate is a hook that
// lets you navigate PROGRAMMATICALLY (e.g. after a button click or a
// condition being met), rather than the user clicking a visible <Link>.
import { Link, useNavigate } from "react-router-dom";
import CartPanel from "../components/CartPanel";
import ClearCartButton from "../components/ClearCartButton";
import { useCart } from "../context/CartContext";

// CartPage handles the "/cart" route. It reuses CartPanel and
// ClearCartButton exactly as before — routing only changed WHERE these
// components get shown, not how they work internally.
export default function CartPage() {
  const { cart } = useCart();
  // useNavigate() returns a function you can call to change the URL
  // in code — used below so "Proceed to checkout" is blocked if the
  // cart happens to be empty (edge case: user navigates here directly).
  const navigate = useNavigate();

  function handleCheckout() {
    // navigate("/checkout") does the same thing a <Link to="/checkout">
    // click would do, just triggered from a function instead of a click.
    navigate("/checkout");
  }

  return (
    <main className="max-w-4xl mx-auto px-6 py-8 space-y-4">
      <h2 className="text-sm font-medium text-neutral-500">Your cart</h2>
      <CartPanel />
      <div className="flex items-center justify-between">
        <ClearCartButton />
        {cart.length > 0 && (
          <button
            onClick={handleCheckout}
            className="bg-neutral-900 text-white text-sm px-4 py-2 rounded-lg hover:bg-neutral-700 transition-colors"
          >
            Proceed to checkout
          </button>
        )}
      </div>
      {/* A plain Link back to shopping, for comparison against the
          navigate() call above — both end up changing the URL, just
          triggered differently. */}
      <Link to="/" className="block text-xs text-neutral-400 hover:text-neutral-700">
        ← Continue shopping
      </Link>
    </main>
  );
}

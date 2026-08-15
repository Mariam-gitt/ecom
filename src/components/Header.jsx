import { useEffect } from "react";
import { ShoppingCart } from "lucide-react";
// Link works like <a href>, but instead of a full page reload, it swaps
// the URL and re-renders just the matching Route's component — much
// faster, and it doesn't lose any in-memory React state (like the cart).
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function Header() {
  const { cart } = useCart();
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  const totalPrice = cart
    .reduce((sum, item) => sum + item.price * item.qty, 0)
    .toFixed(2);

  useEffect(() => {
    document.title = totalItems > 0 ? `Cart (${totalItems})` : "useContext Shop";
  }, [totalItems]);

  return (
    <header className="sticky top-0 z-10 bg-white border-b border-neutral-200">
      <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Link to="/" — clicking this navigates home WITHOUT a full
            page reload. Using a plain <a href="/"> here would work
            visually but reload the whole page, wiping the cart's React
            state (since it only lives in memory, not in the URL). */}
        <Link to="/" className="text-lg font-semibold tracking-tight">
          useContext Shop
        </Link>
        <nav className="flex items-center gap-4">
          {/* A second Link, styled as a pill showing the live cart
              totals. Still driven by the SAME context as before —
              routing doesn't change where cart data comes from. */}
          <Link
            to="/cart"
            className="flex items-center gap-2 bg-neutral-900 text-white px-4 py-2 rounded-full text-sm hover:bg-neutral-700 transition-colors"
          >
            <ShoppingCart size={16} />
            <span>{totalItems} items</span>
            <span className="opacity-50">|</span>
            <span>${totalPrice}</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}

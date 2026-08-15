// useEffect: run code after rendering, in response to a value changing.
import { useEffect } from "react";
import { ShoppingCart } from "lucide-react";
// useCart pulls { cart, dispatch } from context — no props needed.
import { useCart } from "../context/CartContext";

export default function Header() {
  const { cart } = useCart();
  // Derived values — calculated fresh every render from "cart", never
  // stored separately, so they can't drift out of sync with it.
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  const totalPrice = cart
    .reduce((sum, item) => sum + item.price * item.qty, 0)
    .toFixed(2);

  // Side effect: sync the browser tab's title with totalItems. The
  // dependency array [totalItems] means "only re-run this when
  // totalItems actually changes" — not on every unrelated render.
  useEffect(() => {
    document.title = totalItems > 0 ? `Cart (${totalItems})` : "useContext Shop";
  }, [totalItems]);

  return (
    <header className="sticky top-0 z-10 bg-white border-b border-neutral-200">
      <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold tracking-tight">useContext Shop</h1>
        <div className="flex items-center gap-2 bg-neutral-900 text-white px-4 py-2 rounded-full text-sm">
          <ShoppingCart size={16} />
          <span>{totalItems} items</span>
          <span className="opacity-50">|</span>
          <span>${totalPrice}</span>
        </div>
      </div>
    </header>
  );
}

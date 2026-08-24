import { useCart } from "../context/CartContext";

export default function ClearCartButton() {
  const { cart, dispatch } = useCart();
  // Render nothing at all if there's no cart to clear.
  if (cart.length === 0) return null;

  return (
    <button
      onClick={() => dispatch({ type: "CLEAR" })}
      className="mt-3 text-xs text-neutral-400 hover:text-red-500 dark:text-neutral-500"
    >
      Clear cart
    </button>
  );
}

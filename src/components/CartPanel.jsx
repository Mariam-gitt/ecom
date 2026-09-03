import { Plus, Minus, Trash2 } from "lucide-react";
import { useCart } from "../context/CartContext";

export default function CartPanel() {
  const { cart, dispatch } = useCart();

  if (cart.length === 0) {
    // Conditional rendering: an empty-state message instead of an empty list.
    return (
      <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-6 text-sm text-neutral-400 text-center">
        Cart is empty — add something above.
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl divide-y divide-neutral-100 dark:divide-neutral-700">
      {cart.map((item) => (
        <div key={item.id} className="flex items-center gap-3 p-3">
          <span className="text-2xl">{item.emoji}</span>
          <div className="flex-1">
            <p className="text-sm font-medium dark:text-white">{item.name}</p>
            <p className="text-xs text-neutral-400 dark:text-neutral-500">${item.price.toFixed(2)} each</p>
          </div>
          {/* Each button dispatches a different action type. None of
              them contain update logic — that all lives in cartReducer. */}
          <button
            onClick={() => dispatch({ type: "DECREASE", id: item.id })}
            className="w-7 h-7 flex items-center justify-center rounded-full border border-neutral-200 dark:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-700 dark:text-white"
          >
            <Minus size={12} />
          </button>
          <span className="w-6 text-center text-sm dark:text-white">{item.qty}</span>
          <button
            onClick={() => dispatch({ type: "INCREASE", id: item.id })}
            className="w-7 h-7 flex items-center justify-center rounded-full border border-neutral-200 dark:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-700 dark:text-white"
          >
            <Plus size={12} />
          </button>
          <button
            onClick={() => dispatch({ type: "REMOVE", id: item.id })}
            // text-brand-600/hover:bg-brand-50: same red family as the
            // rest of the app instead of Tailwind's default red-500/red-50.
            className="w-7 h-7 flex items-center justify-center rounded-full text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-800/20 ml-1"
          >
            <Trash2 size={13} />
          </button>
        </div>
      ))}
    </div>
  );
}

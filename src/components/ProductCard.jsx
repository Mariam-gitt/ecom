// memo lets us skip re-rendering this component when its props haven't
// actually changed.
import { memo } from "react";
import { Plus, Check } from "lucide-react";
import { useCart } from "../context/CartContext";

// "product" arrives as a prop, PARENT (ProductGrid) -> CHILD (this
// component). Everything else (cart, dispatch) comes from context.
function ProductCardImpl({ product }) {
  const { cart, dispatch } = useCart();
  // Search the cart for an entry matching this specific product's id.
  const inCart = cart.find((item) => item.id === product.id);

  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-4 flex flex-col gap-3">
      <div className="text-4xl text-center py-4 bg-neutral-50 rounded-lg">
        {product.emoji}
      </div>
      <h2 className="font-medium text-sm">{product.name}</h2>
      <p className="text-neutral-500 text-sm">${product.price.toFixed(2)}</p>
      <button
        // Clicking dispatches an ADD action directly via context — no
        // wrapper function needed, same pattern as every other button.
        onClick={() => dispatch({ type: "ADD", product })}
        className="mt-auto flex items-center justify-center gap-1.5 bg-neutral-900 text-white text-sm py-2 rounded-lg hover:bg-neutral-700 transition-colors"
      >
        {inCart ? (
          <>
            <Check size={14} /> In cart ({inCart.qty})
          </>
        ) : (
          <>
            <Plus size={14} /> Add
          </>
        )}
      </button>
    </div>
  );
}

// memo() wraps the component: React compares the new "product" prop to
// the previous one, and if it's the SAME reference, skips re-rendering
// this card entirely. Since PRODUCTS array objects never get recreated,
// this means unaffected cards skip re-rendering when unrelated state
// (like a search box) changes elsewhere in the app.
const ProductCard = memo(ProductCardImpl);
export default ProductCard;

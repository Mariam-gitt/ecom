import { memo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Check } from "lucide-react";
import { useCart } from "../context/CartContext";
import Toast from "./Toast";

// "product" is passed PARENT (ProductGrid) -> CHILD (this component).
// Real API fields are different from our old hardcoded ones: "title"
// instead of "name", "image" (a real URL) instead of an emoji, plus
// "category" and "rating" that we didn't have before.
function ProductCardImpl({ product }) {
  const { cart, dispatch } = useCart();
  const inCart = cart.find((item) => item.id === product.id);

  // Local state just for THIS card's toast — each card manages its own,
  // rather than sharing one global toast across the whole app. Simpler
  // for now; a bigger app might centralize this in its own context.
  const [showToast, setShowToast] = useState(false);

  function handleAdd() {
    dispatch({ type: "ADD", product });
    setShowToast(true);
  }

  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-4 flex flex-col gap-3">
      {/* Link wraps the image + title, navigating to this product's own
          page. to={`/product/${product.id}`} builds the URL dynamically
          from this specific product's id. */}
      <Link to={`/product/${product.id}`}>
        <div className="h-32 flex items-center justify-center bg-neutral-50 rounded-lg p-2">
          {/* Real image URL from the API now, instead of an emoji */}
          <img
            src={product.image}
            alt={product.title}
            className="h-full object-contain"
          />
        </div>
        <h2 className="font-medium text-sm mt-3 line-clamp-2">{product.title}</h2>
      </Link>
      <p className="text-neutral-500 text-sm">${product.price.toFixed(2)}</p>
      <button
        onClick={handleAdd}
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

      {/* Conditional rendering: only mount the Toast while showToast is
          true. onDone flips it back to false, which unmounts the Toast
          entirely — its portal content disappears from document.body. */}
      {showToast && (
        <Toast message="Added to cart!" onDone={() => setShowToast(false)} />
      )}
    </div>
  );
}

const ProductCard = memo(ProductCardImpl);
export default ProductCard;

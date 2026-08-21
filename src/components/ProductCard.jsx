import { memo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Check, Heart } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import Toast from "./Toast";
import StarRating from "./StarRating";

// "product" is passed PARENT (ProductGrid) -> CHILD (this component).
// Real API fields: "title", "image" (a real URL), "category", and
// "rating" (an object: { rate, count }).
function ProductCardImpl({ product }) {
  const { cart, dispatch } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const inCart = cart.find((item) => item.id === product.id);
  const wishlisted = isWishlisted(product.id);

  const [showToast, setShowToast] = useState(false);

  function handleAdd() {
    dispatch({ type: "ADD", product });
    setShowToast(true);
  }

  return (
    <div className="relative bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-4 flex flex-col gap-3">
      {/* Wishlist heart button — positioned absolutely so it floats in
          the top-right corner over the card, independent of the normal
          layout flow. stopPropagation prevents the click from also
          triggering the Link below it (they're visually overlapping). */}
      <button
        onClick={(e) => {
          e.preventDefault(); // don't navigate if this sits inside a Link
          e.stopPropagation();
          toggleWishlist(product.id);
        }}
        className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm"
      >
        <Heart
          size={16}
          // Filled red heart if wishlisted, plain outline otherwise —
          // exactly the same "conditional styling based on state"
          // pattern as the Add button's checkmark.
          className={wishlisted ? "fill-red-500 text-red-500" : "text-neutral-400"}
        />
      </button>

      <Link to={`/product/${product.id}`}>
        <div className="h-32 flex items-center justify-center bg-neutral-50 dark:bg-neutral-900 rounded-lg p-2">
          <img src={product.image} alt={product.title} className="h-full object-contain" />
        </div>
        <h2 className="font-medium text-sm mt-3 line-clamp-2 dark:text-white">{product.title}</h2>
      </Link>

      {/* Star rating, straight from the API's product.rating object */}
      <StarRating rate={product.rating?.rate} count={product.rating?.count} />

      <p className="text-neutral-500 dark:text-neutral-400 text-sm">${product.price.toFixed(2)}</p>
      <button
        onClick={handleAdd}
        className="mt-auto flex items-center justify-center gap-1.5 bg-neutral-900 dark:bg-white dark:text-neutral-900 text-white text-sm py-2 rounded-lg hover:bg-neutral-700 dark:hover:bg-neutral-200 transition-colors"
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

      {showToast && (
        <Toast message="Added to cart!" onDone={() => setShowToast(false)} />
      )}
    </div>
  );
}

const ProductCard = memo(ProductCardImpl);
export default ProductCard;

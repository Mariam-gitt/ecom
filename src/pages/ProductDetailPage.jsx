import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Plus, Minus, ArrowLeft, Heart } from "lucide-react";
import { useProduct } from "../hooks/useProducts";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import Toast from "../components/Toast";
import StarRating from "../components/StarRating";

export default function ProductDetailPage() {
  const { id } = useParams();
  const { product, loading, error } = useProduct(id);
  const { dispatch } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();

  const [qty, setQty] = useState(1);
  const [showToast, setShowToast] = useState(false);

  // Reviews live ONLY in this component's local state — they're not
  // shared anywhere else, not persisted, and reset if you reload the
  // page. That's fine for now, since there's no backend yet to actually
  // save them to. A real app would send these to a server instead.
  const [reviews, setReviews] = useState([]);
  const [reviewText, setReviewText] = useState("");
  const [reviewName, setReviewName] = useState("");

  function handleAdd() {
    dispatch({ type: "ADD", product, qty });
    setShowToast(true);
  }

  function handleReviewSubmit(e) {
    e.preventDefault();
    if (!reviewText.trim() || !reviewName.trim()) return;
    // Add the new review to the FRONT of the array (so newest shows
    // first), spreading the existing reviews after it. Never mutate
    // state directly — this builds a brand new array.
    setReviews((prev) => [
      { id: Date.now(), name: reviewName, text: reviewText },
      ...prev,
    ]);
    // Reset the form fields after a successful submit.
    setReviewText("");
    setReviewName("");
  }

  if (loading) {
    return <p className="max-w-4xl mx-auto px-6 py-12 text-center text-neutral-400">Loading product...</p>;
  }
  if (error) {
    return <p className="max-w-4xl mx-auto px-6 py-12 text-center text-brand-600">{error}</p>;
  }

  const wishlisted = isWishlisted(product.id);

  return (
    <main className="max-w-4xl mx-auto px-6 py-8">
      <Link to="/" className="inline-flex items-center gap-1 text-xs text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 mb-6">
        <ArrowLeft size={14} /> Back to shop
      </Link>

      <div className="grid sm:grid-cols-2 gap-8">
        <div className="bg-neutral-50 dark:bg-neutral-800 rounded-xl p-8 flex items-center justify-center">
          <img src={product.image} alt={product.title} className="max-h-72 object-contain" />
        </div>

        <div className="space-y-4">
          <div className="flex items-start justify-between gap-3">
            <p className="text-xs uppercase tracking-wide text-neutral-400">{product.category}</p>
            {/* Same wishlist toggle pattern as ProductCard, just styled
                inline here instead of positioned absolutely. */}
            <button onClick={() => toggleWishlist(product.id)} className="shrink-0">
              <Heart size={20} className={wishlisted ? "fill-brand-600 text-brand-600" : "text-neutral-300"} />
            </button>
          </div>
          <h1 className="text-xl font-semibold dark:text-white">{product.title}</h1>
          <StarRating rate={product.rating?.rate} count={product.rating?.count} />
          <p className="text-2xl font-medium text-brand-600 dark:text-brand-400">${product.price.toFixed(2)}</p>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">{product.description}</p>

          <div className="flex items-center gap-3 pt-2">
            <span className="text-sm text-neutral-500 dark:text-neutral-400">Quantity</span>
            <div className="flex items-center border border-neutral-200 dark:border-neutral-700 rounded-lg">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="w-9 h-9 flex items-center justify-center hover:bg-neutral-50 dark:hover:bg-neutral-800">
                <Minus size={14} />
              </button>
              <span className="w-10 text-center text-sm dark:text-white">{qty}</span>
              <button onClick={() => setQty((q) => q + 1)} className="w-9 h-9 flex items-center justify-center hover:bg-neutral-50 dark:hover:bg-neutral-800">
                <Plus size={14} />
              </button>
            </div>
          </div>

          <button
            onClick={handleAdd}
            className="w-full bg-brand-600 text-white text-sm py-3 rounded-lg hover:bg-brand-700 transition-colors"
          >
            Add {qty > 1 ? `${qty} ` : ""}to cart
          </button>
        </div>
      </div>

      {/* REVIEWS SECTION — a fully local, controlled form (two fields)
          plus a rendered list of whatever's been submitted so far. */}
      <section className="mt-12 pt-8 border-t border-neutral-200 dark:border-neutral-700">
        <h2 className="text-sm font-medium mb-4 dark:text-white">Reviews</h2>

        <form onSubmit={handleReviewSubmit} className="space-y-2 mb-6">
          <input
            value={reviewName}
            onChange={(e) => setReviewName(e.target.value)}
            placeholder="Your name"
            className="w-full px-3 py-2 text-sm border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white rounded-lg focus:outline-none focus:border-brand-500"
          />
          <textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder="Write a review..."
            rows={3}
            className="w-full px-3 py-2 text-sm border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white rounded-lg focus:outline-none focus:border-brand-500"
          />
          <button type="submit" className="text-sm bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg transition-colors">
            Post review
          </button>
        </form>

        {/* Conditional rendering: empty-state message vs the actual list */}
        {reviews.length === 0 ? (
          <p className="text-sm text-neutral-400">No reviews yet — be the first.</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="border-b border-neutral-100 dark:border-neutral-800 pb-3">
                <p className="text-sm font-medium dark:text-white">{review.name}</p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">{review.text}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {showToast && (
        <Toast message="Added to cart!" onDone={() => setShowToast(false)} />
      )}
    </main>
  );
}

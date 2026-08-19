import { useState } from "react";
// useParams reads a value straight out of the current URL. For route
// "/product/:id", visiting "/product/7" makes useParams() return { id: "7" }.
import { useParams, Link } from "react-router-dom";
import { Plus, Minus, ArrowLeft } from "lucide-react";
import { useProduct } from "../hooks/useProducts";
import { useCart } from "../context/CartContext";
import Toast from "../components/Toast";

export default function ProductDetailPage() {
  // Pull "id" out of the URL, then pass it to our custom hook — which
  // re-fetches automatically whenever id changes (see useProducts.js).
  const { id } = useParams();
  const { product, loading, error } = useProduct(id);
  const { dispatch } = useCart();

  // Local state for the quantity selector, starting at 1.
  const [qty, setQty] = useState(1);
  const [showToast, setShowToast] = useState(false);

  function handleAdd() {
    // Passing qty this time — the reducer adds this many at once,
    // instead of the default 1 that ProductCard's quick-add uses.
    dispatch({ type: "ADD", product, qty });
    setShowToast(true);
  }

  // Three possible states to handle, same pattern as always: loading,
  // error, or success. Nothing renders below until one of these matches.
  if (loading) {
    return <p className="max-w-4xl mx-auto px-6 py-12 text-center text-neutral-400">Loading product...</p>;
  }
  if (error) {
    return <p className="max-w-4xl mx-auto px-6 py-12 text-center text-red-500">{error}</p>;
  }

  return (
    <main className="max-w-4xl mx-auto px-6 py-8">
      <Link to="/" className="inline-flex items-center gap-1 text-xs text-neutral-400 hover:text-neutral-700 mb-6">
        <ArrowLeft size={14} /> Back to shop
      </Link>

      <div className="grid sm:grid-cols-2 gap-8">
        <div className="bg-neutral-50 rounded-xl p-8 flex items-center justify-center">
          <img src={product.image} alt={product.title} className="max-h-72 object-contain" />
        </div>

        <div className="space-y-4">
          <p className="text-xs uppercase tracking-wide text-neutral-400">{product.category}</p>
          <h1 className="text-xl font-semibold">{product.title}</h1>
          <p className="text-2xl font-medium">${product.price.toFixed(2)}</p>
          <p className="text-sm text-neutral-500 leading-relaxed">{product.description}</p>

          {/* Quantity selector — local state, decremented/incremented
              by these two buttons, never going below 1. */}
          <div className="flex items-center gap-3 pt-2">
            <span className="text-sm text-neutral-500">Quantity</span>
            <div className="flex items-center border border-neutral-200 rounded-lg">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="w-9 h-9 flex items-center justify-center hover:bg-neutral-50"
              >
                <Minus size={14} />
              </button>
              <span className="w-10 text-center text-sm">{qty}</span>
              <button
                onClick={() => setQty((q) => q + 1)}
                className="w-9 h-9 flex items-center justify-center hover:bg-neutral-50"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>

          <button
            onClick={handleAdd}
            className="w-full bg-neutral-900 text-white text-sm py-3 rounded-lg hover:bg-neutral-700 transition-colors"
          >
            Add {qty > 1 ? `${qty} ` : ""}to cart
          </button>
        </div>
      </div>

      {showToast && (
        <Toast message="Added to cart!" onDone={() => setShowToast(false)} />
      )}
    </main>
  );
}

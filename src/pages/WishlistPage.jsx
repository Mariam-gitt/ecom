import { useWishlist } from "../context/WishlistContext";
import { useProducts } from "../hooks/useProducts";
import ProductGrid from "../components/ProductGrid";

export default function WishlistPage() {
  const { wishlistIds } = useWishlist();
  // We only stored ids in WishlistContext — this page is where we
  // actually look up the FULL product objects for those ids, by
  // fetching the whole product list and filtering it down. A bigger
  // app might instead fetch each wishlisted product individually.
  const { products, loading, error } = useProducts();

  if (loading) {
    return <p className="max-w-4xl mx-auto px-6 py-12 text-center text-neutral-400">Loading...</p>;
  }
  if (error) {
    return <p className="max-w-4xl mx-auto px-6 py-12 text-center text-brand-600">{error}</p>;
  }

  const wishlistedProducts = products.filter((p) => wishlistIds.includes(p.id));

  return (
    <main className="max-w-4xl mx-auto px-6 py-8">
      <h1 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-4">
        Your wishlist
      </h1>
      {wishlistedProducts.length === 0 ? (
        <p className="text-sm text-neutral-400 text-center py-8">
          Nothing here yet — tap the heart on any product to save it.
        </p>
      ) : (
        <ProductGrid products={wishlistedProducts} />
      )}
    </main>
  );
}

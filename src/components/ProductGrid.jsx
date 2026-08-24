import ProductCard from "./ProductCard";

// ProductGrid receives the (already filtered) product list as a prop —
// PARENT (ShopPage) -> CHILD (this component) — and loops over it.
export default function ProductGrid({ products }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {/* .map() renders one ProductCard per product. key is required by
          React for tracking list items across re-renders. */}
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

import { useState, useEffect, useRef, useCallback } from "react";
import { PRODUCTS } from "../data/products";
import Header from "../components/Header";
import SearchBar from "../components/SearchBar";
import ClearSearchButton from "../components/ClearSearchButton";
import ProductGrid from "../components/ProductGrid";
import CartPanel from "../components/CartPanel";
import ClearCartButton from "../components/ClearCartButton";
import CheckoutForm from "../components/CheckoutForm";

// ShopPage owns the search feature's state. It's a CHILD of CartProvider
// (see App.jsx) — so typing here never re-renders CartProvider itself,
// which keeps ProductCard's memo actually effective.
export default function ShopPage() {
  const [searchText, setSearchText] = useState("");

  // useRef: a box that persists across renders WITHOUT causing a
  // re-render when it changes. Used here to hold a direct reference to
  // the real <input> DOM element, so we can call .focus() on it — a
  // browser action, not something state/props can express.
  const inputRef = useRef(null);

  // Runs once, right after the first render (empty [] = never re-run).
  // Auto-focuses the search box on page load.
  useEffect(() => {
    inputRef.current.focus();
  }, []);

  // useCallback keeps this exact function reference stable across
  // re-renders (since deps are empty, it's created once, ever). Without
  // this, ShopPage would hand ClearSearchButton a BRAND NEW function on
  // every keystroke, making its memo pointless.
  const handleClear = useCallback(() => {
    setSearchText("");
  }, []);

  // A plain function, recreated every render — fine here, since
  // SearchBar's "value" prop already changes every keystroke anyway, so
  // memoizing SearchBar wouldn't save any renders regardless.
  function handleSearchChange(e) {
    setSearchText(e.target.value);
  }

  // Recomputed every render — cheap enough not to need caching
  // (useMemo would be the tool for that, if this ever got expensive).
  const filteredProducts = PRODUCTS.filter((p) =>
    p.name.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <>
      <Header />
      <main className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <SearchBar
              value={searchText}
              onChange={handleSearchChange}
              inputRef={inputRef}
            />
            {searchText && <ClearSearchButton onClear={handleClear} />}
          </div>
          {filteredProducts.length === 0 ? (
            <p className="text-sm text-neutral-400 text-center py-8">
              No products match "{searchText}".
            </p>
          ) : (
            <ProductGrid products={filteredProducts} />
          )}
        </div>

        <div>
          <p className="text-sm text-neutral-500 mb-4">Cart</p>
          <CartPanel />
          <ClearCartButton />
        </div>

        <CheckoutForm />
      </main>
    </>
  );
}

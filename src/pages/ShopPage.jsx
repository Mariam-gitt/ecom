import { useState, useEffect, useRef, useCallback } from "react";
import { PRODUCTS } from "../data/products";
import SearchBar from "../components/SearchBar";
import ClearSearchButton from "../components/ClearSearchButton";
import ProductGrid from "../components/ProductGrid";

// ShopPage is now ONLY responsible for the "/" route — browsing and
// searching products. Cart and checkout moved out to their own pages,
// each with their own URL (see CartPage.jsx, CheckoutPage.jsx). Header
// also moved OUT of here entirely — it now lives in App.jsx, since it
// needs to appear on every page, not just this one.
export default function ShopPage() {
  const [searchText, setSearchText] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current.focus();
  }, []);

  const handleClear = useCallback(() => {
    setSearchText("");
  }, []);

  function handleSearchChange(e) {
    setSearchText(e.target.value);
  }

  const filteredProducts = PRODUCTS.filter((p) =>
    p.name.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <main className="max-w-4xl mx-auto px-6 py-8">
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
    </main>
  );
}

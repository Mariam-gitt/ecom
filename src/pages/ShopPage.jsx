import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useProducts } from "../hooks/useProducts";
import SearchBar from "../components/SearchBar";
import ClearSearchButton from "../components/ClearSearchButton";
import ProductGrid from "../components/ProductGrid";

export default function ShopPage() {
  // Real data now, instead of a hardcoded array — loading/error handled
  // right here, exactly like the pattern from useProducts.js.
  const { products, loading, error } = useProducts();

  const [searchText, setSearchText] = useState("");
  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState("default");

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

  // Derive the unique list of categories FROM the fetched products,
  // instead of hardcoding them — so this automatically stays correct
  // even if the API's categories ever change.
  const categories = useMemo(() => {
    const unique = new Set(products.map((p) => p.category));
    return ["all", ...unique];
  }, [products]);

  // This is the useMemo payoff: filtering + sorting a list is real work
  // (looping over every product, more than once). Without useMemo, this
  // ENTIRE block would re-run on every single render of ShopPage — even
  // renders caused by something totally unrelated. useMemo caches the
  // result and only recalculates when one of the listed dependencies
  // (products, searchText, category, sortBy) actually changes.
  const visibleProducts = useMemo(() => {
    let result = products.filter((p) =>
      p.title.toLowerCase().includes(searchText.toLowerCase())
    );

    if (category !== "all") {
      result = result.filter((p) => p.category === category);
    }

    if (sortBy === "price-asc") {
      // [...result] copies the array first — .sort() mutates in place,
      // and we never want to mutate state or a value derived from it.
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-desc") {
      result = [...result].sort((a, b) => b.price - a.price);
    }

    return result;
  }, [products, searchText, category, sortBy]);

  if (loading) {
    return <p className="max-w-4xl mx-auto px-6 py-12 text-center text-neutral-400">Loading products...</p>;
  }
  if (error) {
    return <p className="max-w-4xl mx-auto px-6 py-12 text-center text-red-500">{error}</p>;
  }

  return (
    <main className="max-w-4xl mx-auto px-6 py-8">
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <SearchBar value={searchText} onChange={handleSearchChange} inputRef={inputRef} />
        {searchText && <ClearSearchButton onClear={handleClear} />}

        {/* Two plain controlled <select> elements — same "value comes
            from state" pattern as any controlled input. */}
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="text-sm border border-neutral-200 rounded-lg px-3 py-2 capitalize"
        >
          {categories.map((c) => (
            <option key={c} value={c} className="capitalize">
              {c === "all" ? "All categories" : c}
            </option>
          ))}
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="text-sm border border-neutral-200 rounded-lg px-3 py-2"
        >
          <option value="default">Sort: default</option>
          <option value="price-asc">Price: low to high</option>
          <option value="price-desc">Price: high to low</option>
        </select>
      </div>

      {visibleProducts.length === 0 ? (
        <p className="text-sm text-neutral-400 text-center py-8">No products match.</p>
      ) : (
        <ProductGrid products={visibleProducts} />
      )}
    </main>
  );
}

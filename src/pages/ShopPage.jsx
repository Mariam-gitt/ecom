import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Mic } from "lucide-react";
import { useProducts } from "../hooks/useProducts";
import { useVoiceSearch } from "../hooks/useVoiceSearch";
import SearchBar from "../components/SearchBar";
import ClearSearchButton from "../components/ClearSearchButton";
import ProductGrid from "../components/ProductGrid";

export default function ShopPage() {
  const { products, loading, error } = useProducts();

  const [searchText, setSearchText] = useState("");
  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState("default");

  const inputRef = useRef(null);
  useEffect(() => {
    if (!loading) {
      inputRef.current?.focus();
    }
  }, [loading]);

  const handleClear = useCallback(() => {
    setSearchText("");
  }, []);

  function handleSearchChange(e) {
    setSearchText(e.target.value);
  }

  const categories = useMemo(() => {
    const unique = new Set(products.map((p) => p.category));
    return ["all", ...unique];
  }, [products]);

  // This is the "smart parsing" part — NOT a real AI call, just
  // keyword-matching the transcribed text against known categories and
  // a couple of price-related phrases. Genuinely simple string logic,
  // dressed up to feel a bit smarter than a plain search box.
  function handleVoiceResult(transcript) {
    const lower = transcript.toLowerCase();

    // .find() checks each real category name against the spoken text —
    // if the user said "show me electronics", this catches "electronics".
    const matchedCategory = categories.find(
      (c) => c !== "all" && lower.includes(c)
    );
    if (matchedCategory) setCategory(matchedCategory);

    if (lower.includes("cheap") || lower.includes("affordable") || lower.includes("lowest price")) {
      setSortBy("price-asc");
    } else if (lower.includes("expensive") || lower.includes("highest price")) {
      setSortBy("price-desc");
    }

    // Whatever was said also becomes the search text, same as typing —
    // so even words with no special meaning still filter by title.
    setSearchText(transcript);
  }

  const { isListening, isSupported, startListening } = useVoiceSearch(handleVoiceResult);

  const visibleProducts = useMemo(() => {
    let result = products.filter((p) =>
      p.title.toLowerCase().includes(searchText.toLowerCase())
    );

    if (category !== "all") {
      result = result.filter((p) => p.category === category);
    }

    if (sortBy === "price-asc") {
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

        {/* Only show the mic button at all if the browser supports it —
            no point offering a button that would just silently fail. */}
        {isSupported && (
          <button
            onClick={startListening}
            title="Search by voice"
            className={`w-9 h-9 flex items-center justify-center rounded-full border transition-colors ${
              isListening
                ? "bg-red-500 border-red-500 text-white animate-pulse"
                : "border-neutral-200 dark:border-neutral-700 dark:text-white"
            }`}
          >
            <Mic size={16} />
          </button>
        )}

        {searchText && <ClearSearchButton onClear={handleClear} />}

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="text-sm border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white rounded-lg px-3 py-2 capitalize"
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
          className="text-sm border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white rounded-lg px-3 py-2"
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

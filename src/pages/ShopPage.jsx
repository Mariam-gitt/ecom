import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Mic, Loader2 } from "lucide-react";
import { useProducts } from "../hooks/useProducts";
import { useVoiceSearch } from "../hooks/useVoiceSearch";
import { api } from "../lib/api";
import SearchBar from "../components/SearchBar";
import ClearSearchButton from "../components/ClearSearchButton";
import ProductGrid from "../components/ProductGrid";

export default function ShopPage() {
  const { products, loading, error } = useProducts();

  const [searchText, setSearchText] = useState("");
  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState("default");
  // NEW — the old naive parser couldn't handle "under $50" at all, it
  // just fell through to plain text search on the whole sentence.
  // These two hold whatever bounds the LLM extracts.
  const [minPrice, setMinPrice] = useState(null);
  const [maxPrice, setMaxPrice] = useState(null);

  // NEW — true while we're waiting on the backend/LLM to interpret a
  // voice transcript, so the mic button can show it's "thinking" not
  // just "listening".
  const [isParsingVoice, setIsParsingVoice] = useState(false);
  const [voiceError, setVoiceError] = useState(null);

  const inputRef = useRef(null);
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleClear = useCallback(() => {
    setSearchText("");
    setMinPrice(null);
    setMaxPrice(null);
  }, []);

  function handleSearchChange(e) {
    setSearchText(e.target.value);
  }

  const categories = useMemo(() => {
    const unique = new Set(products.map((p) => p.category));
    return ["all", ...unique];
  }, [products]);

  // Fallback ONLY — same keyword-matching the whole feature used to
  // rely on. Used if the backend/LLM call fails (server down, no API
  // key configured, network blip), so voice search still does
  // SOMETHING useful instead of just erroring out silently.
  function naiveParse(transcript) {
    const lower = transcript.toLowerCase();
    const matchedCategory = categories.find((c) => c !== "all" && lower.includes(c));
    if (matchedCategory) setCategory(matchedCategory);

    if (lower.includes("cheap") || lower.includes("affordable") || lower.includes("lowest price")) {
      setSortBy("price-asc");
    } else if (lower.includes("expensive") || lower.includes("highest price")) {
      setSortBy("price-desc");
    }
    setSearchText(transcript);
  }

  // THE REAL INTEGRATION — sends the raw transcript to our backend,
  // which asks an LLM to turn it into structured filters (category,
  // price bounds, sort order, core keywords), then applies whatever
  // comes back directly to this page's filter state. See
  // server/src/services/llmClient.js for exactly how that parsing
  // prompt is built.
  async function handleVoiceResult(transcript) {
    setIsParsingVoice(true);
    setVoiceError(null);

    try {
      const { filters } = await api.voiceSearch(transcript);

      setSearchText(filters.keywords ?? transcript);
      if (filters.category) setCategory(filters.category);
      if (filters.sortBy) setSortBy(filters.sortBy);
      setMinPrice(filters.minPrice);
      setMaxPrice(filters.maxPrice);
    } catch (err) {
      console.warn("Voice search LLM parse failed, falling back to keyword match:", err.message);
      setVoiceError("Couldn't reach smart search — used basic matching instead.");
      naiveParse(transcript);
    } finally {
      setIsParsingVoice(false);
    }
  }

  const { isListening, isSupported, startListening } = useVoiceSearch(handleVoiceResult);

  const visibleProducts = useMemo(() => {
    let result = products.filter((p) =>
      p.title.toLowerCase().includes(searchText.toLowerCase())
    );

    if (category !== "all") {
      result = result.filter((p) => p.category === category);
    }

    // NEW — price bounds from voice search. Either can be set alone
    // ("under 50" sets only maxPrice) or both ("between 10 and 30").
    if (minPrice != null) {
      result = result.filter((p) => p.price >= minPrice);
    }
    if (maxPrice != null) {
      result = result.filter((p) => p.price <= maxPrice);
    }

    if (sortBy === "price-asc") {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-desc") {
      result = [...result].sort((a, b) => b.price - a.price);
    }

    return result;
  }, [products, searchText, category, sortBy, minPrice, maxPrice]);

  if (loading) {
    return <p className="max-w-4xl mx-auto px-6 py-12 text-center text-neutral-400">Loading products...</p>;
  }
  if (error) {
    return <p className="max-w-4xl mx-auto px-6 py-12 text-center text-red-500">{error}</p>;
  }

  return (
    <main className="max-w-4xl mx-auto px-6 py-8">
      <div className="flex flex-wrap items-center gap-3 mb-2">
        <SearchBar value={searchText} onChange={handleSearchChange} inputRef={inputRef} />

        {/* Only show the mic button at all if the browser supports it —
            no point offering a button that would just silently fail. */}
        {isSupported && (
          <button
            onClick={startListening}
            disabled={isParsingVoice}
            title="Search by voice"
            className={`w-9 h-9 flex items-center justify-center rounded-full border transition-colors ${
              isListening
                ? "bg-red-500 border-red-500 text-white animate-pulse"
                : "border-neutral-200 dark:border-neutral-700 dark:text-white"
            }`}
          >
            {isParsingVoice ? <Loader2 size={16} className="animate-spin" /> : <Mic size={16} />}
          </button>
        )}

        {(searchText || minPrice != null || maxPrice != null) && (
          <ClearSearchButton onClear={handleClear} />
        )}

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

      {/* NEW — a small readout of any price bounds voice search picked
          up, since those aren't visible anywhere else in the UI. */}
      {(minPrice != null || maxPrice != null) && (
        <p className="text-xs text-neutral-400 mb-2">
          Price filter: {minPrice != null ? `$${minPrice}+` : ""}
          {minPrice != null && maxPrice != null ? " – " : ""}
          {maxPrice != null ? `up to $${maxPrice}` : ""}
        </p>
      )}

      {voiceError && <p className="text-xs text-amber-500 mb-2">{voiceError}</p>}

      {visibleProducts.length === 0 ? (
        <p className="text-sm text-neutral-400 text-center py-8">No products match.</p>
      ) : (
        <ProductGrid products={visibleProducts} />
      )}
    </main>
  );
}

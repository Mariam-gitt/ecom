import { Search } from "lucide-react";

// A CONTROLLED input: "value" always comes from the parent's state, so
// React (not the browser) is the single source of truth for what's
// typed. value/onChange/inputRef are all passed PARENT (ShopPage) ->
// CHILD (this component). Every keystroke calls onChange(e), which is
// CHILD -> PARENT: this component doesn't update any state itself, it
// just reports the raw event upward.
export default function SearchBar({ value, onChange, inputRef }) {
  return (
    <div className="relative">
      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
      <input
        // ref gives the parent direct DOM access to this exact <input>
        // element (used for .focus() — see ShopPage.jsx).
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e)}
        placeholder="Search products..."
        className="w-full pl-9 pr-3 py-2 text-sm border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white rounded-lg focus:outline-none focus:border-neutral-400"
      />
    </div>
  );
}

import { memo } from "react";
import { X } from "lucide-react";

// Wrapped in memo to demonstrate useCallback actually mattering (see
// ShopPage.jsx, where handleClear is passed in). onClear is passed
// PARENT -> CHILD; clicking it is CHILD -> PARENT (this component
// doesn't know or care what onClear does).
function ClearSearchButtonImpl({ onClear }) {
  return (
    <button
      onClick={onClear}
      className="flex items-center gap-1 text-xs text-neutral-400 hover:text-neutral-700"
    >
      <X size={12} /> Clear search
    </button>
  );
}

const ClearSearchButton = memo(ClearSearchButtonImpl);
export default ClearSearchButton;

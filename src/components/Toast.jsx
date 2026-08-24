import { createPortal } from "react-dom";
import { useEffect } from "react";
import { CheckCircle2 } from "lucide-react";

// Toast shows a brief "Added to cart!" style message. It's controlled
// entirely by its PARENT — this component just displays whatever
// "message" it's given, and calls onDone() when it's time to disappear.
// message + onDone are passed PARENT -> CHILD, same pattern as always.
export default function Toast({ message, onDone }) {
  useEffect(() => {
    // setTimeout schedules code to run once, after a delay (here, 1600ms).
    const timer = setTimeout(onDone, 1600);
    // Cleanup function: if this Toast disappears or re-triggers before
    // the timer finishes, cancel the old timer so it doesn't fire late
    // against a toast that's already gone.
    return () => clearTimeout(timer);
  }, [onDone]);

  // createPortal(whatToRender, whereToRenderIt). Even though <Toast />
  // might be called from deep inside ProductCard, the actual <div>
  // below ends up as a direct child of <body> in the real HTML — so it
  // floats above EVERYTHING, immune to any parent's overflow/z-index.
  return createPortal(
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-neutral-900 text-white text-sm px-4 py-2.5 rounded-full flex items-center gap-2 shadow-lg z-50">
      <CheckCircle2 size={16} className="text-green-400" />
      {message}
    </div>,
    document.body
  );
}

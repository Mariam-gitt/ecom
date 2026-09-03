import { useEffect } from "react";
import { ShoppingCart, Heart, Sun, Moon } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useTheme } from "../context/ThemeContext";

export default function Header() {
  const { cart } = useCart();
  const { wishlistIds } = useWishlist();
  const { isDark, toggleTheme } = useTheme();

  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  const totalPrice = cart
    .reduce((sum, item) => sum + item.price * item.qty, 0)
    .toFixed(2);

  useEffect(() => {
    document.title = totalItems > 0 ? `Cart (${totalItems})` : "useContext Shop";
  }, [totalItems]);

  return (
    <header className="sticky top-0 z-10 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 transition-colors">
      <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="text-lg font-semibold tracking-tight dark:text-white">
          Shahana
        </Link>
        <nav className="flex items-center gap-3">
          {/* Dark mode toggle — a plain button, no navigation involved,
              just calls toggleTheme() from context. isDark decides
              which icon shows: sun (to switch TO light) in dark mode,
              moon (to switch TO dark) in light mode. */}
          <button
            onClick={toggleTheme}
            className="w-9 h-9 flex items-center justify-center rounded-full border border-neutral-200 dark:border-neutral-700 dark:text-white"
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {/* Wishlist link with a live count badge, same pattern as the
              cart pill below it. */}
          <Link
            to="/wishlist"
            className="relative w-9 h-9 flex items-center justify-center rounded-full border border-neutral-200 dark:border-neutral-700 dark:text-white"
          >
            <Heart size={16} />
            {wishlistIds.length > 0 && (
              // bg-brand-600: the shared brand red (see tailwind.config.js)
              // instead of Tailwind's generic red-500, so this badge
              // matches every other red accent in the app.
              <span className="absolute -top-1 -right-1 bg-brand-600 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                {wishlistIds.length}
              </span>
            )}
          </Link>

          <Link
            to="/cart"
            // bg-brand-600/hover:bg-brand-700: same red in BOTH light and
            // dark mode (no dark: override needed) — red already has
            // enough contrast against white text in both themes, so this
            // is simpler than the old "invert to white in dark mode" logic.
            className="flex items-center gap-2 bg-brand-600 text-white px-4 py-2 rounded-full text-sm hover:bg-brand-700 transition-colors"
          >
            <ShoppingCart size={16} />
            <span>{totalItems} items</span>
            <span className="opacity-50">|</span>
            <span>${totalPrice}</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}

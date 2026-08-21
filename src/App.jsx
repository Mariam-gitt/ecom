import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import { ErrorBoundary } from "./components/ErrorBoundary";
import Header from "./components/Header";
import ShopPage from "./pages/ShopPage";
import CartPage from "./pages/CartPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import WishlistPage from "./pages/WishlistPage";

const CheckoutPage = lazy(() => import("./pages/CheckoutPage"));

// Split into its own inner component so it can call useTheme() —
// ThemeProvider has to be an ANCESTOR of whatever reads isDark, and App
// itself renders ThemeProvider, so App can't read from it directly.
function AppShell() {
  const { isDark } = useTheme();

  return (
    <BrowserRouter>
      {/* "dark" class toggled on this root div is what activates every
          dark: variant className throughout the app (thanks to
          darkMode: "class" in tailwind.config.js). One class, applied
          once, cascades to every dark: utility used anywhere below it. */}
      <div className={isDark ? "dark" : ""}>
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 transition-colors">
          <Header />
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<ShopPage />} />
              <Route path="/product/:id" element={<ProductDetailPage />} />
              <Route path="/wishlist" element={<WishlistPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route
                path="/checkout"
                element={
                  <Suspense fallback={<p className="max-w-4xl mx-auto px-6 py-12 text-center text-neutral-400">Loading checkout...</p>}>
                    <CheckoutPage />
                  </Suspense>
                }
              />
            </Routes>
          </ErrorBoundary>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <CartProvider>
      <WishlistProvider>
        <ThemeProvider>
          <AppShell />
        </ThemeProvider>
      </WishlistProvider>
    </CartProvider>
  );
}

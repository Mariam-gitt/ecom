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
import NotFoundPage from "./pages/NotFoundPage";
import CheckoutSuccessPage from "./pages/CheckoutSuccessPage";
import MockCheckoutPage from "./pages/MockCheckoutPage";

const CheckoutPage = lazy(() => import("./pages/CheckoutPage"));
// AdminPage is lazy too, and for a slightly different reason than
// CheckoutPage: most visitors will NEVER open /admin at all, so there
// is no reason to make everyone else's initial page load include its
// code (the orders table, the login form, etc). Code-splitting like
// this means that JavaScript only downloads for someone who actually
// navigates to /admin.
const AdminPage = lazy(() => import("./pages/AdminPage"));

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
              {/* Our simulated gateway's "hosted payment page" — see
                  server/src/routes/payments.js and
                  MockCheckoutPage.jsx for why this exists instead of
                  a real redirect to a payment provider. */}
              <Route path="/mock-checkout" element={<MockCheckoutPage />} />
              {/* The gateway redirects here after payment completes —
                  see server/src/routes/payments.js. Not lazy-loaded
                  like the others since it's part of the critical
                  checkout path, not an optional/rarely-used page. */}
              <Route path="/checkout/success" element={<CheckoutSuccessPage />} />
              <Route
                path="/admin"
                element={
                  <Suspense fallback={<p className="max-w-4xl mx-auto px-6 py-12 text-center text-neutral-400">Loading admin...</p>}>
                    <AdminPage />
                  </Suspense>
                }
              />
              {/* "*" matches ANY path not caught by a Route above it —
                  this MUST be last, since Routes stops at the first
                  match it finds, checked top to bottom. */}
              <Route path="*" element={<NotFoundPage />} />
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

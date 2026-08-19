import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import { ErrorBoundary } from "./components/ErrorBoundary";
import Header from "./components/Header";
import ShopPage from "./pages/ShopPage";
import CartPage from "./pages/CartPage";
import ProductDetailPage from "./pages/ProductDetailPage";

// React.lazy() creates a component whose CODE isn't downloaded until it
// is actually rendered for the first time. Instead of a normal:
//   import CheckoutPage from "./pages/CheckoutPage";
// this wraps a dynamic import() in a function — that import() only
// actually runs the first time <CheckoutPage /> gets rendered.
const CheckoutPage = lazy(() => import("./pages/CheckoutPage"));

export default function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-neutral-50 text-neutral-900">
          <Header />
          {/* ErrorBoundary wraps everything below Header — if ANY page
              or component inside here crashes while rendering, this
              shows a fallback message instead of a blank white screen.
              Header stays OUTSIDE it on purpose, so navigation still
              works even if a page below it breaks. */}
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<ShopPage />} />
              <Route path="/product/:id" element={<ProductDetailPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route
                path="/checkout"
                element={
                  // Suspense shows "fallback" for however long it takes
                  // to download CheckoutPage's code, the FIRST time
                  // someone visits this route. Every visit after that,
                  // it's already downloaded and shows instantly.
                  <Suspense fallback={<p className="max-w-4xl mx-auto px-6 py-12 text-center text-neutral-400">Loading checkout...</p>}>
                    <CheckoutPage />
                  </Suspense>
                }
              />
            </Routes>
          </ErrorBoundary>
        </div>
      </BrowserRouter>
    </CartProvider>
  );
}

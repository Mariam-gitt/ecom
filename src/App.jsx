// BrowserRouter turns on routing for the whole app (reads/writes the
// real browser URL). Routes is a container that looks at the CURRENT
// URL and renders whichever ONE Route inside it matches.
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import ShopPage from "./pages/ShopPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import Header from "./components/Header";

export default function App() {
  return (
    <CartProvider>
      {/* Everything inside BrowserRouter can use routing features
          (Link, useNavigate, etc). It should wrap the whole app, high up
          — similar in spirit to how CartProvider wraps everything that
          needs cart access. */}
      <BrowserRouter>
        <div className="min-h-screen bg-neutral-50 text-neutral-900">
          {/* Header is now OUTSIDE the Routes — it appears on every
              page, since it's not tied to any one URL. */}
          <Header />
          {/* Routes picks exactly ONE of its Route children to render,
              based on matching the current URL path. */}
          <Routes>
            {/* path="/" matches the homepage URL. "element" is the
                component to render when this path matches — note it's
                element={<ShopPage />}, an actual JSX element, not just
                the component name. */}
            <Route path="/" element={<ShopPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
          </Routes>
        </div>
      </BrowserRouter>
    </CartProvider>
  );
}

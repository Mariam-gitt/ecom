import { CartProvider } from "./context/CartContext";
import ShopPage from "./pages/ShopPage";

// App's ONLY job now is to wrap the app in CartProvider — the cart's
// actual state (useReducer) lives inside CartContext.jsx, not here.
export default function App() {
  return (
    <CartProvider>
      <div className="min-h-screen bg-neutral-50 text-neutral-900">
        <ShopPage />
      </div>
    </CartProvider>
  );
}

// createContext makes the "broadcast box". useContext is how a
// component tunes into it. useReducer is the cart's state + dispatch.
// useEffect is new here — it's what syncs the cart to localStorage.
import { createContext, useContext, useReducer, useEffect } from "react";
import { cartReducer } from "./cartReducer";

const CartContext = createContext(null);

// A plain helper function (not a hook — no "use" prefix, doesn't call
// any hooks) that reads whatever was saved last time, or falls back to
// an empty cart if there's nothing saved yet (or it's corrupted).
function loadCartFromStorage() {
  try {
    const saved = localStorage.getItem("cart");
    // localStorage only stores STRINGS — JSON.parse converts that
    // string back into a real JS array/object.
    return saved ? JSON.parse(saved) : [];
  } catch {
    // If the saved data is somehow broken (manually edited, corrupted),
    // fail safely back to an empty cart instead of crashing the app.
    return [];
  }
}

export function CartProvider({ children }) {
  // useReducer's SECOND argument is normally the initial state (we used
  // [] before). Here we call loadCartFromStorage() to compute it
  // instead — so the cart starts with whatever was saved last time,
  // not always empty.
  const [cart, dispatch] = useReducer(cartReducer, undefined, loadCartFromStorage);

  // Every time "cart" changes (any dispatch — add, remove, increase,
  // etc.), write the new value out to localStorage. This is a side
  // effect — reaching outside React to talk to a browser API — which is
  // exactly what useEffect is for.
  useEffect(() => {
    // JSON.stringify does the reverse of JSON.parse — converts the real
    // JS array back into a string, since that's all localStorage can
    // store.
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  return (
    <CartContext.Provider value={{ cart, dispatch }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used inside <CartProvider>");
  }
  return context;
}

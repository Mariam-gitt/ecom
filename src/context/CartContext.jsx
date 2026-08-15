// createContext makes the "broadcast box". useContext is how a
// component tunes into it. useReducer is the cart's state + dispatch,
// same as before — just wired up here instead of in App.jsx directly.
import { createContext, useContext, useReducer } from "react";
import { cartReducer } from "./cartReducer";

// STEP 1: create the context object itself. It starts with no value —
// the real value only gets set once a <CartContext.Provider> renders.
const CartContext = createContext(null);

// STEP 2: CartProvider is a wrapper component. Anything rendered INSIDE
// it (via "children") gets access to { cart, dispatch } through context.
// This is the ONLY place useReducer is called — the cart's actual state
// lives here, nowhere else.
export function CartProvider({ children }) {
  const [cart, dispatch] = useReducer(cartReducer, []);

  return (
    // The Provider's "value" prop is what every descendant receives when
    // they call useCart() below. "children" here means: whatever JSX
    // was placed between <CartProvider> and </CartProvider> wherever
    // this component gets used (see App.jsx).
    <CartContext.Provider value={{ cart, dispatch }}>
      {children}
    </CartContext.Provider>
  );
}

// STEP 3: a small custom hook wrapping useContext(CartContext), so every
// component elsewhere can just write useCart() instead of repeating
// useContext(CartContext) everywhere, and gets a clear error if used
// outside the Provider by mistake.
export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used inside <CartProvider>");
  }
  return context; // { cart, dispatch }
}

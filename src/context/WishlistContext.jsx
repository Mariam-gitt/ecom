import { createContext, useContext, useState } from "react";

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  // We only need to remember WHICH product ids are wishlisted, not full
  // product objects — a plain array of ids is enough, since we can
  // always look up full product details elsewhere when we need them.
  const [wishlistIds, setWishlistIds] = useState([]);

  // One function handles both adding AND removing — "toggle" means:
  // if it's already there, take it out; if not, add it in.
  function toggleWishlist(productId) {
    setWishlistIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId) // remove
        : [...prev, productId] // add
    );
  }

  // A small helper so components can ask "is THIS product wishlisted?"
  // without repeating the .includes() check everywhere themselves.
  function isWishlisted(productId) {
    return wishlistIds.includes(productId);
  }

  return (
    <WishlistContext.Provider value={{ wishlistIds, toggleWishlist, isWishlisted }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) throw new Error("useWishlist must be used inside <WishlistProvider>");
  return context;
}

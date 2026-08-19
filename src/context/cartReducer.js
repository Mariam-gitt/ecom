// This file holds ONLY the reducer function — no React, no components.
// Keeping it separate means "all the rules for how the cart changes"
// live in exactly one place.
export function cartReducer(state, action) {
  switch (action.type) {
    case "ADD": {
      // action.qty is optional — ProductCard's quick-add button doesn't
      // pass one (defaults to 1), but the product detail page's
      // quantity selector can pass a specific amount.
      const qtyToAdd = action.qty || 1;
      const existing = state.find((item) => item.id === action.product.id);

      if (existing) {
        // Already in the cart -> return a NEW array where just that one
        // item's quantity is increased by qtyToAdd (not always +1
        // anymore, now that quantity selectors exist).
        return state.map((item) =>
          item.id === action.product.id
            ? { ...item, qty: item.qty + qtyToAdd }
            : item
        );
      }
      // Not in the cart yet -> add it with qty starting at qtyToAdd.
      return [...state, { ...action.product, qty: qtyToAdd }];
    }

    case "INCREASE": {
      return state.map((item) =>
        item.id === action.id ? { ...item, qty: item.qty + 1 } : item
      );
    }

    case "DECREASE": {
      // Decrease qty by 1, removing the item entirely if it would hit 0.
      return state
        .map((item) =>
          item.id === action.id ? { ...item, qty: item.qty - 1 } : item
        )
        .filter((item) => item.qty > 0);
    }

    case "REMOVE": {
      return state.filter((item) => item.id !== action.id);
    }

    case "CLEAR": {
      return [];
    }

    default:
      return state;
  }
}

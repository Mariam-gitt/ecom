// This file holds ONLY the reducer function — no React, no components.
// It's a plain JavaScript function: (currentState, action) -> newState.
// Keeping it separate means you can find "all the rules for how the
// cart changes" in exactly one place, without wading through any UI code.
export function cartReducer(state, action) {
  // "switch" checks action.type against each case below, one at a time.
  switch (action.type) {
    case "ADD": {
      // Look for an existing cart entry matching this product's id.
      const existing = state.find((item) => item.id === action.product.id);

      if (existing) {
        // Already in the cart -> return a NEW array where just that one
        // item has its quantity increased by 1. Never mutate "state"
        // directly — always build and return a fresh array/object.
        return state.map((item) =>
          item.id === action.product.id
            ? { ...item, qty: item.qty + 1 }
            : item
        );
      }
      // Not in the cart yet -> spread the OLD array into a NEW one, plus
      // this new product added at the end with qty starting at 1.
      return [...state, { ...action.product, qty: 1 }];
    }

    case "INCREASE": {
      // action.id tells us WHICH cart item to bump up by 1.
      return state.map((item) =>
        item.id === action.id ? { ...item, qty: item.qty + 1 } : item
      );
    }

    case "DECREASE": {
      // Decrease qty by 1, but if it would hit 0, remove the item
      // entirely instead of leaving a "qty: 0" ghost entry behind.
      return state
        .map((item) =>
          item.id === action.id ? { ...item, qty: item.qty - 1 } : item
        )
        .filter((item) => item.qty > 0);
    }

    case "REMOVE": {
      // .filter() keeps everything EXCEPT the matching id.
      return state.filter((item) => item.id !== action.id);
    }

    case "CLEAR": {
      // Empty the whole cart.
      return [];
    }

    default:
      // Good practice: an unrecognized action just returns state
      // unchanged, instead of crashing the app.
      return state;
  }
}

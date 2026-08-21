# Three Necessary Fixes — Concepts & Where They Live

Not a feature wishlist this time — three genuine gaps a real store can't
ship without.

---

## 1. Cart persists on refresh

**The gap:** `cart` only lived in `useReducer` — in memory, gone the
moment the page reloads.

**The concept — `localStorage`:** a simple key-value store built into
every browser, completely separate from React, that survives reloads
and even closing the tab. It only stores **strings**, so saving/loading
real data means converting back and forth:
- `JSON.stringify(cart)` — turns the real array into a string, to save it
- `JSON.parse(savedString)` — turns that string back into a real array

**Where:** `src/context/CartContext.jsx`
- `loadCartFromStorage()` — a plain function (not a hook) that reads
  and parses whatever was saved, or falls back to `[]` if there's
  nothing there yet, or it's corrupted.
- `useReducer(cartReducer, undefined, loadCartFromStorage)` — the
  **third argument** to `useReducer` is new: it's a function React
  calls once, lazily, to compute the *actual* initial state. This is
  how the cart starts pre-filled instead of always empty.
- `useEffect(() => { localStorage.setItem(...) }, [cart])` — writes the
  cart to storage every time it changes. Same "sync with something
  outside React" pattern you already know from the `document.title`
  effect in `Header`.

---

## 2. Checkout reflects the actual cart

**The gap:** `CheckoutForm` asked for name/email with zero connection
to what was actually in the cart, or its total.

**The concept:** nothing new, actually — just `useCart()` (context you
already had) pulled into the checkout flow, and calling
`dispatch({ type: "CLEAR" })` at the moment an order succeeds.

**Where:**
- `src/pages/CheckoutPage.jsx` — now reads `cart` via `useCart()` and
  renders an order summary (each item, quantity, running total) above
  the form.
- `src/components/CheckoutForm.jsx` — now receives `cart` and
  `totalPrice` as **props** from CheckoutPage (this is why it's no
  longer fully "standalone" the way it used to be). On successful
  submit, it dispatches `CLEAR` — timed deliberately AFTER validation
  passes, so a failed submission never loses the user's cart.

**Small but real decision worth noticing:** the cart only clears on
*success*, not on every submit attempt — validation errors leave it
untouched so the user doesn't lose their items over a typo.

---

## 3. 404 page

**The gap:** visiting a URL that doesn't match any route just showed a
blank area — no feedback that anything went wrong.

**The concept — a wildcard route:** `<Route path="*" element={...} />`
matches ANY path not caught by a route listed above it. `Routes`
checks its children in order and stops at the first match, which is
why the wildcard **must be the last** `<Route>` — if it came first,
it would swallow every URL, including valid ones.

**Where:** `src/pages/NotFoundPage.jsx` (new file) +
`src/App.jsx` — `<Route path="*" element={<NotFoundPage />} />` added
as the final route.

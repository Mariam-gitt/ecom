# Changelog — Dark Mode, Wishlist, Reviews & Ratings

What was added this round, and exactly where to find it in the code.

---

## 1. Dark Mode

**New files:**
- `src/context/ThemeContext.jsx` — `ThemeProvider` (holds `isDark` state
  + `toggleTheme` function) and the `useTheme()` hook.

**Changed:**
- `tailwind.config.js` — added `darkMode: "class"`, which makes every
  `dark:` utility class only activate when a `.dark` class is present
  on an ancestor element.
- `src/App.jsx` — wrapped the app in `<ThemeProvider>`. Split out a new
  `AppShell` inner component so it could call `useTheme()` (a component
  can't read from a context it's also the one rendering the Provider
  for — it has to be a *descendant* of the Provider). The root `<div>`
  now conditionally gets `className={isDark ? "dark" : ""}`.
- `src/components/Header.jsx` — added the sun/moon toggle button,
  calling `toggleTheme()` from `useTheme()`.
- `dark:` variants added throughout: `ProductCard`, `ProductDetailPage`,
  `CartPanel`, `CheckoutForm`, `CartPage`, `ShopPage`'s dropdowns —
  anywhere with a background/border/text color.

**How it works, in one line:** one class (`dark`) toggled on a single
root element cascades to every `dark:` utility used anywhere below it
in the tree — you never toggle classes on individual elements yourself.

---

## 2. Wishlist

**New files:**
- `src/context/WishlistContext.jsx` — `WishlistProvider` (stores an
  array of wishlisted product **ids**, not full product objects) with
  `toggleWishlist(id)` and `isWishlisted(id)`, plus the `useWishlist()` hook.
- `src/pages/WishlistPage.jsx` — the `/wishlist` route. Takes the
  stored ids, fetches the full product list via `useProducts()`, and
  filters down to just the wishlisted ones.

**Changed:**
- `src/App.jsx` — wrapped in `<WishlistProvider>`, added
  `<Route path="/wishlist" element={<WishlistPage />} />`.
- `src/components/ProductCard.jsx` — added the heart button (absolutely
  positioned, top-right of the card). Uses `e.preventDefault()` +
  `e.stopPropagation()` since it visually sits on top of the `<Link>`
  wrapping the rest of the card.
- `src/pages/ProductDetailPage.jsx` — same heart toggle, inline instead
  of absolutely positioned.
- `src/components/Header.jsx` — heart icon link to `/wishlist`, with a
  small count badge when non-empty.

**Design choice worth noting:** we only store **ids**, not full product
objects, in `WishlistContext`. Keeps the context small, and avoids
having two separate copies of the same product data drift out of sync.

---

## 3. Reviews & Star Ratings

**New files:**
- `src/components/StarRating.jsx` — a small, purely presentational
  component. Takes `rate` and `count`, renders 5 stars (filled up to
  `Math.round(rate)`). No state, no context — just props in, JSX out.

**Changed:**
- `src/components/ProductCard.jsx` — `<StarRating rate={product.rating?.rate} count={product.rating?.count} />`
  added under the title. The `?.` (optional chaining) guards against
  a product without a `rating` field crashing the render.
- `src/pages/ProductDetailPage.jsx` — same `StarRating`, plus an
  entirely new **Reviews** section: a controlled form (name + text)
  and a rendered list of submitted reviews.

**Important limitation, on purpose:** reviews live in
`ProductDetailPage`'s own local `useState` — **not** in context, not
in the backend. They reset on page reload. This was a deliberate
choice, since there's no backend yet to actually persist them to. When
the backend does exist, this is the natural next thing to wire up —
POST the review, GET the list, instead of local state.

---

## Files touched, complete list

```
NEW:
  src/context/ThemeContext.jsx
  src/context/WishlistContext.jsx
  src/components/StarRating.jsx
  src/pages/WishlistPage.jsx

CHANGED:
  tailwind.config.js
  src/App.jsx
  src/components/Header.jsx
  src/components/ProductCard.jsx
  src/pages/ProductDetailPage.jsx
  src/pages/CartPage.jsx
  src/components/CartPanel.jsx
  src/components/ClearCartButton.jsx
  src/components/ClearSearchButton.jsx
  src/components/SearchBar.jsx
  src/components/CheckoutForm.jsx
  src/pages/ShopPage.jsx
```

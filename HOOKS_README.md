# What problem does each hook solve?

A quick reference — not a tutorial. For each hook: the problem it exists
to solve, and where you can see it doing that job in this app.

---

## useState
**Problem it solves:** "I need this component to remember a value, and
re-render automatically when that value changes."

Before useState, a plain JS variable would reset to its initial value on
every re-render, and changing it wouldn't tell React to redraw anything.

**Where:** `searchText` in ShopPage, and the form fields in CheckoutForm.
Simple, standalone values — nothing else needs to know the logic behind
changing them.

---

## useReducer
**Problem it solves:** "I have ONE piece of state, but MANY different
ways to change it (add, remove, increase, decrease, clear) — and I don't
want that logic scattered across five different button handlers."

useState works fine for one or two simple updates. Once you have several
related actions on the same piece of state, useReducer centralizes all
of them into one function (the reducer), so every component just sends
a short "request" (`dispatch({ type: "..." })`) instead of containing
its own update logic.

**Where:** the whole cart. `cartReducer` is the one place that knows
HOW to add/increase/decrease/remove/clear. Every button just dispatches.

---

## useContext
**Problem it solves:** "Multiple components, at different depths, need
the same data — and manually passing it down through every layer in
between (prop drilling) is repetitive and easy to get inconsistent."

Without context, `dispatch` would have to be passed App → ShopPage →
ProductGrid → ProductCard, even though ShopPage and ProductGrid never
use it themselves — just forwarding it along.

**Where:** `CartContext`. Any component wrapped inside the Provider
(Header, ProductCard, CartPanel, ClearCartButton, ClearSearchButton)
can grab `{ cart, dispatch }` directly, however deep it is.

---

## useEffect
**Problem it solves:** "I need to do something AFTER rendering, as a
reaction to a value changing — usually to sync React with something
outside React's control (a browser API, a subscription, a timer)."

Rendering itself should stay "pure" — just describing what the UI looks
like. useEffect is the escape hatch for side effects that don't belong
inside that description.

**Where:** two spots.
- Header updates `document.title` when `totalItems` changes — syncing
  React state with a plain browser API.
- ShopPage focuses the search input once, on mount (empty `[]`
  dependency array = run only after the very first render).

---

## useRef
**Problem it solves:** "I need to directly reach into a real DOM
element (or hold a value across renders) WITHOUT causing a re-render
when it changes."

State (`useState`) always triggers a re-render when updated. Sometimes
you don't want that — you just want a stable handle to something.

**Where:** `inputRef` in ShopPage — a direct reference to the actual
`<input>` element, used only so `useEffect` can call `.focus()` on it.
Nothing about the ref itself is ever rendered on screen.

---

## React.memo
**Problem it solves:** "This component re-renders even though its own
props didn't actually change — wasted work."

By default, when a parent re-renders, ALL its children re-render too,
regardless of whether their specific props changed. `memo` adds a
shortcut check: if props are the same as last time, skip re-rendering
this component and reuse the previous result.

**Where:** `ProductCard`. Typing in the search box re-renders ShopPage
and ProductGrid, but cards for products that are still in the filtered
list keep the exact same `product` prop reference — so memo lets them
skip re-rendering entirely.

---

## useCallback
**Problem it solves:** "I'm passing a function down as a prop to a
`memo`-wrapped child, but a NEW function gets created every render —
which defeats memo, since the prop always looks 'different.'"

useCallback keeps the same function reference across renders (as long
as its dependencies don't change), so a memoized child can actually
detect "nothing changed" and skip re-rendering.

**Where:** `handleClear` in ShopPage, passed to the memoized
`ClearSearchButton`. Note: it has no visible effect on screen — it only
matters to React's internal render-skipping, which you'd only see in
React DevTools.

---

## One-line summary table

| Hook | Solves |
|---|---|
| useState | remember + react to a simple value |
| useReducer | centralize many related state changes in one place |
| useContext | share data across many components without prop drilling |
| useEffect | run code after render, in sync with a changing value |
| useRef | get a stable handle to something (usually a DOM element) without re-rendering |
| memo | skip re-rendering a component if its props didn't change |
| useCallback | keep a function's identity stable so memo can actually work |

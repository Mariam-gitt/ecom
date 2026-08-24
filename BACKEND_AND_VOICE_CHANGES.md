# Backend, Voice Search, Payments & Admin — What Changed, and Why

Same format as `NECESSARY_FEATURES.md` and `CHANGELOG.md`: the gap,
the concept, where it lives. This covers everything added across three
rounds of changes.

---

## 1. A real backend (there wasn't one)

**The gap:** the frontend called `fakestoreapi.com` directly from the
browser, cart lived only in `localStorage`, and "checkout" just flipped
a local `submitted` flag — no order was ever recorded anywhere.

**The concept — client vs. server:** a browser can't be trusted to be
the source of truth for anything (data can be edited in devtools,
requests can be replayed, API keys in browser code are visible to
anyone). A backend is a program YOU control, that YOUR frontend talks
to over HTTP, which is the only place real data and secrets should
live.

**Where:** new `server/` folder.
- `server/src/index.js` — the Express app: middleware (`cors`,
  `express.json()`), mounts each route file, starts listening.
- `server/src/services/jsonStore.js` — a tiny file-based "database".
  Conceptually identical to `loadCartFromStorage` in `CartContext.jsx`
  — read a string, `JSON.parse` it, mutate, `JSON.stringify` it back —
  just using Node's `fs` instead of the browser's `localStorage`.
  **Not** production-grade (no locking, no transactions) — fine for
  dev/learning. Every route only talks to
  `readCollection`/`writeCollection`, so swapping in a real database
  later means rewriting one file, not every route.
- `server/src/services/seed.js` — on first boot, fetches
  `fakestoreapi.com` **once** and saves it as our own
  `data/products.json`. From then on we serve our own copy.
- `server/src/routes/products.js` — `GET /api/products`,
  `GET /api/products/:id`, `GET /api/products/categories`.

**Frontend side:** `src/lib/api.js` is one small `fetch` wrapper so
every hook/component calls `api.getProducts()` etc. instead of typing
raw URLs everywhere. `useProducts.js` calls this instead of
`fakestoreapi.com` directly.

---

## 2. Voice search — from string-matching to a real LLM

**The gap:** `ShopPage.jsx`'s old `handleVoiceResult` just lowercased
the transcript and ran `.includes("electronics")`,
`.includes("cheap")`, etc. Couldn't handle price bounds ("under $50"),
synonyms ("gadgets" vs "electronics"), or any phrasing it wasn't
hand-coded for.

**The concept — natural language → structured query:** send the raw
transcript to an LLM with a system prompt that defines a **closed
schema** (`keywords`, `category`, `minPrice`, `maxPrice`, `sortBy`)
and the real category names from the actual product catalog, demand
JSON-only output, and apply the result directly to existing filter
state. The model's job isn't to be creative — it's to be a much more
flexible parser than `.includes()` ever could be.

**Where:**
- `server/src/services/llmClient.js` — builds the prompt, calls the
  LLM provider, defensively parses the response (strips stray
  ` ```json ` fences, catches parse failures, normalizes missing
  fields to `null`). **This is the ONLY file that changes when
  swapping LLM providers** — every route just calls
  `parseVoiceQuery(transcript, categories)` and doesn't know or care
  what's behind it.
- `server/src/routes/voiceSearch.js` — the `POST /api/voice-search`
  endpoint; loads real category names from the product store.
- `src/pages/ShopPage.jsx` — `handleVoiceResult` is `async`, calls
  `api.voiceSearch(transcript)`, applies the returned filters
  (including `minPrice`/`maxPrice` — new, the old version had no
  price parsing at all), shows a spinner on the mic button while
  parsing, and **falls back to the old keyword-matching
  (`naiveParse`) if the LLM call fails** — voice search degrades
  gracefully instead of breaking outright.
- `src/hooks/useVoiceSearch.js` — **unchanged**. Speech-to-text (the
  browser's built-in `SpeechRecognition` API) was never the problem;
  only what happened to the text afterward was.

### Ollama vs. Groq — the two providers this project has used

We tried this feature with two different LLM backends. Both slot into
the exact same `parseVoiceQuery()` function signature — only
`llmClient.js`'s internals differ. Here's what actually distinguishes
them, since "which free option" is a real, recurring decision:

| | **Ollama** (tried first) | **Groq** (current) |
|---|---|---|
| **Where the model runs** | On YOUR OWN computer | On Groq's cloud servers |
| **Cost** | Free forever, no account | Free tier, no card required to sign up |
| **Setup** | Install Ollama app + `ollama pull llama3.2` (~2GB download) | Sign up at console.groq.com, copy an API key |
| **Internet required?** | No, works fully offline once model is downloaded | Yes — it's a normal network API call |
| **Speed** | Depends entirely on YOUR machine's CPU/GPU | Very fast — Groq runs models on custom hardware built for this |
| **Deployability** | Hard — whatever server hosts your backend must ALSO have Ollama installed and enough RAM/CPU to run the model 24/7. Most free/cheap hosting can't do this. | Easy — it's just an HTTPS call, works from any server, any host, zero extra infrastructure |
| **Request shape** | Ollama's own API format (`/api/chat`, `format: "json"`) | OpenAI-compatible format (`/chat/completions`, `response_format: json_object`) — same shape as OpenAI's API |
| **Auth** | None — it's local, nothing to authenticate | Bearer token (`Authorization: Bearer <key>`) — same pattern as most hosted APIs |
| **Best for** | Local development, offline work, zero ongoing cost forever, privacy (data never leaves your machine) | Actually deploying this app somewhere real, or just wanting the simplest possible setup |

**Why we switched from Ollama to Groq:** Ollama is genuinely free and
private, but "free" only covers your own machine — the moment you want
to **deploy** this project (put it on a real server so other people
can use it), Ollama stops being free or simple: you'd need to rent a
server capable of running an LLM continuously, which usually costs
more than just using a hosted API's free tier. Groq's free tier has
no such catch — the model runs on Groq's infrastructure regardless of
where your own backend is hosted, so deployment is just "put your
Express app somewhere" with no extra machine needed for the AI part.

**The actual code difference**, for anyone comparing the two
implementations directly:
```js
// Ollama — local, no auth, its own request shape
fetch("http://localhost:11434/api/chat", {
  body: JSON.stringify({ model, messages, format: "json" })
});

// Groq — hosted, Bearer auth, OpenAI-compatible shape
fetch("https://api.groq.com/openai/v1/chat/completions", {
  headers: { Authorization: `Bearer ${apiKey}` },
  body: JSON.stringify({ model, messages, response_format: { type: "json_object" } })
});
```
Both get parsed the same way afterward, and both return the exact same
`{ keywords, category, minPrice, maxPrice, sortBy }` shape to the rest
of the app — the swap was contained entirely inside `llmClient.js`.

**Coming back to Ollama later:** if you want local/offline voice
search again (e.g. for privacy, or working without internet), you'd
restore the Ollama version of `llmClient.js` and point `OLLAMA_URL` /
`OLLAMA_MODEL` in `.env` — nothing else in the project needs to change.

---

## 3. Checkout now creates a real order

**The gap:** `CheckoutForm.jsx` set `submitted = true` locally and
cleared the cart — nothing was actually recorded, and there was no
real payment step at all.

**The concept:** validate → create a "pending" order record → (new)
send the customer to actually pay → only clear the cart once payment
is CONFIRMED, not just attempted.

**Where:** `server/src/routes/orders.js` — `POST /api/orders` creates
the order with `status: "pending"`. This happens BEFORE payment now
(see next section) so there's a record even if the customer abandons
checkout partway through.

---

## 4. Payment integration — simulated gateway (Stripe doesn't cover Pakistan)

**The gap:** no payment step existed at all — "checkout" was purely
cosmetic. The first version of this section used real **Stripe
Checkout** in test mode. That had to change: **Stripe doesn't support
Pakistan for account creation at all**, not even for test-mode keys.
Real Pakistani gateways (Safepay, GoPayFast, JazzCash merchant
accounts, etc.) exist, but require business KYC (CNIC, business
registration, bank account) before you get even sandbox API keys —
real paperwork, not something to sort out just to test whether a
checkout *feature* works.

**The concept — same shape, fake backing:** rather than drop the
payment step entirely, this simulates a real gateway's exact
*flow*, with nothing real behind it:
1. Create a "pending" order (unchanged from before).
2. Ask our own backend for a "checkout session" — in a real
   integration this would call out to Stripe/Safepay/etc. and get
   back a URL on *their* site. Here, our own backend just creates a
   session record locally and returns a URL on **our own frontend**.
3. Redirect the browser there (`window.location.href = url`) — a real
   page navigation, same as it would be for an actual gateway.
4. `MockCheckoutPage.jsx` renders a fake "enter your card" screen.
   The card fields are disabled and never read — nothing typed there
   goes anywhere. Clicking Pay just tells the backend "mark this
   session paid."
5. Redirect to `/checkout/success`, which — **just like the real
   version** — does NOT trust the URL alone. It asks the backend to
   verify the session's status server-side before clearing the cart
   and showing confirmation.

**Why this is still worth building, not just skipping payment
entirely:** the two ideas that actually matter in a payment
integration — (a) never collect/see raw card data yourself, hand that
off to a hosted page instead, and (b) never trust a "success" redirect
without independently verifying it server-side — are both fully
present here. Only step 2's "who's actually behind the URL" is fake.
Swapping in a real gateway later only means rewriting
`server/src/routes/payments.js` (a real API call instead of a local
session record, a real webhook instead of `/mock-pay`) — nothing in
`orders.js`, `CheckoutForm.jsx`, or `CheckoutSuccessPage.jsx` needs to
change, since they only call `createCheckoutSession()`/`verify()` by
name.

**Where:**
- `server/src/routes/payments.js` — `create-checkout-session`,
  `mock-pay`, and `verify` endpoints, with a large comment block at
  the bottom explaining exactly what changes when swapping in a real
  gateway (Safepay, GoPayFast) once you have business KYC sorted.
- `src/pages/MockCheckoutPage.jsx` — new. The fake "hosted payment
  page" — disabled card inputs, a visible "simulated, no real card
  charged" notice, a Pay button that calls `/mock-pay`.
- `src/components/CheckoutForm.jsx` — creates the order + checkout
  session, then redirects to the mock payment page. No longer clears
  the cart itself.
- `src/pages/CheckoutSuccessPage.jsx` — verifies the session server-
  side, THEN clears the cart, shows a real confirmation. Same code as
  before this swap — it never needed to know payment was simulated.
- `src/App.jsx` — new `/mock-checkout` route.

**Not real, and shouldn't be mistaken for it:** this must never be
used for an actual store taking real money. There's no card
validation, no fraud checks, no real charge — anyone could open
devtools and call `/api/payments/mock-pay` directly to "pay" for
anything. It exists purely so the surrounding *flow* can be tested and
studied without needing a business account anywhere.

---

## 5. Admin dashboard

**The gap:** `GET /api/orders` existed (from an earlier round) but had
no UI, and — worse — was **completely unprotected**: anyone could hit
it and see every customer's name, email, and order history.

**The concept — a shared-secret gate, not a full auth system:** this
project has no user accounts at all, so a full login system (hashed
passwords, sessions, per-user permissions) would be a lot of new
infrastructure for "let me, the one admin, see my orders." Instead:
one password, stored in `.env`, checked on every admin request via a
header. Explicitly **not** meant to scale to multiple admins or
survive serious attack — a fine, honest tradeoff for a solo project.

**How it works:**
1. `server/src/middleware/adminAuth.js` — an Express **middleware**
   (a function that runs before a route handler, and can either call
   `next()` to continue or respond and stop the request there). Checks
   an `x-admin-token` header against `ADMIN_PASSWORD` from `.env`.
2. `server/src/routes/admin.js` — `POST /api/admin/login` just checks
   if a submitted password is correct, so the LOGIN FORM gets a clean
   yes/no answer without piggybacking on a data-fetching route.
3. `server/src/routes/orders.js` — `GET /` (list) and `PATCH /:id`
   (status update) are now behind `requireAdmin`. `POST /` (create,
   used at checkout by regular customers) and `GET /:id` (used by the
   payment success page) stay open, since those need to work for
   people who aren't admins at all.
4. `src/pages/AdminPage.jsx` — password form, then (once the backend
   confirms the password) an orders table with live stats (order
   count, revenue from paid+shipped orders) and a per-order status
   dropdown (`pending` → `paid` → `shipped`, or `cancelled`).
5. `src/lib/api.js` — `setAdminToken()` stores the password **in
   memory only** (a plain JS variable, not `localStorage`) after
   successful login, and attaches it as `x-admin-token` on every
   subsequent admin request. Refreshing the page logs you out — a
   deliberate simple tradeoff: no "remember me" convenience, but also
   nothing admin-related lingering in browser storage after the tab
   closes.

**Where:** `server/src/middleware/adminAuth.js` (new),
`server/src/routes/admin.js` (new), `src/pages/AdminPage.jsx` (new),
`src/App.jsx` (route added, lazy-loaded since most visitors never open
it), `src/components/Header.jsx` (small, low-key dashboard icon link).

---

## Running it locally

```bash
# Backend
cd server
cp .env.example .env
# Then fill in .env:
#   GROQ_API_KEY   - free, from https://console.groq.com/keys
#   ADMIN_PASSWORD - anything you want
# (no payment keys needed — the gateway is simulated, see section 4)
npm install
npm run dev                 # http://localhost:4000

# Frontend (separate terminal, from the project root)
cp .env.example .env        # defaults already point at localhost:4000
npm install
npm run dev                 # http://localhost:5173
```

**Trying it out:**
- Voice search: click the mic, say something like "cheap electronics
  under 50 dollars".
- Checkout: add items to cart, go to `/checkout`, fill in name/email,
  click through to the simulated payment page, click "Pay now
  (simulated)" — you'll land on a real confirmation page.
- Admin: click the dashboard icon in the header (or go to `/admin`),
  log in with whatever you set `ADMIN_PASSWORD` to, see the order you
  just placed, try changing its status.

First backend boot will fetch and cache `fakestoreapi.com`'s catalog
into `server/data/products.json` — after that it never calls out to it
again.

---

## Not done yet / worth knowing about

- **Real payment processing** — see section 4. Once you have a
  business account with a real gateway (Safepay, GoPayFast, etc.),
  `server/src/routes/payments.js` is the one file to rewrite; nothing
  else in the app needs to change.
- **Real user accounts** — there's still no customer login; orders are
  matched to people only by the email they type at checkout.
- **Admin auth is single-password, not multi-user** — see the note in
  `adminAuth.js` for what a production version would look like
  instead (hashed passwords, per-user accounts, expiring tokens).

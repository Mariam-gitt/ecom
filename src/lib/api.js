// One tiny helper instead of scattering fetch(...) calls with hardcoded
// URLs across every hook/component. VITE_API_URL comes from the
// frontend's .env file (Vite exposes anything prefixed VITE_ to the
// browser via import.meta.env — see .env.example at the project root).
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

// `adminToken` is set once (see AdminPage.jsx) after a successful
// /api/admin/login call, and attached to every admin request from
// then on. It lives only in memory (a plain module-level variable) —
// NOT localStorage — so it clears automatically if the tab is closed
// or the page is refreshed, meaning the admin has to log in again.
// That's a deliberate, simple tradeoff for a small project: no
// "remember me", but also nothing sensitive lingering in the browser
// after the session ends.
let adminToken = null;

export function setAdminToken(token) {
  adminToken = token;
}

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      // Only attach the header when we actually have a token — admin
      // routes check for its PRESENCE and correctness, so sending
      // "null" as a string would just be a wrong password, not "no
      // password", which would be a confusing bug to chase.
      ...(adminToken ? { "x-admin-token": adminToken } : {}),
    },
    ...options,
  });

  if (!res.ok) {
    // Try to read a server-provided error message; fall back to the
    // status text if the body isn't JSON for some reason.
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }

  return res.json();
}

export const api = {
  // Products
  getProducts: () => request("/products"),
  getProduct: (id) => request(`/products/${id}`),
  getCategories: () => request("/products/categories"),

  // Orders
  createOrder: (order) =>
    request("/orders", { method: "POST", body: JSON.stringify(order) }),
  getOrder: (id) => request(`/orders/${id}`),

  // Voice search
  voiceSearch: (transcript) =>
    request("/voice-search", { method: "POST", body: JSON.stringify({ transcript }) }),

  // Payments (simulated gateway — see server/src/routes/payments.js)
  createCheckoutSession: (orderId) =>
    request("/payments/create-checkout-session", {
      method: "POST",
      body: JSON.stringify({ orderId }),
    }),
  mockPay: (sessionId) =>
    request("/payments/mock-pay", { method: "POST", body: JSON.stringify({ session_id: sessionId }) }),
  verifyPayment: (sessionId, orderId) =>
    request(`/payments/verify?session_id=${encodeURIComponent(sessionId)}&orderId=${encodeURIComponent(orderId)}`),

  // Admin (all require setAdminToken() to have been called first —
  // see the "x-admin-token" header logic above)
  adminLogin: (password) =>
    request("/admin/login", { method: "POST", body: JSON.stringify({ password }) }),
  getAllOrders: () => request("/orders"),
  updateOrderStatus: (id, status) =>
    request(`/orders/${id}`, { method: "PATCH", body: JSON.stringify({ status }) }),
};

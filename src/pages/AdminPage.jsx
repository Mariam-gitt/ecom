import { useState, useEffect, useCallback } from "react";
import { Lock, RefreshCw, Package } from "lucide-react";
import { api, setAdminToken } from "../lib/api";

// THE SHAPE OF THIS PAGE: two very different states —
//   1. Not logged in yet -> show a password form
//   2. Logged in -> show the orders table
// This is the same "distinct states get distinct pieces of UI"
// thinking as loading/error/data elsewhere in the app, just applied
// to auth instead of data-fetching.
export default function AdminPage() {
  const [isAuthed, setIsAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [ordersError, setOrdersError] = useState("");

  // useCallback so this function's identity is stable across renders
  // — not strictly required here (nothing memoized depends on it),
  // but it's good habit for any function passed to useEffect or reused
  // in multiple places, same reasoning as handleClear in ShopPage.jsx.
  const loadOrders = useCallback(async () => {
    setLoadingOrders(true);
    setOrdersError("");
    try {
      const data = await api.getAllOrders();
      setOrders(data);
    } catch (err) {
      setOrdersError(err.message);
    } finally {
      setLoadingOrders(false);
    }
  }, []);

  async function handleLogin(e) {
    e.preventDefault();
    setLoginError("");
    setLoggingIn(true);

    try {
      // Ask the backend "is this password correct?" BEFORE storing it
      // as the token used on every future request — see
      // server/src/routes/admin.js for what this checks.
      await api.adminLogin(password);
      setAdminToken(password); // now attached as x-admin-token on every admin request
      setIsAuthed(true);
    } catch (err) {
      setLoginError(err.message || "Login failed.");
    } finally {
      setLoggingIn(false);
    }
  }

  // Once authenticated, load the order list immediately.
  useEffect(() => {
    if (isAuthed) loadOrders();
  }, [isAuthed, loadOrders]);

  async function handleStatusChange(orderId, newStatus) {
    // Optimistic-ish update: we wait for the server to confirm rather
    // than updating local state first, since a rejected admin action
    // (e.g. token expired mid-session) showing a status that didn't
    // actually save would be actively misleading for someone managing
    // real orders.
    try {
      const updated = await api.updateOrderStatus(orderId, newStatus);
      setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
    } catch (err) {
      alert(`Could not update order: ${err.message}`);
    }
  }

  if (!isAuthed) {
    return (
      <main className="max-w-sm mx-auto px-6 py-16">
        <div className="text-center mb-6">
          <Lock size={28} className="mx-auto mb-3 text-neutral-400" />
          <h1 className="text-lg font-medium dark:text-white">Admin login</h1>
        </div>
        <form
          onSubmit={handleLogin}
          className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-6 space-y-3"
        >
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Admin password"
            autoFocus
            className="w-full px-3 py-2 text-sm border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white rounded-lg focus:outline-none focus:border-neutral-400"
          />
          {loginError && <p className="text-xs text-red-500">{loginError}</p>}
          <button
            type="submit"
            disabled={loggingIn}
            className="w-full bg-neutral-900 dark:bg-white dark:text-neutral-900 text-white text-sm py-2 rounded-lg hover:bg-neutral-700 dark:hover:bg-neutral-200 transition-colors disabled:opacity-60"
          >
            {loggingIn ? "Checking..." : "Log in"}
          </button>
        </form>
      </main>
    );
  }

  const totalRevenue = orders
    .filter((o) => o.status === "paid" || o.status === "shipped")
    .reduce((sum, o) => sum + o.total, 0);

  return (
    <main className="max-w-4xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-medium dark:text-white flex items-center gap-2">
          <Package size={20} /> Orders
        </h1>
        <button
          onClick={loadOrders}
          className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-white"
        >
          <RefreshCw size={12} className={loadingOrders ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* A couple of at-a-glance stats — cheap to compute from data
          we already fetched, no separate endpoint needed. */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-4">
          <p className="text-xs text-neutral-400 mb-1">Total orders</p>
          <p className="text-xl font-semibold dark:text-white">{orders.length}</p>
        </div>
        <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-4">
          <p className="text-xs text-neutral-400 mb-1">Revenue (paid + shipped)</p>
          <p className="text-xl font-semibold dark:text-white">${totalRevenue.toFixed(2)}</p>
        </div>
      </div>

      {ordersError && <p className="text-sm text-red-500 mb-4">{ordersError}</p>}

      {orders.length === 0 && !loadingOrders ? (
        <p className="text-sm text-neutral-400 text-center py-8">No orders yet.</p>
      ) : (
        <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-100 dark:border-neutral-700 text-left text-neutral-400 text-xs">
                <th className="p-3 font-medium">Customer</th>
                <th className="p-3 font-medium">Items</th>
                <th className="p-3 font-medium">Total</th>
                <th className="p-3 font-medium">Date</th>
                <th className="p-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-neutral-50 dark:border-neutral-700/50 last:border-0">
                  <td className="p-3">
                    <p className="dark:text-white">{order.name}</p>
                    <p className="text-xs text-neutral-400">{order.email}</p>
                  </td>
                  <td className="p-3 text-neutral-500 dark:text-neutral-400">
                    {order.items.reduce((sum, i) => sum + i.qty, 0)} item(s)
                  </td>
                  <td className="p-3 dark:text-white">${order.total.toFixed(2)}</td>
                  <td className="p-3 text-neutral-500 dark:text-neutral-400 text-xs">
                    {new Date(order.createdAt).toLocaleString()}
                  </td>
                  <td className="p-3">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className="text-xs border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white rounded-lg px-2 py-1 capitalize"
                    >
                      {["pending", "paid", "shipped", "cancelled"].map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}

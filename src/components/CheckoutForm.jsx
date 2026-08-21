import { useState } from "react";

// CheckoutForm is deliberately standalone — no props, no context. Good
// contrast to every other component in this app: not everything needs
// to talk to a parent or share state.
export default function CheckoutForm() {
  // One object holding both fields — common once a form has 2+ fields.
  const [formData, setFormData] = useState({ name: "", email: "" });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  // One handler reused by both inputs. e.target.name matches each
  // input's "name" attribute below, so this single function updates the
  // correct field depending on which input fired the event.
  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e) {
    // Forms reload the page by default on submit — this stops that so
    // React can handle it instead.
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim()) {
      setError("Both fields are required.");
      return;
    }
    setError("");
    setSubmitted(true);
    // No backend call yet — just simulating success locally.
  }

  function handleNewOrder() {
    setFormData({ name: "", email: "" });
    setSubmitted(false);
  }

  if (submitted) {
    // Conditional rendering: swap the form for a confirmation message.
    return (
      <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-6 text-center">
        <p className="text-sm font-medium mb-1 dark:text-white">Thanks, {formData.name}!</p>
        <p className="text-xs text-neutral-400 mb-4">
          A confirmation would go to {formData.email}.
        </p>
        <button onClick={handleNewOrder} className="text-xs text-neutral-500 underline">
          Start a new order
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-6 space-y-3"
    >
      <p className="text-sm font-medium dark:text-white">Checkout details</p>
      <div>
        <input
          name="name"
          // value always comes FROM state — that's what "controlled"
          // means: React is the source of truth for what's typed.
          value={formData.name}
          onChange={handleChange}
          placeholder="Full name"
          className="w-full px-3 py-2 text-sm border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white rounded-lg focus:outline-none focus:border-neutral-400"
        />
      </div>
      <div>
        <input
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email address"
          className="w-full px-3 py-2 text-sm border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white rounded-lg focus:outline-none focus:border-neutral-400"
        />
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
      <button
        type="submit"
        className="w-full bg-neutral-900 dark:bg-white dark:text-neutral-900 text-white text-sm py-2 rounded-lg hover:bg-neutral-700 dark:hover:bg-neutral-200 transition-colors"
      >
        Place order
      </button>
    </form>
  );
}

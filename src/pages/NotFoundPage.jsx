import { Link } from "react-router-dom";

// Nothing fancy — just a component like any other page, rendered when
// no other Route's path matches the current URL (see the "*" path in
// App.jsx, which is what actually triggers this).
export default function NotFoundPage() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-20 text-center">
      <p className="text-4xl font-semibold mb-2 dark:text-white">404</p>
      <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6">
        This page doesn't exist.
      </p>
      <Link to="/" className="text-sm underline dark:text-white">
        Back to shop
      </Link>
    </main>
  );
}

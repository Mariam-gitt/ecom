/** @type {import('tailwindcss').Config} */
export default {
  // "class" strategy: dark mode only activates when a "dark" class is
  // present on an ancestor element (we toggle it on the root div in
  // App.jsx) — NOT automatically based on the OS's dark mode setting.
  // This gives us a manual toggle instead of following the system.
  darkMode: "class",
  // Tailwind scans these files for className usage and only generates
  // CSS for classes actually found — keeps the final CSS small.
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: { extend: {} },
  plugins: [],
};

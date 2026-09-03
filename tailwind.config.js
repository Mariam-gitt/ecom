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
  theme: {
    extend: {
      // A single custom red scale ("brand") so every accent color in
      // the app — buttons, prices, badges, focus rings — comes from
      // one deliberate palette instead of Tailwind's generic red-500.
      // Numbers work like Tailwind's built-in scales: lower = lighter
      // (used for soft tints/backgrounds), higher = darker (used for
      // hover/pressed states). Use these as e.g. "bg-brand-600".
      colors: {
        brand: {
          50: "#FDEEED", // faint red tint — hover backgrounds, subtle highlights
          100: "#F8D5D2", // light tint — soft badges, disabled-ish states
          400: "#D6453C", // mid red — dark-mode text accents (price, links)
          500: "#C2352C", // slightly deeper — rarely used directly
          600: "#B3241C", // PRIMARY brand red — buttons, active states, price
          700: "#8A1B15", // hover/pressed shade for primary buttons
          800: "#6B1510", // deepest — reserved for high-contrast text on light bg
        },
      },
    },
  },
  plugins: [],
};

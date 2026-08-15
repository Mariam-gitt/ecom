// This file's only job is to hold data — separated so it could later be
// swapped for a real fetch() call without touching any component code.

export const PRODUCTS = [
  // Each object = one product. "id" is the unique key used everywhere
  // else (cart matching, React list keys).
  { id: 1, name: "Wireless Headphones", price: 59.99, emoji: "🎧" },
  { id: 2, name: "Mechanical Keyboard", price: 89.99, emoji: "⌨️" },
  { id: 3, name: "Desk Lamp", price: 24.99, emoji: "💡" },
  { id: 4, name: "Coffee Mug", price: 12.5, emoji: "☕" },
  { id: 5, name: "Notebook", price: 6.99, emoji: "📓" },
  { id: 6, name: "Backpack", price: 45.0, emoji: "🎒" },
];

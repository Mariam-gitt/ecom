import { createContext, useContext, useState } from "react";

// Same three-step pattern as CartContext: create the box, a Provider
// component to fill it, and a hook to read from it.
const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  // isDark is the ONLY piece of state this context manages. Simpler
  // than the cart, so a plain useState is enough here — no need for
  // useReducer when there's just one boolean with one way to change it.
  const [isDark, setIsDark] = useState(false);

  function toggleTheme() {
    setIsDark((prev) => !prev);
  }

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used inside <ThemeProvider>");
  return context;
}

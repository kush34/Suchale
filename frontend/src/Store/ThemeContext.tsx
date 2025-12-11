import { createContext, useEffect, useState } from "react";

type ThemeContextType = {
  theme: "light" | "dark";
  toggleTheme: () => void;
  changeTheme: () => void;
};

export const ThemeContext = createContext<ThemeContextType | null>(null);

export const ThemeContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);

    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };
  const changeTheme = () => {
    if (!document.startViewTransition) {
      toggleTheme()
      return;
    }
    document.startViewTransition(() => {
      toggleTheme();
    })
  }
  useEffect(() => {
    const savedTheme = (localStorage.getItem("theme") as "light" | "dark") || "light";
    setTheme(savedTheme);

    document.documentElement.classList.toggle("dark", savedTheme === "dark");
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme,changeTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContextProvider;

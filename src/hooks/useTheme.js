import { useEffect } from "react";
import useLocalStorage from "use-local-storage";
import { THEME_KEY } from "@/constants";

export default function useTheme() {
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const [theme, setTheme] = useLocalStorage(
    THEME_KEY,
    prefersDark ? "dark" : "light"
  );

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme(theme === "light" ? "dark" : "light");

  return { theme, toggleTheme };
}

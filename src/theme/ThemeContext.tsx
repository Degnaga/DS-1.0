"use client";

import React, {
  createContext,
  useMemo,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { ThemeProvider, CssBaseline } from "@mui/material";

import { darkTheme, lightTheme } from "./theme";

type ThemeMode = "light" | "dark";

interface ThemeContextProps {
  toggleTheme: () => void;
  mode: ThemeMode;
}

export const ThemeContext = createContext<ThemeContextProps>({
  toggleTheme: () => {},
  mode: "light",
});

interface ThemeProviderProps {
  children: ReactNode;
}

const ThemeContextProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>("light");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme === "dark") {
      setMode("dark");
    }
    setIsMounted(true);
  }, []);

  const toggleTheme = () => {
    setMode((prev) => {
      const newMode = prev === "light" ? "dark" : "light";
      localStorage.setItem("theme", newMode);
      return newMode;
    });
  };

  const theme = useMemo(
    () => (mode === "dark" ? darkTheme : lightTheme),
    [mode]
  );

  if (!isMounted) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ toggleTheme, mode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};

export default ThemeContextProvider;

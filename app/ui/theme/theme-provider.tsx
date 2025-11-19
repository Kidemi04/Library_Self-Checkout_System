'use client';

import React from 'react';

export type ThemeMode = 'light' | 'dark';

type ThemeContextValue = {
  theme: ThemeMode;
  setTheme: (mode: ThemeMode) => void;
  toggleTheme: () => void;
};

const STORAGE_KEY = 'dashboard-theme';
const COOKIE_KEY = 'dashboard-theme';
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

const ThemeContext = React.createContext<ThemeContextValue | undefined>(undefined);

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme: ThemeMode;
};

const writeDomTheme = (mode: ThemeMode) => {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.dataset.theme = mode;
  root.classList.toggle('dark', mode === 'dark');
  root.classList.toggle('light', mode === 'light');
};

export function ThemeProvider({ children, defaultTheme }: ThemeProviderProps) {
  const [theme, setTheme] = React.useState<ThemeMode>(defaultTheme);
  const [isReady, setIsReady] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const resolved: ThemeMode = stored === 'light' || stored === 'dark' ? stored : defaultTheme;
    setTheme(resolved);
    writeDomTheme(resolved);
    setIsReady(true);
  }, [defaultTheme]);

  React.useEffect(() => {
    if (!isReady || typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEY, theme);
    document.cookie = `${COOKIE_KEY}=${theme}; path=/; max-age=${ONE_YEAR_SECONDS}; SameSite=Lax`;
    writeDomTheme(theme);
  }, [theme, isReady]);

  const handleSetTheme = React.useCallback((mode: ThemeMode) => {
    setTheme(mode);
  }, []);

  const toggleTheme = React.useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const value = React.useMemo(
    () => ({
      theme,
      setTheme: handleSetTheme,
      toggleTheme,
    }),
    [theme, handleSetTheme, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => {
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

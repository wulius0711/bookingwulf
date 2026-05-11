'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

type Mode = 'light' | 'dark';

interface ThemeContextValue {
  mode: Mode;
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  mode: 'light',
  toggleMode: () => {},
});

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}

function applyMode(mode: Mode) {
  const isDark = mode === 'dark';
  // Brief transition class so color changes animate smoothly
  document.documentElement.classList.add('theme-transitioning');
  // Apply both class (existing system) and attribute (new token system)
  document.documentElement.classList.toggle('dark', isDark);
  document.documentElement.setAttribute('data-theme', mode);
  localStorage.setItem('admin-dark', isDark ? 'true' : 'false');
  // Remove transition class after animation completes
  setTimeout(() => {
    document.documentElement.classList.remove('theme-transitioning');
  }, 220);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<Mode>(() => {
    if (typeof window === 'undefined') return 'light';
    const saved = localStorage.getItem('admin-dark');
    if (saved !== null) return saved === 'true' ? 'dark' : 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', mode);
  }, []);

  function toggleMode() {
    const next: Mode = mode === 'dark' ? 'light' : 'dark';
    setMode(next);
    applyMode(next);
  }

  return (
    <ThemeContext.Provider value={{ mode, toggleMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

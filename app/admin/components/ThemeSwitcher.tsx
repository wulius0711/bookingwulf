'use client';

import { useState } from 'react';
import ThemeToggle from './ThemeToggle';
import { useTheme } from './ThemeProvider';

const THEMES = [
  { key: 'indigo',  label: 'Indigo',   color: '#4f46e5', darkColor: '#818cf8' },
  { key: 'classic', label: 'Classic',  color: '#111827', darkColor: '#e2e8f0' },
  { key: 'orange',  label: 'Orange',   color: '#EA5605', darkColor: '#EA5605' },
] as const;

type ThemeKey = typeof THEMES[number]['key'];

function applyTheme(key: ThemeKey) {
  document.documentElement.classList.remove('theme-classic', 'theme-orange');
  if (key !== 'indigo') document.documentElement.classList.add(`theme-${key}`);
  localStorage.setItem('admin-theme', key);
}

export default function ThemeSwitcher() {
  const [theme, setTheme] = useState<ThemeKey>(() => {
    const saved = localStorage.getItem('admin-theme') as ThemeKey | null;
    return saved && THEMES.some(t => t.key === saved) ? saved : 'indigo';
  });
  const { mode } = useTheme();
  const isDark = mode === 'dark';

  function handleTheme(key: ThemeKey) {
    setTheme(key);
    applyTheme(key);
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ fontSize: 12, color: 'var(--text-subtle)', fontWeight: 500 }}>Design</span>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        {THEMES.map((t) => {
          const swatchColor = isDark ? t.darkColor : t.color;
          return (
            <button
              key={t.key}
              onClick={() => handleTheme(t.key)}
              title={t.label}
              style={{
                width: 16,
                height: 16,
                borderRadius: 4,
                background: swatchColor,
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                outline: theme === t.key ? `2px solid ${swatchColor}` : 'none',
                outlineOffset: 2,
                boxShadow: theme === t.key ? '0 0 0 1px var(--surface) inset' : 'none',
                transition: 'outline 0.15s ease',
              }}
            />
          );
        })}
        <ThemeToggle />
      </div>
    </div>
  );
}

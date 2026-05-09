'use client';

import { useEffect, useState } from 'react';
import ThemeToggle from './ThemeToggle';

const THEMES = [
  { key: 'indigo',  label: 'Indigo',   color: '#4f46e5' },
  { key: 'classic', label: 'Classic',  color: '#111827' },
  { key: 'orange',  label: 'Orange',   color: '#EA5605' },
] as const;

type ThemeKey = typeof THEMES[number]['key'];

function applyTheme(key: ThemeKey) {
  document.documentElement.classList.remove('theme-classic', 'theme-orange');
  if (key !== 'indigo') document.documentElement.classList.add(`theme-${key}`);
  localStorage.setItem('admin-theme', key);
}

function applyDark(dark: boolean) {
  document.documentElement.classList.toggle('dark', dark);
  localStorage.setItem('admin-dark', dark ? 'true' : 'false');
}

export default function ThemeSwitcher() {
  const [theme, setTheme] = useState<ThemeKey>('indigo');
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('admin-theme') as ThemeKey | null;
    if (savedTheme && THEMES.some(t => t.key === savedTheme)) setTheme(savedTheme);
    const savedDark = localStorage.getItem('admin-dark');
    setDark(savedDark === 'true');
  }, []);

  function handleTheme(key: ThemeKey) {
    setTheme(key);
    applyTheme(key);
  }

  function handleDark() {
    const next = !dark;
    setDark(next);
    applyDark(next);
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ fontSize: 12, color: 'var(--text-subtle)', fontWeight: 500 }}>Design</span>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        {THEMES.map((t) => (
          <button
            key={t.key}
            onClick={() => handleTheme(t.key)}
            title={t.label}
            style={{
              width: 16,
              height: 16,
              borderRadius: 4,
              background: t.color,
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              outline: theme === t.key ? `2px solid ${t.color}` : 'none',
              outlineOffset: 2,
              boxShadow: theme === t.key ? '0 0 0 1px var(--surface) inset' : 'none',
              transition: 'outline 0.15s ease',
            }}
          />
        ))}
        <ThemeToggle />
      </div>
    </div>
  );
}

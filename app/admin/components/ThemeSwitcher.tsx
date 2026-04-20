'use client';

import { useEffect, useState } from 'react';

const THEMES = [
  { key: 'indigo',  label: 'Indigo',   color: '#4f46e5' },
  { key: 'classic', label: 'Classic',  color: '#111827' },
  { key: 'emerald', label: 'Emerald',  color: '#059669' },
] as const;

type ThemeKey = typeof THEMES[number]['key'];

function applyTheme(key: ThemeKey) {
  document.documentElement.classList.remove('theme-classic', 'theme-emerald');
  if (key !== 'indigo') document.documentElement.classList.add(`theme-${key}`);
  localStorage.setItem('admin-theme', key);
}

export default function ThemeSwitcher() {
  const [theme, setTheme] = useState<ThemeKey>('indigo');

  useEffect(() => {
    const saved = localStorage.getItem('admin-theme') as ThemeKey | null;
    if (saved && THEMES.some(t => t.key === saved)) setTheme(saved);
  }, []);

  function handleChange(key: ThemeKey) {
    setTheme(key);
    applyTheme(key);
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ fontSize: 12, color: '#9ca3af', fontWeight: 500 }}>Design</span>
      <div style={{ display: 'flex', gap: 6 }}>
        {THEMES.map((t) => (
          <button
            key={t.key}
            onClick={() => handleChange(t.key)}
            title={t.label}
            style={{
              width: 20,
              height: 20,
              borderRadius: '50%',
              background: t.color,
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              outline: theme === t.key ? `2px solid ${t.color}` : 'none',
              outlineOffset: 2,
              boxShadow: theme === t.key ? '0 0 0 1px #fff inset' : 'none',
              transition: 'outline 0.15s ease',
            }}
          />
        ))}
      </div>
    </div>
  );
}

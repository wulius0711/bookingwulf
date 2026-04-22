'use client';

import { useState, useEffect } from 'react';

function hexToRgb(hex: string): [number, number, number] | null {
  const clean = hex.replace('#', '');
  if (clean.length !== 6) return null;
  return [
    parseInt(clean.slice(0, 2), 16),
    parseInt(clean.slice(2, 4), 16),
    parseInt(clean.slice(4, 6), 16),
  ];
}

function relativeLuminance(r: number, g: number, b: number): number {
  const channel = (c: number) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrastRatio(hex1: string, hex2: string): number | null {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  if (!rgb1 || !rgb2) return null;
  const l1 = relativeLuminance(...rgb1);
  const l2 = relativeLuminance(...rgb2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return Math.round(((lighter + 0.05) / (darker + 0.05)) * 10) / 10;
}

function Badge({ ratio }: { ratio: number | null }) {
  if (ratio === null) return null;
  const aa = ratio >= 4.5;
  const aaa = ratio >= 7;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 6,
      background: aaa ? '#f0fdf4' : aa ? '#fefce8' : '#fef2f2',
      color: aaa ? '#15803d' : aa ? '#92400e' : '#dc2626',
      border: `1px solid ${aaa ? '#bbf7d0' : aa ? '#fde68a' : '#fecaca'}`,
    }}>
      {ratio}:1 {aaa ? '✓ AAA' : aa ? '✓ AA' : '✗ Fail'}
    </span>
  );
}

export default function ContrastChecker({
  defaultAccent,
  defaultBg,
  defaultText,
  defaultButtonColor,
}: {
  defaultAccent: string;
  defaultBg: string;
  defaultText: string;
  defaultButtonColor: string;
}) {
  const [colors, setColors] = useState({
    accentColor: defaultAccent,
    backgroundColor: defaultBg,
    textColor: defaultText,
    buttonColor: defaultButtonColor,
  });

  useEffect(() => {
    const handler = (e: Event) => {
      const { name, value } = (e as CustomEvent).detail;
      if (name in colors) {
        setColors((prev) => ({ ...prev, [name]: value }));
      }
    };
    document.addEventListener('settings-color-changed', handler);
    return () => document.removeEventListener('settings-color-changed', handler);
  }, []);

  const pairs = [
    { label: 'Text auf Hintergrund', a: colors.textColor, b: colors.backgroundColor },
    { label: 'Button-Text auf Accent', a: colors.buttonColor, b: colors.accentColor },
    { label: 'Accent auf Hintergrund', a: colors.accentColor, b: colors.backgroundColor },
  ];

  return (
    <div style={{ marginTop: 16, padding: '12px 14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 10 }}>
        Barrierefreiheit (WCAG Kontrast)
      </div>
      <div style={{ display: 'grid', gap: 8 }}>
        {pairs.map(({ label, a, b }) => {
          const ratio = contrastRatio(a.startsWith('#') ? a : '#111111', b.startsWith('#') ? b : '#ffffff');
          return (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 12, color: '#374151' }}>{label}</span>
              <Badge ratio={ratio} />
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: 8, fontSize: 11, color: '#9ca3af' }}>
        AA = mind. 4.5:1 (Normal), AAA = mind. 7:1 (Optimal)
      </div>
    </div>
  );
}

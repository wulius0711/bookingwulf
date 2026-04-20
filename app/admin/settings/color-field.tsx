'use client';

import { useState, useEffect } from 'react';

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

function parseColor(val: string): { hex: string; alpha: number } {
  if (val?.startsWith('rgba(')) {
    const m = val.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
    if (m) {
      const [r, g, b] = [parseInt(m[1]), parseInt(m[2]), parseInt(m[3])];
      const hex = '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('');
      return { hex, alpha: Math.round(parseFloat(m[4]) * 100) };
    }
  }
  return { hex: val || '#ffffff', alpha: 100 };
}

function toColorValue(hex: string, alpha: number): string {
  if (alpha >= 100) return hex;
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r},${g},${b},${(alpha / 100).toFixed(2)})`;
}

export function ColorField({
  label,
  name,
  defaultValue,
  labelStyle,
  showOpacity = false,
}: {
  label: string;
  name: string;
  defaultValue: string;
  labelStyle: React.CSSProperties;
  showOpacity?: boolean;
}) {
  const parsed = parseColor(defaultValue);
  const [hex, setHex] = useState(parsed.hex);
  const [alpha, setAlpha] = useState(parsed.alpha);

  const combined = toColorValue(hex, alpha);

  useEffect(() => {
    document.dispatchEvent(new CustomEvent('settings-color-changed', { detail: { name, value: combined } }));
  }, [combined, name]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid #f3f4f6' }}>
      <span style={{ ...labelStyle, flex: 1, minWidth: 0, margin: 0 }}>{label}</span>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        {/* Swatch */}
        <label style={{ position: 'relative', display: 'block', width: 36, height: 36, borderRadius: 8, border: '1px solid #d1d5db', background: combined, cursor: 'pointer', flexShrink: 0, overflow: 'hidden' }}>
          <input
            type="color"
            value={hex}
            onChange={(e) => setHex(e.target.value)}
            style={{ position: 'absolute', inset: 0, opacity: 0, width: '100%', height: '100%', cursor: 'pointer', padding: 0, border: 'none' }}
          />
        </label>

        {/* Hex input */}
        <input
          value={hex}
          onChange={(e) => setHex(e.target.value)}
          style={{ width: 88, padding: '7px 10px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13, fontFamily: 'monospace', background: '#fff', color: '#111', outline: 'none' }}
        />

        {/* Opacity slider + value */}
        {showOpacity && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <input
              type="range"
              min={0}
              max={100}
              value={alpha}
              onChange={(e) => setAlpha(Number(e.target.value))}
              style={{ width: 72, accentColor: '#111', cursor: 'pointer' }}
            />
            <span style={{ fontSize: 12, color: '#6b7280', width: 34, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{alpha}%</span>
          </div>
        )}

        {/* Hidden input carries the combined value */}
        <input type="hidden" name={name} value={combined} />
      </div>
    </div>
  );
}

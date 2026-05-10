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

  useEffect(() => {
    function handle(e: Event) {
      const val = (e as CustomEvent).detail?.[name];
      if (val == null) return;
      const p = parseColor(String(val));
      setHex(p.hex);
      setAlpha(p.alpha);
    }
    document.addEventListener('preset-apply', handle);
    return () => document.removeEventListener('preset-apply', handle);
  }, [name]);

  return (
    <div style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
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
            style={{ width: 88, padding: '7px 10px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13, fontFamily: 'monospace', background: 'var(--surface)', color: 'var(--text-primary)', outline: 'none' }}
          />

          <input type="hidden" name={name} value={combined} />
        </div>
      </div>

      {/* Opacity slider below */}
      {showOpacity && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, paddingLeft: 2 }}>
          <span style={{ fontSize: 11, color: '#9ca3af', whiteSpace: 'nowrap' }}>Deckkraft</span>
          <input
            type="range"
            min={0}
            max={100}
            value={alpha}
            onChange={(e) => setAlpha(Number(e.target.value))}
            style={{ flex: 1, cursor: 'pointer', '--progress': `${alpha}%` } as React.CSSProperties}
          />
          <span style={{ fontSize: 12, color: '#6b7280', width: 34, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{alpha}%</span>
        </div>
      )}
    </div>
  );
}

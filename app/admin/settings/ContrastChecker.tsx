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

function hexToHsl(hex: string): [number, number, number] | null {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  const r = rgb[0] / 255, g = rgb[1] / 255, b = rgb[2] / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return [h * 360, s * 100, l * 100];
}

function hslToHex(h: number, s: number, l: number): string {
  const hN = h / 360, sN = s / 100, lN = l / 100;
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  let r, g, b;
  if (sN === 0) {
    r = g = b = lN;
  } else {
    const q = lN < 0.5 ? lN * (1 + sN) : lN + sN - lN * sN;
    const p = 2 * lN - q;
    r = hue2rgb(p, q, hN + 1 / 3);
    g = hue2rgb(p, q, hN);
    b = hue2rgb(p, q, hN - 1 / 3);
  }
  return '#' + [r, g, b].map((x) => Math.round(x * 255).toString(16).padStart(2, '0')).join('');
}

function findAccessibleColor(textHex: string, bgHex: string, minRatio = 4.5): string | null {
  const hsl = hexToHsl(textHex);
  const bgRgb = hexToRgb(bgHex);
  if (!hsl || !bgRgb) return null;
  const [h, s, currentL] = hsl;
  const bgLum = relativeLuminance(...bgRgb);
  const lightenText = bgLum < 0.18;

  if (lightenText) {
    // dark background → lighten text; find lowest L that still passes
    let lo = currentL, hi = 100;
    if ((contrastRatio(hslToHex(h, s, hi), bgHex) ?? 0) < minRatio) return null;
    for (let i = 0; i < 20; i++) {
      const mid = (lo + hi) / 2;
      if ((contrastRatio(hslToHex(h, s, mid), bgHex) ?? 0) >= minRatio) hi = mid;
      else lo = mid;
    }
    return hslToHex(h, s, hi);
  } else {
    // light background → darken text; find highest L that still passes
    let lo = 0, hi = currentL;
    if ((contrastRatio(hslToHex(h, s, lo), bgHex) ?? 0) < minRatio) return null;
    for (let i = 0; i < 20; i++) {
      const mid = (lo + hi) / 2;
      if ((contrastRatio(hslToHex(h, s, mid), bgHex) ?? 0) >= minRatio) lo = mid;
      else hi = mid;
    }
    return hslToHex(h, s, lo);
  }
}

function applyColor(fieldName: string, value: string) {
  const input = document.querySelector(`input[name="${fieldName}"]`) as HTMLInputElement | null;
  if (input) {
    input.value = value;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }
  document.dispatchEvent(new CustomEvent('settings-color-changed', { detail: { name: fieldName, value } }));
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

function Suggestion({ suggested, fieldName, onApply }: { suggested: string; fieldName: string; onApply: (color: string) => void }) {
  const [copied, setCopied] = useState(false);

  function apply() {
    applyColor(fieldName, suggested);
    onApply(suggested);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <button
      type="button"
      onClick={apply}
      title={`${suggested} übernehmen`}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        fontSize: 11, fontWeight: 600, padding: '2px 7px', borderRadius: 6,
        background: '#fff', border: '1px solid #d1d5db', cursor: 'pointer',
        color: '#374151',
      }}
    >
      <span style={{ width: 12, height: 12, borderRadius: 3, background: suggested, border: '1px solid rgba(0,0,0,0.1)', flexShrink: 0 }} />
      {copied ? '✓ Übernommen' : suggested}
    </button>
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

  const pairs: { label: string; a: string; aField: string; b: string }[] = [
    { label: 'Text auf Hintergrund',    a: colors.textColor,   aField: 'textColor',   b: colors.backgroundColor },
    { label: 'Button-Text auf Accent',  a: colors.buttonColor, aField: 'buttonColor', b: colors.accentColor },
    { label: 'Accent auf Hintergrund',  a: colors.accentColor, aField: 'accentColor', b: colors.backgroundColor },
  ];

  return (
    <div style={{ marginTop: 16, padding: '12px 14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 10 }}>
        Barrierefreiheit (WCAG Kontrast)
      </div>
      <div style={{ display: 'grid', gap: 10 }}>
        {pairs.map(({ label, a, aField, b }) => {
          const aHex = a.startsWith('#') ? a : '#111111';
          const bHex = b.startsWith('#') ? b : '#ffffff';
          const ratio = contrastRatio(aHex, bHex);
          const fails = ratio !== null && ratio < 4.5;
          const suggested = fails ? findAccessibleColor(aHex, bHex) : null;
          return (
            <div key={label} style={{ display: 'grid', gap: 4 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 12, color: '#374151' }}>{label}</span>
                <Badge ratio={ratio} />
              </div>
              {suggested && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, paddingLeft: 2 }}>
                  <span style={{ fontSize: 11, color: '#6b7280' }}>Vorschlag:</span>
                  <Suggestion
                    suggested={suggested}
                    fieldName={aField}
                    onApply={(color) => setColors((prev) => ({ ...prev, [aField]: color }))}
                  />
                </div>
              )}
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

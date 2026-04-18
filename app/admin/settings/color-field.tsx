'use client';

import { useState, useEffect } from 'react';

export function ColorField({
  label,
  name,
  defaultValue,
  labelStyle,
}: {
  label: string;
  name: string;
  defaultValue: string;
  labelStyle: React.CSSProperties;
}) {
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    document.dispatchEvent(new CustomEvent('settings-color-changed', { detail: { name, value } }));
  }, [value, name]);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '10px 0',
      borderBottom: '1px solid #f3f4f6',
    }}>
      <span style={{ ...labelStyle, flex: 1, minWidth: 0, margin: 0 }}>{label}</span>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        {/* Color picker styled as a square swatch */}
        <label style={{ position: 'relative', display: 'block', width: 36, height: 36, borderRadius: 8, border: '1px solid #d1d5db', background: value, cursor: 'pointer', flexShrink: 0, overflow: 'hidden' }}>
          <input
            type="color"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            style={{ position: 'absolute', inset: 0, opacity: 0, width: '100%', height: '100%', cursor: 'pointer', padding: 0, border: 'none' }}
          />
        </label>

        {/* Hex input */}
        <input
          name={name}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          style={{
            width: 100,
            padding: '7px 10px',
            border: '1px solid #d1d5db',
            borderRadius: 8,
            fontSize: 13,
            fontFamily: 'monospace',
            background: '#fff',
            color: '#111',
            outline: 'none',
          }}
        />
      </div>
    </div>
  );
}

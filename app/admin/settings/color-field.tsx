'use client';

import { useState, useEffect } from 'react';

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '11px 12px',
  border: '1px solid #d1d5db',
  borderRadius: 10,
  fontSize: 14,
  background: '#ffffff',
  color: '#111111',
  outline: 'none',
};

const swatchStyle = (color: string): React.CSSProperties => ({
  width: 30,
  height: 30,
  borderRadius: 8,
  border: '1px solid #d1d5db',
  background: color || '#ffffff',
  flexShrink: 0,
});

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

  const rowStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '180px minmax(0, 1fr)',
    gap: 18,
    alignItems: 'center',
  };

  return (
    <div style={rowStyle}>
      <label style={labelStyle}>{label}</label>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          type="color"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          style={{ cursor: 'pointer' }}
        />
        <input
          name={name}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          style={{ ...inputStyle, maxWidth: 140 }}
        />
        <div style={swatchStyle(value)} />
      </div>
    </div>
  );
}

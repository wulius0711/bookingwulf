'use client';

import { useState } from 'react';

function parseRadius(val: string | number | null | undefined): number {
  if (val == null) return 4;
  const n = parseInt(String(val));
  return isNaN(n) ? 4 : Math.min(32, Math.max(0, n));
}

export function RadiusField({
  label,
  name,
  defaultValue,
  labelStyle,
}: {
  label: string;
  name: string;
  defaultValue: string | number | null | undefined;
  labelStyle: React.CSSProperties;
}) {
  const [value, setValue] = useState(parseRadius(defaultValue));

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid #f3f4f6' }}>
      <span style={{ ...labelStyle, flex: 1, minWidth: 0, margin: 0 }}>{label}</span>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        <input
          type="range"
          min={0}
          max={32}
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
          style={{ width: 100, accentColor: '#111' }}
        />
        <input
          name={name}
          value={`${value}px`}
          readOnly
          style={{
            width: 64,
            padding: '7px 10px',
            border: '1px solid #d1d5db',
            borderRadius: 8,
            fontSize: 13,
            fontFamily: 'monospace',
            background: '#f9fafb',
            color: '#111',
            outline: 'none',
            textAlign: 'center',
          }}
        />
      </div>
    </div>
  );
}

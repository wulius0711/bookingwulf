'use client';

import { useState, useRef, useEffect } from 'react';

function parseRadius(val: string | number | null | undefined): number {
  if (val == null) return 4;
  const n = parseInt(String(val));
  return isNaN(n) ? 4 : Math.max(0, n);
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
  const inputRef = useRef<HTMLInputElement>(null);

  // Dispatch native input event so SettingsLivePreview picks up the change
  useEffect(() => {
    if (!inputRef.current) return;
    const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
    nativeSetter?.call(inputRef.current, `${value}px`);
    inputRef.current.dispatchEvent(new Event('input', { bubbles: true }));
  }, [value]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
      <span style={{ ...labelStyle, flex: 1, minWidth: 0, margin: 0 }}>{label}</span>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        <input
          type="range"
          min={0}
          max={100}
          value={Math.min(value, 100)}
          onChange={(e) => setValue(Number(e.target.value))}
          style={{ width: 90, accentColor: '#111' }}
        />
        <input
          ref={inputRef}
          name={name}
          defaultValue={`${value}px`}
          onBlur={(e) => {
            const n = parseInt(e.target.value);
            setValue(isNaN(n) ? 0 : Math.min(999, Math.max(0, n)));
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
          }}
          style={{
            width: 68,
            padding: '7px 10px',
            border: '1px solid var(--border)',
            borderRadius: 8,
            fontSize: 13,
            fontFamily: 'monospace',
            background: 'var(--surface)',
            color: 'var(--text-primary)',
            outline: 'none',
            textAlign: 'center',
          }}
        />
      </div>
    </div>
  );
}

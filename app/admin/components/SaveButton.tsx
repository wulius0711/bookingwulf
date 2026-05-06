'use client';

import { useFormStatus } from 'react-dom';
import { useEffect, useRef, useState } from 'react';

export default function SaveButton({
  label = 'Speichern',
  style,
}: {
  label?: string;
  style?: React.CSSProperties;
}) {
  const { pending } = useFormStatus();
  const [saved, setSaved] = useState(false);
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !pending) {
      setSaved(true);
      const t = setTimeout(() => setSaved(false), 2500);
      return () => clearTimeout(t);
    }
    wasPending.current = pending;
  }, [pending]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <button
        type="submit"
        disabled={pending}
        className="btn-shine"
        style={{
          padding: '10px 20px',
          background: 'var(--accent)',
          color: '#fff',
          border: 'none',
          borderRadius: 8,
          fontSize: 14,
          fontWeight: 600,
          cursor: pending ? 'default' : 'pointer',
          opacity: pending ? 0.7 : 1,
          ...style,
        }}
      >
        {pending ? `${label}…` : label}
      </button>
      {saved && (
        <span style={{ fontSize: 13, color: '#16a34a', fontWeight: 500 }}>
          ✓ Gespeichert
        </span>
      )}
    </div>
  );
}

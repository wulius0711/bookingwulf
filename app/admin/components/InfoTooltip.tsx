'use client';

import { useState } from 'react';

export default function InfoTooltip({ text }: { text: string }) {
  const [visible, setVisible] = useState(false);

  return (
    <span style={{ position: 'relative', display: 'inline-flex', flexShrink: 0 }}>
      <span
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 16, height: 16, borderRadius: '50%', background: '#e5e7eb', color: '#6b7280', fontSize: 10, fontWeight: 700, cursor: 'help' }}
      >
        i
      </span>
      {visible && (
        <span style={{
          position: 'absolute',
          bottom: 'calc(100% + 8px)',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#111',
          color: '#fff',
          fontSize: 12,
          lineHeight: 1.5,
          padding: '8px 12px',
          borderRadius: 8,
          whiteSpace: 'normal',
          width: 220,
          zIndex: 50,
          pointerEvents: 'none',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        }}>
          {text}
        </span>
      )}
    </span>
  );
}

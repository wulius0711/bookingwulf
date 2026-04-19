'use client';

import { useState } from 'react';

export default function InfoTooltip({ text }: { text: string }) {
  const [visible, setVisible] = useState(false);

  return (
    <span style={{ position: 'relative', display: 'inline-flex', flexShrink: 0, overflow: 'visible' }}>
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
          bottom: 'calc(100% + 10px)',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#1e293b',
          color: '#fff',
          fontSize: 12,
          lineHeight: 1.5,
          padding: '8px 12px',
          borderRadius: 0,
          whiteSpace: 'normal',
          width: 220,
          zIndex: 9999,
          pointerEvents: 'none',
          boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
          overflow: 'visible',
        }}>
          {text}
          <span style={{
            position: 'absolute',
            top: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 0,
            height: 0,
            borderLeft: '7px solid transparent',
            borderRight: '7px solid transparent',
            borderTop: '7px solid #1e293b',
            display: 'block',
          }} />
        </span>
      )}
    </span>
  );
}

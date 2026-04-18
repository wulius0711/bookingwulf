'use client';

import { useState } from 'react';

export default function ProLockOverlay({ align = 'right' }: { align?: 'right' | 'center' }) {
  const [hover, setHover] = useState(false);

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: 'absolute',
        inset: 0,
        cursor: 'not-allowed',
        display: 'flex',
        alignItems: align === 'center' ? 'center' : 'flex-start',
        justifyContent: 'flex-end',
        padding: align === 'center' ? '0 12px 0 0' : '4px 0',
      }}
    >
      <span style={{ fontSize: 12, color: '#9ca3af', position: 'relative' }}>
        🔒 Pro
        {hover && (
          <span style={{
            position: 'absolute',
            right: 0,
            top: '100%',
            marginTop: 8,
            padding: '7px 14px',
            background: '#1e293b',
            color: '#fff',
            fontSize: 12,
            fontWeight: 500,
            borderRadius: 8,
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 50,
          }}>
            Ab Pro Plan verfügbar
            <span style={{
              position: 'absolute',
              bottom: '100%',
              right: 16,
              borderWidth: 5,
              borderStyle: 'solid',
              borderColor: 'transparent transparent #1e293b transparent',
            }} />
          </span>
        )}
      </span>
    </div>
  );
}

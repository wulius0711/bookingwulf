'use client';

import { useState } from 'react';

export default function ProLockOverlay() {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);

  return (
    <div
      onMouseMove={(e) => setPos({ x: e.clientX, y: e.clientY })}
      onMouseLeave={() => setPos(null)}
      style={{
        position: 'absolute',
        inset: 0,
        cursor: 'not-allowed',
        zIndex: 10,
      }}
    >
      {pos && (
        <span
          style={{
            position: 'fixed',
            left: pos.x + 14,
            top: pos.y + 14,
            padding: '7px 14px',
            background: '#1e293b',
            color: '#fff',
            fontSize: 12,
            fontWeight: 500,
            borderRadius: 8,
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 9999,
            opacity: 1,
          }}
        >
          Ab Pro Plan verfügbar
        </span>
      )}
    </div>
  );
}

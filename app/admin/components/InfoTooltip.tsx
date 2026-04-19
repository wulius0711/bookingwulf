'use client';

import { useRef, useState } from 'react';

export default function InfoTooltip({ text }: { text: string }) {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const ref = useRef<HTMLSpanElement>(null);

  function show() {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    setPos({ x: r.left + r.width / 2, y: r.top });
  }

  return (
    <span ref={ref} style={{ position: 'relative', display: 'inline-flex', flexShrink: 0 }}>
      <span
        onMouseEnter={show}
        onMouseLeave={() => setPos(null)}
        style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 16, height: 16, borderRadius: '50%', background: '#e5e7eb', color: '#6b7280', fontSize: 10, fontWeight: 700, cursor: 'help' }}
      >
        i
      </span>
      {pos && (
        <>
          <span style={{
            position: 'fixed',
            left: pos.x,
            top: pos.y - 10,
            transform: 'translate(-50%, -100%)',
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
          }}>
            {text}
          </span>
          <span style={{
            position: 'fixed',
            left: pos.x,
            top: pos.y - 10,
            transform: 'translateX(-50%)',
            width: 0,
            height: 0,
            borderLeft: '7px solid transparent',
            borderRight: '7px solid transparent',
            borderTop: '7px solid #1e293b',
            zIndex: 9999,
            pointerEvents: 'none',
          }} />
        </>
      )}
    </span>
  );
}

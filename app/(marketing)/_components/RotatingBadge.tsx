'use client';

import { useEffect, useState } from 'react';

const ITEMS = [
  '✓ Setup in 5 Min',
  '✓ Kein Entwickler',
  '✓ DSGVO-konform',
  '🇦🇹 Österreichisch & unabhängig',
];

export default function RotatingBadge() {
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<'in' | 'out'>('in');

  useEffect(() => {
    const interval = setInterval(() => {
      setPhase('out');
      setTimeout(() => {
        setIndex(i => (i + 1) % ITEMS.length);
        setPhase('in');
      }, 220);
    }, 2600);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '6px 14px',
          borderRadius: 9999,
          fontSize: 13,
          fontWeight: 500,
          background: 'rgba(255,255,255,0.10)',
          color: 'rgba(255,255,255,0.88)',
          border: '1px solid rgba(255,255,255,0.18)',
          transition: 'opacity 0.18s ease, transform 0.18s ease',
          opacity: phase === 'out' ? 0 : 1,
          transform: phase === 'out' ? 'translateY(-6px) scaleY(0.85)' : 'translateY(0) scaleY(1)',
          transformOrigin: 'top center',
          whiteSpace: 'nowrap',
        }}
      >
        {ITEMS[index]}
      </span>
    </div>
  );
}

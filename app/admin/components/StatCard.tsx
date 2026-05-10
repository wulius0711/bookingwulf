'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

function CountUp({ target }: { target: number }) {
  const [val, setVal] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const duration = 700;
    const start = performance.now();
    function tick(now: number) {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setVal(Math.round(target * eased));
      if (t < 1) { rafRef.current = requestAnimationFrame(tick); }
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [target]);

  return <>{val}</>;
}

interface StatCardProps {
  label: string;
  value: number;
  href: string;
  highlight?: boolean;
}

const cardStyle: React.CSSProperties = {
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 14,
  padding: '20px 22px',
  cursor: 'pointer',
  transition: 'box-shadow 0.15s',
};

export default function StatCard({ label, value, href, highlight }: StatCardProps) {
  return (
    <Link href={href} style={{ textDecoration: 'none' }}>
      <div style={{ ...cardStyle, ...(highlight ? { borderColor: 'var(--primitive-red-300)', background: 'var(--danger-subtle)' } : {}) }}>
        <div style={{ fontSize: 32, fontWeight: 700, color: highlight ? 'var(--danger)' : 'var(--text-primary)' }}>
          <CountUp target={value} />
        </div>
        <div style={{ fontSize: 13, color: highlight ? 'var(--danger)' : 'var(--text-muted)', marginTop: 4 }}>
          {label}
        </div>
      </div>
    </Link>
  );
}

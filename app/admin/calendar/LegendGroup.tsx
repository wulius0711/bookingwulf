'use client';

import { useState, useRef, useEffect } from 'react';

export default function LegendGroup({ label, items }: { label: string; items: { color: string; label: string }[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onOutside(e: MouseEvent | TouchEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onOutside);
    document.addEventListener('touchstart', onOutside);
    return () => {
      document.removeEventListener('mousedown', onOutside);
      document.removeEventListener('touchstart', onOutside);
    };
  }, [open]);

  return (
    <div ref={ref} className="legend-group" style={{ position: 'relative', display: 'inline-flex' }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{ fontSize: 12, color: '#6b7280', borderBottom: '1px dotted #9ca3af', cursor: 'pointer', background: 'none', border: 'none', borderBottomStyle: 'dotted', padding: 0, font: 'inherit' }}
      >
        {label}
      </button>
      <div className="legend-tooltip" style={{ display: open ? 'block' : undefined }}>
        <div style={{ display: 'grid', gap: 5 }}>
          {items.map((it) => (
            <div key={it.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: it.color, flexShrink: 0 }} />
              {it.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';

export default function WidgetStandalone() {
  const [total, setTotal] = useState(0);

  return (
    <div
      style={{
        background: '#ffffff',
        padding: 20,
        fontFamily: 'Inter, sans-serif',
      }}
    >
      <h2>Booking Widget</h2>

      <p>Hier läuft dein komplettes System.</p>

      <button
        onClick={() => setTotal(total + 100)}
        style={{
          padding: '12px 20px',
          background: '#DC143C',
          color: '#fff',
          border: 'none',
          borderRadius: 8,
          cursor: 'pointer',
        }}
      >
        Add €100
      </button>

      <h3>Gesamt: € {total}</h3>
    </div>
  );
}

'use client';

import { useState } from 'react';

export default function IsTestToggle({ hotelId, isTest }: { hotelId: number; isTest: boolean }) {
  const [active, setActive] = useState(isTest);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function toggle() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/hotel-test-flag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hotelId, isTest: !active }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? 'Fehler');
      } else {
        setActive(!active);
      }
    } catch {
      setError('Netzwerkfehler');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <button
        onClick={toggle}
        disabled={loading}
        style={{
          padding: '10px 18px',
          borderRadius: 8,
          border: '1px solid #d1d5db',
          background: active ? '#dc2626' : '#16a34a',
          color: '#fff',
          fontSize: 14,
          fontWeight: 600,
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.6 : 1,
        }}
      >
        {loading ? '…' : active ? 'Deaktivieren' : 'Aktivieren'}
      </button>
      {active && (
        <span style={{ fontSize: 13, color: '#16a34a', fontWeight: 500 }}>✓ Beta-Tester aktiv</span>
      )}
      {error && <span style={{ fontSize: 13, color: '#dc2626' }}>{error}</span>}
    </div>
  );
}

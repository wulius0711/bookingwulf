'use client';

import { useState } from 'react';

type Props = {
  hotelId: number;
  currentPlan: string;
  plans: { key: string; name: string }[];
};

export default function PlanSelector({ hotelId, currentPlan, plans }: Props) {
  const [selected, setSelected] = useState(currentPlan);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    if (selected === currentPlan) return;
    setLoading(true);
    const res = await fetch('/api/admin/set-hotel-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hotelId, plan: selected }),
    });
    setLoading(false);
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      window.location.reload();
    }
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <select
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
        style={{ padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14, background: '#f9fafb', color: '#111' }}
      >
        {plans.map((p) => (
          <option key={p.key} value={p.key}>{p.name}</option>
        ))}
      </select>
      <button
        onClick={handleSave}
        disabled={loading || selected === currentPlan}
        className="btn-primary"
        style={{ opacity: loading || selected === currentPlan ? 0.5 : 1, cursor: selected === currentPlan ? 'default' : 'pointer' }}
      >
        {loading ? 'Speichern…' : 'Setzen'}
      </button>
      {saved && <span style={{ fontSize: 13, color: '#16a34a', fontWeight: 500 }}>✓ Gespeichert</span>}
    </div>
  );
}

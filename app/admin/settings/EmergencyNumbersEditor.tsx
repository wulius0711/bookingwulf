'use client';

import { useState } from 'react';

type Entry = { label: string; number: string };

export default function EmergencyNumbersEditor({ initialJson }: { initialJson: unknown }) {
  const [entries, setEntries] = useState<Entry[]>(() => {
    if (Array.isArray(initialJson)) return initialJson as Entry[];
    return [];
  });

  function add() {
    setEntries((e) => [...e, { label: '', number: '' }]);
  }

  function remove(i: number) {
    setEntries((e) => e.filter((_, idx) => idx !== i));
  }

  function update(i: number, field: keyof Entry, value: string) {
    setEntries((e) => e.map((entry, idx) => idx === i ? { ...entry, [field]: value } : entry));
  }

  const inp: React.CSSProperties = { flex: 1, padding: '9px 12px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', minWidth: 0 };

  return (
    <div style={{ display: 'grid', gap: 10 }}>
      <input type="hidden" name="emergencyJson" value={JSON.stringify(entries)} />
      {entries.map((e, i) => (
        <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            style={{ ...inp, maxWidth: 160 }}
            placeholder="Bezeichnung (z. B. Notruf)"
            value={e.label}
            onChange={(ev) => update(i, 'label', ev.target.value)}
          />
          <input
            style={inp}
            placeholder="Nummer (z. B. 112)"
            value={e.number}
            onChange={(ev) => update(i, 'number', ev.target.value)}
          />
          <button
            type="button"
            onClick={() => remove(i)}
            style={{ padding: '8px 10px', border: 'none', background: '#fef2f2', color: '#dc2626', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, flexShrink: 0 }}
          >
            ✕
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        style={{ padding: '8px 14px', border: '1.5px dashed #d1d5db', background: 'none', borderRadius: 8, fontSize: 13, color: '#6b7280', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}
      >
        + Nummer hinzufügen
      </button>
    </div>
  );
}

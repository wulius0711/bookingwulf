'use client';

import { useState } from 'react';

type Lock = { smartlockId: number; name: string };

type Props = {
  apartmentId: number;
  currentSmartlockId: string | null;
  locks: Lock[];
  saveAction: (formData: FormData) => Promise<void>;
};

export default function NukiLockSection({ apartmentId, currentSmartlockId, locks, saveAction }: Props) {
  const [selected, setSelected] = useState(currentSmartlockId ?? '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    const fd = new FormData();
    fd.append('apartmentId', String(apartmentId));
    fd.append('nukiSmartlockId', selected);
    await saveAction(fd);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <section style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: '24px 28px', marginTop: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <span style={{ fontSize: 16 }}>🔑</span>
        <span style={{ fontWeight: 700, fontSize: 15 }}>Nuki-Schloss</span>
        <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 99, background: '#f3e8ff', color: '#7c3aed' }}>Pro</span>
      </div>
      <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 16px' }}>
        Bei Sofortbuchungen wird automatisch ein Zugangscode generiert und an den Gast gesendet.
      </p>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          style={{ flex: 1, padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, color: '#111' }}
        >
          <option value="">— Kein Schloss —</option>
          {locks.map((l) => (
            <option key={l.smartlockId} value={String(l.smartlockId)}>
              {l.name} (ID {l.smartlockId})
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={saving}
          style={{ padding: '10px 18px', borderRadius: 8, border: 'none', background: '#111', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', opacity: saving ? 0.5 : 1, whiteSpace: 'nowrap' }}
        >
          {saving ? 'Wird gespeichert…' : 'Speichern'}
        </button>
        {saved && <span style={{ fontSize: 13, color: '#16a34a' }}>✓ Gespeichert</span>}
      </form>
    </section>
  );
}

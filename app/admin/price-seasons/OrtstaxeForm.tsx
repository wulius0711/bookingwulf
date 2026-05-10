'use client';

import { useState, useTransition } from 'react';

type Props = {
  action: (formData: FormData) => Promise<void>;
  hotelId: number;
  initialMode: string;
  initialRate: number;
  initialMinAge: number | null;
};

const WIEN_INFO = [
  { label: 'bis 30.6.2026', rate: '2,5237 %' },
  { label: 'ab 1.7.2026',   rate: '4,3478 %' },
  { label: 'ab 1.7.2027',   rate: '6,7797 %' },
];

export default function OrtstaxeForm({ action, hotelId, initialMode, initialRate, initialMinAge }: Props) {
  const [mode, setMode] = useState(initialMode);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      await action(formData);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    });
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 20 }}>
      <input type="hidden" name="hotelId" value={hotelId} />
      <input type="hidden" name="ortstaxeMode" value={mode} />

      {/* Mode selector */}
      <div style={{ display: 'grid', gap: 8 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>Modus</label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {([
            { value: 'off',    label: 'Deaktiviert' },
            { value: 'wien',   label: 'Wien (automatisch)' },
            { value: 'custom', label: 'Eigener Betrag' },
          ] as const).map(({ value, label }) => (
            <label
              key={value}
              onClick={() => setMode(value)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, fontSize: 14,
                cursor: 'pointer', padding: '8px 14px',
                border: `1px solid ${mode === value ? 'var(--accent)' : 'var(--border)'}`,
                borderRadius: 8,
                background: mode === value ? 'color-mix(in srgb, var(--accent) 10%, var(--surface))' : 'var(--surface)',
                color: 'var(--text-primary)',
                transition: 'border-color 0.15s, background 0.15s',
              }}
            >
              <input
                type="radio"
                name="_ortstaxeMode"
                value={value}
                checked={mode === value}
                onChange={() => setMode(value)}
                style={{ accentColor: 'var(--accent)' }}
              />
              {label}
            </label>
          ))}
        </div>
      </div>

      {/* Wien info */}
      {mode === 'wien' && (
        <div style={{ background: 'var(--status-booked-bg)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 14px', fontSize: 13, color: 'var(--status-booked-text)', display: 'grid', gap: 6 }}>
          <div style={{ fontWeight: 600, marginBottom: 2 }}>Automatische Sätze (Wiener Ortstaxe, WKO)</div>
          {WIEN_INFO.map(({ label, rate }) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
              <span>{label}</span>
              <strong>{rate} vom Zimmerpreis ohne Frühstück</strong>
            </div>
          ))}
        </div>
      )}

      {/* Custom fields */}
      {mode === 'custom' && (
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'grid', gap: 6, flex: '1 1 140px' }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>€ pro Person / Nacht</label>
            <input
              name="ortstaxePerPersonPerNight"
              type="number" min="0.01" step="0.01"
              defaultValue={initialRate || ''}
              placeholder="z. B. 2.20"
              required
              style={{ padding: '8px 10px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14 }}
            />
          </div>
          <div style={{ display: 'grid', gap: 6, flex: '1 1 140px' }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>Mindestalter (Kinder frei)</label>
            <input
              name="ortstaxeMinAge"
              type="number" min="0" step="1"
              defaultValue={initialMinAge ?? ''}
              placeholder="leer = alle zahlen"
              style={{ padding: '8px 10px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14 }}
            />
          </div>
        </div>
      )}

      <div className="admin-form-actions">
        <button type="submit" disabled={pending} className="btn-primary" style={{ opacity: pending ? 0.7 : 1 }}>
          {pending ? 'Speichern…' : 'Speichern'}
        </button>
        {saved && (
          <span style={{ fontSize: 13, color: 'var(--status-booked-text)', fontWeight: 500 }}>
            ✓ Gespeichert
          </span>
        )}
      </div>
    </form>
  );
}

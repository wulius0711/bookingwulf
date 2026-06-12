'use client';

import { useState } from 'react';
import { Button, Toggle } from '../../components/ui';

type Apartment = { id: number; name: string; basePrice: number | null };

export default function NewPriceSeasonForm({
  apartments,
  action,
  defaultStart,
  defaultEnd,
}: {
  apartments: Apartment[];
  action: (formData: FormData) => Promise<void>;
  defaultStart?: string;
  defaultEnd?: string;
}) {
  const [selected, setSelected] = useState<number[]>(apartments.length === 1 ? [apartments[0].id] : []);
  const [priceMode, setPriceMode] = useState<'absolute' | 'percent'>('absolute');
  const allSelected = selected.length === apartments.length;

  function toggleAll() {
    setSelected(allSelected ? [] : apartments.map((a) => a.id));
  }

  function toggle(id: number) {
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  }

  const missingBasePrice = apartments.filter((a) => selected.includes(a.id) && !a.basePrice);

  const label: React.CSSProperties = { fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', marginBottom: 4 };
  const input: React.CSSProperties = { width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 14, background: 'var(--surface-2)', color: 'var(--text-primary)', boxSizing: 'border-box' };
  const field: React.CSSProperties = { display: 'grid', gap: 4 };

  return (
    <form action={action} style={{ display: 'grid', gap: 16 }}>
      {/* Hidden inputs for selected apartments */}
      {selected.map((id) => (
        <input key={id} type="hidden" name="apartmentId" value={id} />
      ))}
      <input type="hidden" name="priceMode" value={priceMode} />

      <div style={field}>
        <label style={label}>Name / Bezeichnung</label>
        <input type="text" name="name" placeholder="z. B. Hochsaison, Weihnachten …" required style={input} />
      </div>

      <div style={field}>
        <label style={label}>Apartments</label>
        <div style={{ border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
          {apartments.length > 1 && (
            <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)', background: 'var(--surface-2)' }}>
              <Toggle checked={allSelected} onChange={toggleAll} label="Alle auswählen" />
            </div>
          )}
          {apartments.map((a) => (
            <div key={a.id} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              gap: 10, padding: '10px 12px',
              background: selected.includes(a.id) ? 'var(--surface-2)' : 'var(--surface)',
            }}>
              <Toggle checked={selected.includes(a.id)} onChange={() => toggle(a.id)} label={a.name} />
              {a.basePrice && (
                <span style={{ fontSize: 12, color: 'var(--text-muted)', flexShrink: 0 }}>Basis: €{a.basePrice}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div style={field}>
          <label style={label}>Von</label>
          <input type="date" name="startDate" required style={input} defaultValue={defaultStart ?? ''} />
        </div>
        <div style={field}>
          <label style={label}>Bis</label>
          <input type="date" name="endDate" required style={input} defaultValue={defaultEnd ?? ''} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, alignItems: 'start' }}>
        <div style={field}>
          <label style={label}>Preis</label>
          <div style={{ display: 'flex', gap: 0, borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border)', marginBottom: 8, background: 'var(--surface-2)' }}>
            {(['absolute', 'percent'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setPriceMode(mode)}
                style={{
                  flex: 1, padding: '7px 0', fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer',
                  background: priceMode === mode ? 'var(--accent)' : 'transparent',
                  color: priceMode === mode ? 'var(--text-on-accent, #fff)' : 'var(--text-muted)',
                }}
              >
                {mode === 'absolute' ? '€ Festpreis' : '% Aufschlag'}
              </button>
            ))}
          </div>
          <div style={{ position: 'relative' }}>
            <input
              type="number"
              name="priceValue"
              step={priceMode === 'absolute' ? '0.01' : '1'}
              placeholder={priceMode === 'absolute' ? '0.00' : '0'}
              required
              style={{ ...input, paddingRight: 36 }}
            />
            <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: 'var(--text-muted)', pointerEvents: 'none' }}>
              {priceMode === 'absolute' ? '€' : '%'}
            </span>
          </div>
          {priceMode === 'percent' && missingBasePrice.length > 0 && (
            <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--status-pending-text)' }}>
              Kein Basispreis: {missingBasePrice.map((a) => a.name).join(', ')} — werden übersprungen.
            </p>
          )}
        </div>
        <div style={field}>
          <label style={label}>Mindestaufenthalt (Nächte)</label>
          <input type="number" name="minStay" defaultValue={1} min={1} style={input} />
        </div>
      </div>

      <div className="admin-form-actions">
        <a href="/admin/price-seasons" className="ui-btn ui-btn-secondary ui-btn-md">Abbrechen</a>
        <Button variant="primary" type="submit" disabled={selected.length === 0}>
          {selected.length > 1 ? `${selected.length} Saisons anlegen` : 'Speichern'}
        </Button>
      </div>
    </form>
  );
}

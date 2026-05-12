'use client';

import { useState } from 'react';
import Button from '../components/ui/Button';

type Preset = {
  id: number;
  name: string;
  accentColor: string | null;
  backgroundColor: string | null;
  cardBackground: string | null;
  textColor: string | null;
  mutedTextColor: string | null;
  borderColor: string | null;
  cardRadius: number | null;
  buttonRadius: number | null;
};


export default function SettingsPresets({ hotelId, initialPresets }: { hotelId: number; initialPresets: Preset[] }) {
  const [presets, setPresets] = useState<Preset[]>(initialPresets);
  const [saving, setSaving] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [showNameInput, setShowNameInput] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [appliedHint, setAppliedHint] = useState(false);

  function getCurrentValues(): Partial<Preset> {
    const get = (name: string) => (document.querySelector(`[name="${name}"]`) as HTMLInputElement)?.value || null;
    return {
      accentColor: get('accentColor'),
      backgroundColor: get('backgroundColor'),
      cardBackground: get('cardBackground'),
      textColor: get('textColor'),
      mutedTextColor: get('mutedTextColor'),
      borderColor: get('borderColor'),
      cardRadius: get('cardRadius') ? parseInt(get('cardRadius')!) : null,
      buttonRadius: get('buttonRadius') ? parseInt(get('buttonRadius')!) : null,
    };
  }

  function applyPreset(preset: Preset) {
    document.dispatchEvent(new CustomEvent('preset-apply', { detail: preset }));
    setAppliedHint(true);
  }

  async function savePreset() {
    if (!nameInput.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const values = getCurrentValues();
      const res = await fetch('/api/admin/settings-presets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hotelId, name: nameInput.trim(), ...values }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setPresets([...presets, data.preset]);
      setNameInput('');
      setShowNameInput(false);
    } catch {
      setError('Fehler beim Speichern.');
    } finally {
      setSaving(false);
    }
  }

  async function deletePreset(id: number) {
    if (!window.confirm('Preset wirklich löschen?')) return;
    try {
      await fetch(`/api/admin/settings-presets?id=${id}`, { method: 'DELETE' });
      setPresets(presets.filter(p => p.id !== id));
    } catch {
      setError('Fehler beim Löschen.');
    }
  }

  const labelStyle = { fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' as const, letterSpacing: '0.05em' };

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={labelStyle}>Gespeicherte Presets ({presets.length}/3)</span>
        {presets.length < 3 && !showNameInput && (
          <Button variant="primary" size="sm" type="button" onClick={() => setShowNameInput(true)}>+ Speichern</Button>
        )}
      </div>

      {showNameInput && (
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            autoFocus
            value={nameInput}
            onChange={e => setNameInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') savePreset(); if (e.key === 'Escape') setShowNameInput(false); }}
            placeholder="Preset-Name"
            style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 14 }}
          />
          <Button variant="primary" size="sm" type="button" loading={saving} onClick={savePreset} disabled={saving || !nameInput.trim()}>OK</Button>
          <Button variant="secondary" size="sm" type="button" onClick={() => setShowNameInput(false)}>Abbrechen</Button>
        </div>
      )}

      {presets.length === 0 && !showNameInput && (
        <p style={{ fontSize: 13, color: '#9ca3af', margin: 0 }}>Noch keine Presets gespeichert.</p>
      )}

      {presets.map(preset => (
        <div key={preset.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8 }}>
          <div style={{ display: 'flex', gap: 6, flex: 1, alignItems: 'center' }}>
            {[preset.accentColor, preset.backgroundColor, preset.cardBackground].filter(Boolean).map((c, i) => (
              <span key={i} style={{ width: 16, height: 16, borderRadius: 4, background: c!, border: '1px solid var(--border)', flexShrink: 0 }} />
            ))}
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginLeft: 4 }}>{preset.name}</span>
          </div>
          <Button variant="secondary" size="sm" type="button" onClick={() => applyPreset(preset)}>Anwenden</Button>
          <Button variant="danger" size="sm" type="button" onClick={() => deletePreset(preset.id)}>Löschen</Button>
        </div>
      ))}

      {appliedHint && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '10px 14px', background: 'var(--accent)', borderRadius: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-on-accent)' }}>Preset angewendet — jetzt speichern, damit das Widget aktualisiert wird.</span>
          <Button variant="ghost" size="sm" type="button" onClick={() => setAppliedHint(false)} style={{ color: 'var(--text-on-accent)', opacity: 0.8, padding: '0 4px' }}>×</Button>
        </div>
      )}

      {error && <p style={{ fontSize: 13, color: '#dc2626', margin: 0 }}>{error}</p>}
    </div>
  );
}

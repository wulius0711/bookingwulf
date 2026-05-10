'use client';

import { useState } from 'react';
import { Button, ConfirmDialog } from '../components/ui';

type Lock = { smartlockId: number; name: string };

type Props = {
  initialConnected: boolean;
  initialLocks: Lock[];
  initialError?: string;
};

const panel: React.CSSProperties = {
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 16,
  padding: '28px 32px',
  display: 'flex',
  flexDirection: 'column',
  gap: 20,
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  border: '1px solid var(--border)',
  borderRadius: 8,
  fontSize: 14,
  fontFamily: 'monospace',
  color: 'var(--text-primary)',
  background: 'var(--surface-2)',
  boxSizing: 'border-box',
};

export default function NukiClient({ initialConnected, initialLocks, initialError }: Props) {
  const [token, setToken] = useState('');
  const [connected, setConnected] = useState(initialConnected);
  const [locks, setLocks] = useState<Lock[]>(initialLocks);
  const [error, setError] = useState(initialError ?? '');
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [success, setSuccess] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);

  async function handleSave() {
    if (!token.trim()) return;
    setSaving(true);
    setError('');
    setSuccess('');
    const res = await fetch('/api/admin/nuki', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiToken: token.trim() }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? 'Fehler beim Speichern.');
    } else {
      setConnected(true);
      setSuccess('Verbindung erfolgreich gespeichert.');
      setToken('');
      const r2 = await fetch('/api/admin/nuki');
      const d2 = await r2.json();
      setLocks(d2.locks ?? []);
    }
    setSaving(false);
  }

  async function handleRemove() {
    setRemoving(true);
    await fetch('/api/admin/nuki', { method: 'DELETE' });
    setConnected(false);
    setLocks([]);
    setSuccess('Verbindung getrennt.');
    setRemoving(false);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 680 }}>

      {/* Status */}
      <div style={panel}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: connected ? 'var(--status-booked-text)' : 'var(--border)', flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: 600, fontSize: 15 }}>
              {connected ? `Verbunden — ${locks.length} Schloss${locks.length !== 1 ? 'schlösser' : ''} gefunden` : 'Nicht verbunden'}
            </div>
            {connected && (
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
                Schlösser werden bei Sofortbuchungen automatisch mit einem Zugangscode versehen.
              </div>
            )}
          </div>
        </div>

        {locks.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-disabled)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Verfügbare Schlösser
            </div>
            {locks.map((l) => (
              <div key={l.smartlockId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--surface-2)', borderRadius: 8, fontSize: 14 }}>
                <span style={{ fontWeight: 500 }}>🔒 {l.name}</span>
                <span style={{ fontSize: 12, color: 'var(--text-disabled)', fontFamily: 'monospace' }}>ID {l.smartlockId}</span>
              </div>
            ))}
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
              Zuweisung pro Apartment: <a href="/admin/apartments" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Apartments verwalten →</a>
            </div>
          </div>
        )}
      </div>

      {/* Token form */}
      <div style={panel}>
        <div>
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>
            {connected ? 'API-Token aktualisieren' : 'Nuki Web API-Token eingeben'}
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            Den Token finden Sie unter{' '}
            <a href="https://web.nuki.io/#/account" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-primary)' }}>
              web.nuki.io → Account → API
            </a>.
          </div>
        </div>
        <input type="password" placeholder="Nuki Web API-Token" value={token} onChange={(e) => setToken(e.target.value)} style={inputStyle} />
        {error && <div style={{ fontSize: 13, color: 'var(--status-cancelled-text)' }}>{error}</div>}
        {success && <div style={{ fontSize: 13, color: 'var(--status-booked-text)' }}>{success}</div>}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          {connected && (
            <Button variant="danger" onClick={() => setConfirmOpen(true)} loading={removing} disabled={removing}>
              Verbindung trennen
            </Button>
          )}
          <Button variant="primary" onClick={handleSave} loading={saving} disabled={saving || !token.trim()}>
            {saving ? 'Wird gespeichert…' : 'Verbindung testen & speichern'}
          </Button>
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleRemove}
        title="Verbindung trennen"
        description="Nuki-Verbindung wirklich trennen? Schlösser werden nicht mehr mit Buchungen verknüpft."
        confirmLabel="Trennen"
        dangerous
      />
    </div>
  );
}

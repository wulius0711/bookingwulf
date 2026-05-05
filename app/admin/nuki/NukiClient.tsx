'use client';

import { useState } from 'react';

type Lock = { smartlockId: number; name: string };

type Props = {
  initialConnected: boolean;
  initialLocks: Lock[];
  initialError?: string;
};

const panel: React.CSSProperties = {
  background: '#fff',
  border: '1px solid #e5e7eb',
  borderRadius: 16,
  padding: '28px 32px',
  display: 'flex',
  flexDirection: 'column',
  gap: 20,
};

const input: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  border: '1px solid #d1d5db',
  borderRadius: 8,
  fontSize: 14,
  fontFamily: 'monospace',
  color: '#111',
  boxSizing: 'border-box',
};

const btnPrimary: React.CSSProperties = {
  padding: '10px 20px',
  borderRadius: 8,
  border: 'none',
  background: 'var(--accent)',
  color: '#fff',
  fontSize: 14,
  fontWeight: 600,
  cursor: 'pointer',
};

const btnDanger: React.CSSProperties = {
  padding: '10px 20px',
  borderRadius: 8,
  border: '1px solid #fca5a5',
  background: '#fff',
  color: '#dc2626',
  fontSize: 14,
  fontWeight: 600,
  cursor: 'pointer',
};

export default function NukiClient({ initialConnected, initialLocks, initialError }: Props) {
  const [token, setToken] = useState('');
  const [connected, setConnected] = useState(initialConnected);
  const [locks, setLocks] = useState<Lock[]>(initialLocks);
  const [error, setError] = useState(initialError ?? '');
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [success, setSuccess] = useState('');

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
    if (!confirm('Nuki-Verbindung wirklich trennen? Schlösser werden nicht mehr mit Buchungen verknüpft.')) return;
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
          <div style={{
            width: 10, height: 10, borderRadius: '50%',
            background: connected ? '#22c55e' : '#d1d5db',
            flexShrink: 0,
          }} />
          <div>
            <div style={{ fontWeight: 600, fontSize: 15 }}>
              {connected ? `Verbunden — ${locks.length} Schloss${locks.length !== 1 ? 'schlösser' : ''} gefunden` : 'Nicht verbunden'}
            </div>
            {connected && (
              <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>
                Schlösser werden bei Sofortbuchungen automatisch mit einem Zugangscode versehen.
              </div>
            )}
          </div>
        </div>

        {/* Lock list */}
        {locks.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Verfügbare Schlösser
            </div>
            {locks.map((l) => (
              <div key={l.smartlockId} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 14px', background: '#f9fafb', borderRadius: 8, fontSize: 14,
              }}>
                <span style={{ fontWeight: 500 }}>🔒 {l.name}</span>
                <span style={{ fontSize: 12, color: '#9ca3af', fontFamily: 'monospace' }}>ID {l.smartlockId}</span>
              </div>
            ))}
            <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>
              Zuweisung pro Apartment: <a href="/admin/apartments" style={{ color: '#111', fontWeight: 600 }}>Apartments verwalten →</a>
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
          <div style={{ fontSize: 13, color: '#6b7280' }}>
            Den Token finden Sie unter{' '}
            <a href="https://web.nuki.io/#/account" target="_blank" rel="noopener noreferrer" style={{ color: '#111' }}>
              web.nuki.io → Account → API
            </a>.
          </div>
        </div>
        <input
          type="password"
          placeholder="Nuki Web API-Token"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          style={input}
        />
        {error && <div style={{ fontSize: 13, color: '#dc2626' }}>{error}</div>}
        {success && <div style={{ fontSize: 13, color: '#16a34a' }}>{success}</div>}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          {connected && (
            <button onClick={handleRemove} disabled={removing} style={{ ...btnDanger, opacity: removing ? 0.5 : 1 }}>
              Verbindung trennen
            </button>
          )}
          <button onClick={handleSave} disabled={saving || !token.trim()} style={{ ...btnPrimary, opacity: saving || !token.trim() ? 0.5 : 1 }}>
            {saving ? 'Wird gespeichert…' : 'Verbindung testen & speichern'}
          </button>
        </div>
      </div>

    </div>
  );
}

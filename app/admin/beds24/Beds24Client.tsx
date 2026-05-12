'use client';

import { useState } from 'react';
import { Button, ConfirmDialog } from '../components/ui';

type Apartment = { id: number; name: string };

type Props = {
  initialConnected: boolean;
  initialEnabled: boolean;
  apartments: Apartment[];
  initialMappings: Record<number, string>;
  host: string;
};

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 12px', border: '1px solid var(--border)',
  borderRadius: 8, fontSize: 14, boxSizing: 'border-box', background: 'var(--surface)',
  color: 'var(--text-primary)',
};

export default function Beds24Client({ initialConnected, initialEnabled, apartments, initialMappings, host }: Props) {
  const [connected, setConnected] = useState(initialConnected);
  const [enabled, setEnabled] = useState(initialEnabled);
  const [inviteCode, setInviteCode] = useState('');
  const [mappings, setMappings] = useState<Record<number, string>>(initialMappings);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  async function handleConnect(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setStatus(null);
    const res = await fetch('/api/admin/beds24', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inviteCode }),
    });
    const data = await res.json();
    if (res.ok) {
      setConnected(true);
      setStatus({ type: 'success', msg: `Verbunden${data.info ? ` — ${data.info}` : ''}` });
      setInviteCode('');
    } else {
      setStatus({ type: 'error', msg: data.error || 'Fehler' });
    }
    setSaving(false);
  }

  async function handleDisconnect() {
    await fetch('/api/admin/beds24', { method: 'DELETE' });
    setConnected(false);
    setEnabled(false);
    setStatus(null);
  }

  async function handleToggleEnabled() {
    const next = !enabled;
    setEnabled(next);
    await fetch('/api/admin/beds24', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isEnabled: next }),
    });
  }

  async function saveMapping(apartmentId: number, beds24RoomId: string) {
    if (!beds24RoomId.trim()) {
      await fetch('/api/admin/beds24-mappings', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apartmentId }),
      });
      setMappings((prev) => { const n = { ...prev }; delete n[apartmentId]; return n; });
      return;
    }
    await fetch('/api/admin/beds24-mappings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apartmentId, beds24RoomId }),
    });
    setMappings((prev) => ({ ...prev, [apartmentId]: beds24RoomId }));
  }

  const cardStyle: React.CSSProperties = {
    background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16,
    padding: '24px 28px', boxShadow: '0 4px 16px rgba(15,23,42,0.06)', marginBottom: 20,
  };
  const sectionTitle: React.CSSProperties = { fontSize: 15, fontWeight: 700, marginBottom: 16, color: 'var(--text-primary)' };

  return (
    <div style={{ maxWidth: 620 }}>
      {/* Connection card */}
      <div style={cardStyle}>
        <p style={sectionTitle}>Verbindung</p>

        {connected ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--status-booked-text)', display: 'inline-block' }} />
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--status-booked-text)' }}>Verbunden</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, cursor: 'pointer' }}>
                <input type="checkbox" checked={enabled} onChange={handleToggleEnabled} style={{ accentColor: 'var(--accent)' }} />
                Sync aktiv
              </label>
              <Button variant="secondary" size="sm" onClick={() => setConfirmOpen(true)}>Trennen</Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleConnect} style={{ display: 'grid', gap: 12 }}>
            <div style={{ display: 'grid', gap: 4 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Invite Code</label>
              <input type="password" value={inviteCode} onChange={e => setInviteCode(e.target.value)} placeholder="Beds24 Invite Code" style={inputStyle} required />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Button variant="primary" type="submit" loading={saving} disabled={saving}>
                {saving ? 'Verbinden…' : 'Verbinden'}
              </Button>
              {status && (
                <span style={{ fontSize: 13, color: status.type === 'success' ? 'var(--status-booked-text)' : 'var(--status-cancelled-text)' }}>{status.msg}</span>
              )}
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-disabled)', margin: 0, lineHeight: 1.5 }}>
              Den Invite Code generieren Sie in Beds24 unter Einstellungen → Marketplace → API → Invite Code generieren.
            </p>
          </form>
        )}

        {status && connected && (
          <p style={{ fontSize: 13, color: status.type === 'success' ? 'var(--status-booked-text)' : 'var(--status-cancelled-text)', marginTop: 12 }}>{status.msg}</p>
        )}
      </div>

      {/* Room mapping card */}
      {connected && apartments.length > 0 && (
        <div style={cardStyle}>
          <p style={sectionTitle}>Zimmer-Zuordnung</p>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.5 }}>
            Tragen Sie pro Apartment die entsprechende Beds24 Room ID ein. Diese finden Sie in Beds24 unter Einstellungen → Zimmer.
          </p>
          <div style={{ display: 'grid', gap: 12 }}>
            {apartments.map((apt) => (
              <MappingRow
                key={apt.id}
                apt={apt}
                initialValue={mappings[apt.id] ?? ''}
                onSave={(val) => saveMapping(apt.id, val)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Webhook info card */}
      {connected && (
        <div style={cardStyle}>
          <p style={sectionTitle}>Webhook URL</p>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12, lineHeight: 1.5 }}>
            Tragen Sie diese URL in Beds24 unter Einstellungen → Benachrichtigungen ein, damit Verfügbarkeitsänderungen in Echtzeit übermittelt werden.
          </p>
          <code style={{ display: 'block', padding: '10px 14px', background: 'var(--surface-2)', borderRadius: 8, fontSize: 13, color: 'var(--text-secondary)', wordBreak: 'break-all' }}>
            {host}/api/beds24-webhook?token=<span style={{ color: 'var(--text-disabled)' }}>{'<BEDS24_WEBHOOK_SECRET>'}</span>
          </code>
        </div>
      )}

      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDisconnect}
        title="Verbindung trennen"
        description="Beds24-Verbindung wirklich trennen? Die Zimmerzuordnungen bleiben gespeichert."
        confirmLabel="Trennen"
        dangerous
      />
    </div>
  );
}

function MappingRow({ apt, initialValue, onSave }: { apt: Apartment; initialValue: string; onSave: (val: string) => void }) {
  const [value, setValue] = useState(initialValue);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    await onSave(value);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 160px auto', gap: 8, alignItems: 'center' }}>
      <span style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 500 }}>{apt.name}</span>
      <input
        type="text"
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder="Room ID"
        style={{ padding: '8px 10px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13, boxSizing: 'border-box', background: 'var(--surface)', color: 'var(--text-primary)' }}
      />
      <Button variant="secondary" size="sm" type="button" onClick={handleSave} style={saved ? { color: 'var(--status-booked-text)', fontWeight: 700 } : undefined}>
        {saved ? '✓' : 'Speichern'}
      </Button>
    </div>
  );
}

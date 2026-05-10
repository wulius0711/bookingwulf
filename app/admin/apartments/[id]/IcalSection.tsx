'use client';

import { useState } from 'react';

type Feed = {
  id: number;
  name: string;
  url: string;
  lastSyncAt: string | null;
  lastError: string | null;
};

type Props = {
  apartmentId: number;
  hotelSlug: string;
  feeds: Feed[];
  addFeedAction: (formData: FormData) => void;
  deleteFeedAction: (formData: FormData) => void;
};

export default function IcalSection({ apartmentId, hotelSlug, feeds, addFeedAction, deleteFeedAction }: Props) {
  const [syncing, setSyncing] = useState<number | null>(null);
  const [syncResult, setSyncResult] = useState<string | null>(null);

  const exportUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/api/ical?hotel=${hotelSlug}&apartment=${apartmentId}`
    : '';

  async function handleSync(feedId: number) {
    setSyncing(feedId);
    setSyncResult(null);
    try {
      const res = await fetch('/api/ical-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedId }),
      });
      const data = await res.json();
      if (data.error) {
        setSyncResult(`Fehler: ${data.error}`);
      } else {
        setSyncResult(`${data.synced} Einträge synchronisiert`);
        setTimeout(() => window.location.reload(), 1500);
      }
    } catch {
      setSyncResult('Sync fehlgeschlagen');
    } finally {
      setSyncing(null);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid var(--border)',
    borderRadius: 8,
    fontSize: 14,
    color: 'var(--text-primary)',
    boxSizing: 'border-box',
  };

  return (
    <div style={{ marginTop: 32, border: '1px solid var(--border)', borderRadius: 16, padding: 24, background: 'var(--surface)' }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 6px', color: 'var(--text-primary)' }}>Kalender-Sync (iCal)</h2>
      <p style={{ fontSize: 14, color: '#666', margin: '0 0 20px' }}>
        Synchronisieren Sie Verfügbarkeiten mit Airbnb, Booking.com und anderen Plattformen.
      </p>

      {/* Export URL */}
      <div style={{ marginBottom: 24, padding: 16, background: 'var(--surface-2)', borderRadius: 10, border: '1px solid var(--border)' }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
          Export-URL (für Airbnb / Booking.com)
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            type="text"
            readOnly
            value={exportUrl}
            style={{ ...inputStyle, background: 'var(--surface-2)', fontSize: 13, fontFamily: 'monospace' }}
            onClick={(e) => (e.target as HTMLInputElement).select()}
          />
          <button
            type="button"
            onClick={() => navigator.clipboard.writeText(exportUrl)}
            style={{ padding: '10px 16px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface)', fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}
          >
            Kopieren
          </button>
        </div>
        <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 6, marginBottom: 0 }}>
          Diese URL bei Airbnb oder Booking.com als importierten Kalender hinterlegen.
        </p>
      </div>

      {/* Existing feeds */}
      {feeds.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
            Import-Feeds
          </div>
          <div style={{ display: 'grid', gap: 10 }}>
            {feeds.map((feed) => (
              <div key={feed.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: '12px 16px', border: '1px solid var(--border)', borderRadius: 10, background: 'var(--surface-2)', flexWrap: 'wrap' }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>{feed.name}</div>
                  <div style={{ fontSize: 12, color: '#999', wordBreak: 'break-all' }}>{feed.url}</div>
                  <div style={{ fontSize: 11, color: feed.lastError ? '#dc2626' : '#16a34a', marginTop: 4 }}>
                    {feed.lastError
                      ? `Fehler: ${feed.lastError}`
                      : feed.lastSyncAt
                        ? `Zuletzt: ${new Date(feed.lastSyncAt).toLocaleString('de-AT')}`
                        : 'Noch nicht synchronisiert'}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <button
                    type="button"
                    onClick={() => handleSync(feed.id)}
                    disabled={syncing === feed.id}
                    style={{ padding: '6px 14px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--surface)', fontSize: 12, cursor: 'pointer', color: 'var(--text-primary)' }}
                  >
                    {syncing === feed.id ? 'Sync...' : 'Jetzt syncen'}
                  </button>
                  <form action={deleteFeedAction}>
                    <input type="hidden" name="feedId" value={feed.id} />
                    <button
                      type="submit"
                      style={{ padding: '6px 14px', borderRadius: 6, border: '1px solid #fecaca', background: 'var(--surface)', fontSize: 12, cursor: 'pointer', color: '#dc2626' }}
                    >
                      Entfernen
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {syncResult && (
        <div style={{ padding: '10px 14px', background: syncResult.startsWith('Fehler') ? '#fef2f2' : '#dcfce7', borderRadius: 8, fontSize: 13, color: syncResult.startsWith('Fehler') ? '#dc2626' : '#16a34a', marginBottom: 16 }}>
          {syncResult}
        </div>
      )}

      {/* Add feed form */}
      <form action={addFeedAction} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr auto', gap: 10, alignItems: 'end' }}>
        <input type="hidden" name="apartmentId" value={apartmentId} />
        <div style={{ display: 'grid', gap: 4 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#555' }}>Name</label>
          <input name="name" required placeholder="z. B. Airbnb" style={inputStyle} />
        </div>
        <div style={{ display: 'grid', gap: 4 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#555' }}>iCal-URL</label>
          <input name="url" type="url" required placeholder="https://www.airbnb.com/calendar/ical/..." style={inputStyle} />
        </div>
        <button type="submit" className="btn-shine" style={{ padding: '10px 18px', borderRadius: 8, border: 'none', background: '#111', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', height: 42 }}>
          Hinzufügen
        </button>
      </form>
    </div>
  );
}

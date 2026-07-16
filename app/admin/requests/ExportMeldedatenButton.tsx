'use client';

import { useState } from 'react';

export default function ExportMeldedatenButton() {
  const [open, setOpen] = useState(false);
  const [from, setFrom] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().slice(0, 10);
  });
  const [to, setTo] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 1, 0);
    return d.toISOString().slice(0, 10);
  });

  function download() {
    const params = new URLSearchParams({ from, to });
    window.location.href = `/api/admin/export-meldedaten?${params}`;
    setOpen(false);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          padding: '8px 14px',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 8,
          fontSize: 13,
          fontWeight: 600,
          cursor: 'pointer',
          color: 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
          <path d="M8 1v9M5 7l3 3 3-3M2 12v1a1 1 0 001 1h10a1 1 0 001-1v-1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Meldedaten-Export
      </button>

      {open && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
            zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div style={{
            background: 'var(--surface)', borderRadius: 16, padding: 28, width: '100%', maxWidth: 420,
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          }}>
            <h2 style={{ margin: '0 0 4px', fontSize: 18, fontWeight: 600, color: 'var(--text-primary)' }}>
              Gästemeldeexport
            </h2>
            <p style={{ margin: '0 0 20px', fontSize: 13, color: '#6b7280' }}>
              CSV mit einer Zeile pro Gast (Name, Geburtsdatum, Nationalität, Ausweisnr., Adresse) für Buchungen mit abgeschlossenem Online Check-in — nach Anreisedatum filtern. Zum manuellen Hochladen im Landesportal bzw. Feratel-WebClient.
            </p>

            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 5 }}>
                  Anreise von
                </label>
                <input
                  type="date"
                  value={from}
                  onChange={e => setFrom(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 5 }}>
                  Anreise bis
                </label>
                <input
                  type="date"
                  value={to}
                  onChange={e => setTo(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
              <button
                onClick={download}
                className="btn-shine"
                style={{
                  flex: 1, padding: '10px 0', background: 'var(--accent)', color: 'var(--text-on-accent)',
                  border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer',
                }}
              >
                Herunterladen
              </button>
              <button
                onClick={() => setOpen(false)}
                style={{
                  padding: '10px 18px', background: 'var(--surface)', color: 'var(--text-muted)',
                  border: '1px solid var(--border)', borderRadius: 8, fontSize: 14, cursor: 'pointer',
                }}
              >
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

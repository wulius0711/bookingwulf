'use client';

import { useState } from 'react';

export default function BridgeSection() {
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    const fd = new FormData(e.currentTarget);
    await fetch('/api/bridge-inquiry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: fd.get('name'),
        email: fd.get('email'),
        switchDate: fd.get('switchDate'),
      }),
    }).catch(() => {});
    setPending(false);
    setSent(true);
  }

  return (
    <>
      {/* ── Divider ─────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '0 0 40px' }}>
        <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.15)' }} />
        <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.5)', whiteSpace: 'nowrap' }}>
          Noch unter Vertrag?
        </span>
        <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.15)' }} />
      </div>

      {/* ── Card ────────────────────────────────────────────────────── */}
      <div style={{
        background: '#fff',
        border: '0.5px solid rgba(0,0,0,0.12)',
        borderRadius: 16,
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        overflow: 'hidden',
      }}>
        {/* Left */}
        <div style={{ padding: '28px 32px' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontSize: 12, fontWeight: 600,
            background: '#fef3c7', color: '#92400e',
            border: '1px solid #fde68a',
            borderRadius: 20, padding: '3px 10px',
            marginBottom: 14,
          }}>
            🕐 Noch im Vertrag?
          </span>
          <h3 style={{ margin: '0 0 10px', fontSize: 20, fontWeight: 700, color: 'var(--v4-navy)', lineHeight: 1.2 }}>
            Jetzt einsteigen, später wechseln.
          </h3>
          <p style={{ margin: '0 0 18px', fontSize: 14, color: 'var(--v4-body)', lineHeight: 1.6 }}>
            Noch ein paar Monate bei einem anderen Anbieter? Kein Problem — starte heute mit der Gäste-Lounge und aktiviere den vollen Pro-Plan, sobald dein Vertrag ausläuft.
          </p>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              'Gäste-Lounge sofort aktiv — persönliche Links, Zugangscodes, Hausinfos',
              'Pro-Plan startet automatisch zum Datum deiner Wahl',
              'Kein doppeltes Onboarding — alles ist beim Umstieg schon eingerichtet',
            ].map((t) => (
              <li key={t} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 14, color: 'var(--v4-body)' }}>
                <span style={{ color: 'var(--v4-green)', fontWeight: 700, flexShrink: 0, marginTop: 1 }}>✓</span>
                {t}
              </li>
            ))}
          </ul>
        </div>

        {/* Right */}
        <div style={{
          borderLeft: '0.5px solid rgba(0,0,0,0.10)',
          padding: '28px 32px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: 4, minWidth: 200, textAlign: 'center',
        }}>
          <span style={{ fontSize: 12, color: 'var(--v4-muted)', fontWeight: 500 }}>Gäste-Lounge</span>
          <div style={{ fontSize: 36, fontWeight: 800, color: 'var(--v4-navy)', lineHeight: 1 }}>
            €29<span style={{ fontSize: 16, fontWeight: 500, color: 'var(--v4-muted)' }}>/Monat</span>
          </div>
          <p style={{ margin: '4px 0 16px', fontSize: 12, color: 'var(--v4-muted)', lineHeight: 1.5 }}>
            Nur buchbar mit<br />Pro-Plan-Zusage.<br />Kein Rückgaberecht.
          </p>
          <button
            onClick={() => { setOpen(true); setSent(false); }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '10px 20px', borderRadius: 10,
              border: '1.5px solid var(--v4-navy)',
              background: '#fff', color: 'var(--v4-navy)',
              fontSize: 14, fontWeight: 600, cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            Mehr erfahren ↗
          </button>
        </div>
      </div>

      {/* ── Modal ───────────────────────────────────────────────────── */}
      {open && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.45)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 16,
          }}
        >
          <div style={{
            background: '#fff',
            border: '0.5px solid rgba(0,0,0,0.12)',
            borderRadius: 16,
            width: '100%', maxWidth: 480,
            padding: '32px 32px 28px',
            position: 'relative',
          }}>
            <button
              onClick={() => setOpen(false)}
              style={{
                position: 'absolute', top: 16, right: 16,
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 20, color: 'var(--v4-muted)', lineHeight: 1,
              }}
              aria-label="Schließen"
            >×</button>

            <h3 style={{ margin: '0 0 10px', fontSize: 18, fontWeight: 700, color: 'var(--v4-navy)' }}>
              Bridge-Lösung anfragen
            </h3>

            {!sent ? (
              <>
                <p style={{ margin: '0 0 22px', fontSize: 14, color: 'var(--v4-body)', lineHeight: 1.65 }}>
                  Du buchst die Gäste-Lounge für €29/Monat und gibst uns dein gewünschtes Startdatum für den Pro-Plan an. Ab diesem Datum wechselst du automatisch — ohne erneutes Onboarding, ohne Datenverlust.
                </p>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[
                    { name: 'name', label: 'Name', type: 'text', placeholder: 'Max Mustermann' },
                    { name: 'email', label: 'E-Mail', type: 'email', placeholder: 'max@hotel.at' },
                    { name: 'switchDate', label: 'Ab wann kannst du wechseln?', type: 'text', placeholder: 'z. B. August 2025' },
                  ].map(({ name, label, type, placeholder }) => (
                    <div key={name} style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                      <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--v4-navy)' }}>{label}</label>
                      <input
                        name={name} type={type} placeholder={placeholder} required
                        style={{
                          padding: '9px 12px', borderRadius: 8, fontSize: 14,
                          border: '1.5px solid var(--v4-border)',
                          outline: 'none', color: 'var(--v4-navy)',
                        }}
                      />
                    </div>
                  ))}
                  <button
                    type="submit" disabled={pending}
                    style={{
                      marginTop: 4, padding: '11px 20px', borderRadius: 10,
                      background: 'var(--v4-green)', color: '#fff',
                      border: 'none', fontSize: 14, fontWeight: 600,
                      cursor: pending ? 'not-allowed' : 'pointer',
                      opacity: pending ? 0.7 : 1,
                    }}
                  >
                    {pending ? 'Wird gesendet …' : 'Unverbindlich anfragen'}
                  </button>
                </form>
              </>
            ) : (
              <p style={{ margin: '24px 0', fontSize: 15, color: 'var(--v4-body)', textAlign: 'center' }}>
                Danke — wir melden uns bei dir. 👋
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}

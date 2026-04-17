'use client';

import { useState, useActionState } from 'react';
import { registerHotel } from './register-hotel';

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[äöü]/g, (match) => ({ ä: 'ae', ö: 'oe', ü: 'ue' }[match] || match))
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export default function RegisterForm() {
  const [state, action, pending] = useActionState(registerHotel, undefined);
  const [slug, setSlug] = useState('');
  const [autoSlug, setAutoSlug] = useState(true);

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '11px 14px',
    border: '1px solid #d1d5db',
    borderRadius: 10,
    fontSize: 14,
    background: '#fff',
    color: '#111',
    outline: 'none',
    boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 12,
    fontWeight: 700,
    color: '#4b5563',
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    display: 'block',
    marginBottom: 6,
  };

  return (
    <main style={{ minHeight: '100vh', background: '#f5f5f7', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif' }}>
      <div style={{ width: '100%', maxWidth: 560 }}>

        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ margin: 0, fontSize: 30, fontWeight: 700, color: '#0f172a', letterSpacing: '-0.03em' }}>
            Konto erstellen
          </h1>
          <p style={{ margin: '8px 0 0', fontSize: 15, color: '#667085' }}>
            Booking-Widget für dein Hotel in wenigen Minuten einrichten.
          </p>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 20, padding: 32 }}>
          <form action={action} style={{ display: 'grid', gap: 18 }}>

            {state?.error && (
              <div style={{ padding: '12px 16px', background: '#fee2e2', border: '1px solid #fecaca', borderRadius: 10, fontSize: 14, color: '#dc2626' }}>
                {state.error}
              </div>
            )}

            <div>
              <label style={labelStyle}>Hotelname *</label>
              <input
                name="hotelName"
                required
                placeholder="z. B. Hotel Alpenblick"
                style={inputStyle}
                onChange={(e) => {
                  if (autoSlug) {
                    setSlug(generateSlug(e.target.value));
                  }
                }}
              />
            </div>

            <input type="hidden" name="slug" value={slug} />

            <div>
              <label style={labelStyle}>E-Mail (Admin-Login) *</label>
              <input name="email" type="email" required placeholder="info@hotel.at" style={inputStyle} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={labelStyle}>Passwort *</label>
                <input name="password" type="password" required placeholder="Min. 8 Zeichen" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Bestätigen *</label>
                <input name="confirm" type="password" required placeholder="Wiederholen" style={inputStyle} />
              </div>
            </div>

            <input type="hidden" name="plan" value="starter" />

            <button
              className="btn-primary"
              type="submit"
              disabled={pending}
              style={{
                padding: '13px 20px',
                borderRadius: 999,
                background: '#111827',
                color: '#fff',
                border: 'none',
                fontSize: 15,
                fontWeight: 600,
                cursor: pending ? 'not-allowed' : 'pointer',
                opacity: pending ? 0.7 : 1,
                marginTop: 4,
              }}
            >
              {pending ? 'Konto wird erstellt…' : 'Konto erstellen'}
            </button>

            <p style={{ margin: 0, textAlign: 'center', fontSize: 13, color: '#9ca3af' }}>
              Bereits registriert?{' '}
              <a href="/admin/login" style={{ color: '#374151', fontWeight: 600, textDecoration: 'none' }}>Einloggen</a>
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}

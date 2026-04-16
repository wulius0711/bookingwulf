'use client';

export const dynamic = 'force-dynamic';

import { useActionState } from 'react';
import { registerHotel } from './actions';
import { PLANS, PlanKey } from '@/src/lib/plans';

const PRICES: Record<PlanKey, string> = { starter: '49', pro: '99', business: '199' };

export default function RegisterPage() {
  const [state, action, pending] = useActionState(registerHotel, undefined);

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
              <input name="hotelName" required placeholder="z. B. Hotel Alpenblick" style={inputStyle} />
            </div>

            <div>
              <label style={labelStyle}>Slug *</label>
              <input name="slug" required placeholder="z. B. hotel-alpenblick" style={inputStyle} />
              <p style={{ margin: '5px 0 0', fontSize: 12, color: '#9ca3af' }}>
                Kleinbuchstaben und Bindestriche — wird als URL-Kennung verwendet.
              </p>
            </div>

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

            {/* Plan selector */}
            <div>
              <label style={labelStyle}>Plan *</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                {(Object.entries(PLANS) as [PlanKey, typeof PLANS[PlanKey]][]).map(([key, plan]) => (
                  <label
                    key={key}
                    style={{ display: 'block', cursor: 'pointer' }}
                  >
                    <input type="radio" name="plan" value={key} defaultChecked={key === 'starter'} style={{ display: 'none' }} />
                    <div style={{
                      border: '2px solid #e5e7eb',
                      borderRadius: 12,
                      padding: '14px 12px',
                      textAlign: 'center',
                      fontSize: 14,
                    }}>
                      <div style={{ fontWeight: 700, color: '#111827' }}>{plan.name}</div>
                      <div style={{ fontWeight: 600, color: '#374151', marginTop: 4 }}>€ {PRICES[key]}<span style={{ fontSize: 11, fontWeight: 400, color: '#9ca3af' }}>/Mo</span></div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <button
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
              {pending ? 'Weiterleitung zu Stripe…' : 'Konto anlegen & Zahlung starten'}
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

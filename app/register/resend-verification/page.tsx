'use client';

import { useActionState } from 'react';
import { resendVerification } from './actions';

export default function ResendVerificationPage() {
  const [state, action, pending] = useActionState(resendVerification, undefined);

  return (
    <main style={{ minHeight: '100vh', background: '#f5f5f7', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif' }}>
      <div style={{ width: '100%', maxWidth: 480, textAlign: 'center' }}>
        <img src="/bookingwulf-logo.png" alt="bookingwulf" style={{ height: 40, marginBottom: 32 }} />

        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 20, padding: '40px 32px' }}>
          {state?.success ? (
            <>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📬</div>
              <h1 style={{ margin: '0 0 12px', fontSize: 24, fontWeight: 700, color: '#0f172a', letterSpacing: '-0.02em' }}>
                Mail unterwegs
              </h1>
              <p style={{ margin: '0 0 24px', fontSize: 15, color: '#6b7280', lineHeight: 1.6 }}>
                {state.message}
              </p>
              <a href="/admin/login" style={{ fontSize: 14, color: '#374151', fontWeight: 600, textDecoration: 'none' }}>
                Zur Anmeldung
              </a>
            </>
          ) : (
            <>
              <div style={{ fontSize: 48, marginBottom: 16 }}>✉️</div>
              <h1 style={{ margin: '0 0 12px', fontSize: 24, fontWeight: 700, color: '#0f172a', letterSpacing: '-0.02em' }}>
                Bestätigungslink erneut senden
              </h1>
              <p style={{ margin: '0 0 24px', fontSize: 15, color: '#6b7280', lineHeight: 1.6 }}>
                Geben Sie Ihre E-Mail-Adresse ein — wir senden Ihnen einen neuen Bestätigungslink.
              </p>

              {state?.message && (
                <div style={{ marginBottom: 20, padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, fontSize: 14, color: '#dc2626', textAlign: 'left' }}>
                  {state.message}
                </div>
              )}

              <form action={action} style={{ display: 'flex', flexDirection: 'column', gap: 16, textAlign: 'left' }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#4b5563', letterSpacing: '0.05em', textTransform: 'uppercase' as const, display: 'block', marginBottom: 6 }}>
                    E-Mail-Adresse
                  </label>
                  <input
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="ihre@email.at"
                    style={{ width: '100%', padding: '11px 14px', border: '1px solid #d1d5db', borderRadius: 10, fontSize: 14, background: '#fff', color: '#111', outline: 'none', boxSizing: 'border-box' as const }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={pending}
                  style={{ padding: '12px 24px', background: pending ? '#9ca3af' : '#111827', color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: pending ? 'not-allowed' : 'pointer', width: '100%' }}
                >
                  {pending ? 'Wird gesendet…' : 'Bestätigungslink senden'}
                </button>
              </form>
            </>
          )}
        </div>

        <p style={{ marginTop: 20, fontSize: 13, color: '#9ca3af' }}>
          <a href="/admin/login" style={{ color: '#374151', textDecoration: 'none', fontWeight: 600 }}>Zur Anmeldung</a>
        </p>
      </div>
    </main>
  );
}

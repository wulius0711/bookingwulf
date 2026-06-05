'use client';

import { useActionState } from 'react';
import { requestPasswordReset, type ForgotState } from './actions';

export default function ForgotPasswordPage() {
  const [state, action, pending] = useActionState<ForgotState, FormData>(requestPasswordReset, undefined);

  const success = state && 'success' in state;

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        background: 'var(--page-bg)',
        fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <div
        style={{
          background: 'var(--surface)',
          borderRadius: 16,
          padding: '40px 48px',
          width: '100%',
          maxWidth: 400,
          boxShadow: '0 2px 24px rgba(0,0,0,0.08)',
        }}
      >
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>
          Passwort vergessen
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 28 }}>
          Gib deine E-Mail ein. Wir senden dir einen Link zum Zurücksetzen.
        </p>

        {success ? (
          <div>
            <div
              style={{
                padding: '14px 16px',
                background: '#dcfce7',
                border: '1px solid #bbf7d0',
                borderRadius: 10,
                fontSize: 14,
                color: '#16a34a',
                marginBottom: 20,
              }}
            >
              Falls ein Konto mit dieser E-Mail existiert, haben wir einen Link zum Zurücksetzen gesendet.
            </div>
            <a
              href="/admin/login"
              style={{
                display: 'block',
                textAlign: 'center',
                fontSize: 14,
                color: 'var(--text-primary)',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              Zurück zum Login
            </a>
          </div>
        ) : (
          <form action={action} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label htmlFor="email" style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                E-Mail
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                style={{
                  padding: '10px 14px',
                  borderRadius: 8,
                  border: '1px solid var(--border)',
                  fontSize: 14,
                  color: 'var(--text-primary)',
                  background: 'var(--surface-2)',
                }}
              />
            </div>

            {state && 'error' in state && (
              <p
                style={{
                  fontSize: 13,
                  color: '#c0392b',
                  background: '#fdf0ef',
                  border: '1px solid #f5c6c2',
                  borderRadius: 8,
                  padding: '8px 12px',
                  margin: 0,
                }}
              >
                {state.error}
              </p>
            )}

            <button
              type="submit"
              disabled={pending}
              className="btn-shine"
              style={{
                marginTop: 4,
                padding: '11px 0',
                borderRadius: 8,
                border: 'none',
                background: pending ? 'var(--primitive-gray-300)' : 'var(--accent)',
                color: '#fff',
                fontSize: 14,
                fontWeight: 600,
                cursor: pending ? 'not-allowed' : 'pointer',
              }}
            >
              {pending ? 'Wird gesendet…' : 'Link senden'}
            </button>

            <a
              href="/admin/login"
              style={{
                textAlign: 'center',
                fontSize: 13,
                color: 'var(--text-muted)',
                textDecoration: 'none',
              }}
            >
              Zurück zum Login
            </a>
          </form>
        )}
      </div>
    </div>
  );
}

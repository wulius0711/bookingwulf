'use client';

import { useActionState } from 'react';
import { useSearchParams } from 'next/navigation';
import { resetPassword, type ResetState } from './actions';

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const [state, action, pending] = useActionState<ResetState, FormData>(resetPassword, undefined);

  const success = state && 'success' in state;

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        background: '#f5f5f7',
        fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: 16,
          padding: '40px 48px',
          width: '100%',
          maxWidth: 400,
          boxShadow: '0 2px 24px rgba(0,0,0,0.08)',
        }}
      >
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8, color: '#111' }}>
          Neues Passwort
        </h1>

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
              Passwort wurde erfolgreich geändert.
            </div>
            <a
              href="/admin/login"
              style={{
                display: 'block',
                textAlign: 'center',
                padding: '11px 0',
                borderRadius: 8,
                background: '#111',
                color: '#fff',
                fontSize: 14,
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              Zum Login
            </a>
          </div>
        ) : (
          <form action={action} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <input type="hidden" name="token" value={token} />

            <p style={{ fontSize: 14, color: '#666', margin: '0 0 8px' }}>
              Vergeben Sie ein neues Passwort (min. 8 Zeichen).
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label htmlFor="password" style={{ fontSize: 13, fontWeight: 600, color: '#333' }}>
                Neues Passwort
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={8}
                style={{
                  padding: '10px 14px',
                  borderRadius: 8,
                  border: '1px solid #d1d5db',
                  fontSize: 14,
                  outline: 'none',
                  color: '#111',
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label htmlFor="confirm" style={{ fontSize: 13, fontWeight: 600, color: '#333' }}>
                Passwort bestätigen
              </label>
              <input
                id="confirm"
                name="confirm"
                type="password"
                required
                minLength={8}
                style={{
                  padding: '10px 14px',
                  borderRadius: 8,
                  border: '1px solid #d1d5db',
                  fontSize: 14,
                  outline: 'none',
                  color: '#111',
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
              style={{
                marginTop: 4,
                padding: '11px 0',
                borderRadius: 8,
                border: 'none',
                background: pending ? '#aaa' : '#111',
                color: '#fff',
                fontSize: 14,
                fontWeight: 600,
                cursor: pending ? 'not-allowed' : 'pointer',
              }}
            >
              {pending ? 'Wird gespeichert…' : 'Passwort speichern'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

'use client'
import { useActionState, useEffect } from 'react'
import { login, type LoginState } from './actions'

export default function LoginPage() {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, undefined)

  // Full page navigation after successful login (avoids white screen
  // caused by cookie change invalidating client router cache)
  useEffect(() => {
    if (state && 'success' in state) {
      window.location.href = '/admin'
    }
  }, [state])

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        background: '#f5f5f7',
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
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
        <img src="/bookingwulf-logo.png" alt="bookingwulf" style={{ height: 36, marginBottom: 20 }} />
        <h1
          style={{
            fontSize: 22,
            fontWeight: 700,
            marginBottom: 8,
            color: '#111',
          }}
        >
          Admin-Anmeldung
        </h1>
        <p style={{ fontSize: 14, color: '#666', marginBottom: 28 }}>
          Verwaltung
        </p>

        <form action={action} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label htmlFor="email" style={{ fontSize: 13, fontWeight: 600, color: '#333' }}>
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
                border: '1px solid #d1d5db',
                fontSize: 14,
                color: '#111',
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label htmlFor="password" style={{ fontSize: 13, fontWeight: 600, color: '#333' }}>
              Passwort
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              style={{
                padding: '10px 14px',
                borderRadius: 8,
                border: '1px solid #d1d5db',
                fontSize: 14,
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

          <div style={{ textAlign: 'right' }}>
            <a
              href="/admin/forgot-password"
              style={{ fontSize: 13, color: '#666', textDecoration: 'none' }}
            >
              Passwort vergessen?
            </a>
          </div>

          <button
            className="btn-primary"
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
            {pending ? 'Anmelden…' : 'Anmelden'}
          </button>
        </form>

        <p style={{ marginTop: 24, fontSize: 13, color: '#666', textAlign: 'center' }}>
          Noch kein Konto?{' '}
          <a href="/register" style={{ color: '#111', fontWeight: 600, textDecoration: 'none' }}>
            Kostenlos registrieren →
          </a>
        </p>
      </div>
    </div>
  )
}

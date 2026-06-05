'use client'
import { useActionState, useEffect, useState } from 'react'
import { login, type LoginState } from './actions'

const EyeIcon = ({ open }: { open: boolean }) =>
  open ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )

export default function LoginForm({ bgIndex }: { bgIndex: number }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, undefined)
  const [showPw, setShowPw] = useState(false)

  useEffect(() => {
    if (state && 'success' in state) window.location.href = '/admin'
  }, [state])

  return (
    <div className="auth-wrap">
      <div
        className="auth-split-left"
        style={{ backgroundImage: `url(/auth-bg/${bgIndex}.jpg)` }}
      >
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.6) 100%)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <img src="/bookingwulf-logo-wh.png" alt="bookingwulf" style={{ height: 32 }} />
        </div>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <p style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.3 }}>
            Dein Buchungssystem.<br />Einfach. Direkt.
          </p>
          <p style={{ margin: '8px 0 0', fontSize: 14, color: 'rgba(255,255,255,0.7)' }}>
            Keine Provision. Keine Plattform.
          </p>
        </div>
      </div>

      <div className="auth-split-right">
        <div style={{ width: '100%', maxWidth: 360 }}>
          <h1 style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 700, color: 'var(--auth-text)', letterSpacing: '-0.02em' }}>
            Bereit für den nächsten Gast?
          </h1>
          <p style={{ margin: '0 0 28px', fontSize: 14, color: 'var(--auth-muted)' }}>
            Willkommen zurück
          </p>

          <form action={action} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label htmlFor="email" className="auth-label">E-Mail-Adresse</label>
              <input id="email" name="email" type="email" autoComplete="email" required className="auth-input" />
            </div>

            <div>
              <label htmlFor="password" className="auth-label">Passwort</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="password" name="password"
                  type={showPw ? 'text' : 'password'}
                  autoComplete="current-password" required
                  className="auth-input auth-input-icon"
                />
                <button type="button" onClick={() => setShowPw(v => !v)} className="auth-eye-btn">
                  <EyeIcon open={showPw} />
                </button>
              </div>
            </div>

            {state && 'error' in state && (
              <div className="auth-error">{state.error}</div>
            )}

            <div style={{ textAlign: 'right' }}>
              <a href="/admin/forgot-password" style={{ fontSize: 12, color: 'var(--auth-dimmed)', textDecoration: 'none' }}>
                Passwort vergessen?
              </a>
            </div>

            <button type="submit" disabled={pending} className="auth-btn btn-shine">
              {pending ? 'Einen Moment…' : 'Bring mich rein'}
            </button>
          </form>

          <p style={{ marginTop: 24, fontSize: 13, color: 'var(--auth-dimmed)', textAlign: 'center' }}>
            Noch kein Konto?{' '}
            <a href="/register" style={{ color: 'var(--auth-text)', fontWeight: 600, textDecoration: 'none' }}>Kostenlos registrieren</a>
          </p>
        </div>
      </div>
    </div>
  )
}

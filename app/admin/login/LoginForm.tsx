'use client'
import { useActionState, useEffect, useState } from 'react'
import { login, type LoginState } from './actions'

const accent = '#0E8BA9';
const inputText = '#F4F2EC';
const labelColor = '#5B6772';

const labelStyle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 600,
  color: '#c9d1d9',
  display: 'block',
  marginBottom: 6,
};

const inputBase: React.CSSProperties = {
  width: '100%',
  paddingTop: 12,
  paddingBottom: 12,
  paddingLeft: 14,
  paddingRight: 14,
  borderRadius: 8,
  fontSize: 14,
  background: '#1a1f27',
  color: inputText,
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.15s, box-shadow 0.15s',
};

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
  );

export default function LoginForm({ bgIndex }: { bgIndex: number }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, undefined)
  const [showPw, setShowPw] = useState(false)

  useEffect(() => {
    if (state && 'success' in state) {
      window.location.href = '/admin'
    }
  }, [state])

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    }}>
      <style>{`
        .auth-input { border: 1px solid #252d38; }
        .auth-input:focus { border-color: #0E8BA9; box-shadow: 0 0 0 3px rgba(14,139,169,.15); outline: none; }
        .auth-input::placeholder { color: #8a9aa8; }
        .auth-cta { position: relative; overflow: hidden; }
        .auth-cta::before {
          content: '';
          position: absolute;
          top: 0; left: -100%;
          width: 75%; height: 100%;
          background: linear-gradient(100deg, rgba(255,255,255,0) 20%, rgba(255,255,255,0.25) 50%, rgba(255,255,255,0) 80%);
          transform: skewX(-25deg);
          transition: left 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          pointer-events: none;
        }
        .auth-cta:hover:not(:disabled)::before { left: 125%; }
        .auth-split-left { display: flex; }
        @media (max-width: 768px) {
          .auth-split-left { display: none !important; }
          .auth-split-right { width: 100% !important; }
        }
      `}</style>

      {/* Left: mountain photo */}
      <div
        className="auth-split-left"
        style={{
          flex: 1,
          backgroundImage: `url(/auth-bg/${bgIndex}.jpg)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '40px 48px',
        }}
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

      {/* Right: form */}
      <div
        className="auth-split-right"
        style={{
          width: '50%',
          flexShrink: 0,
          background: '#0B0D10',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '64px 40px',
          overflowY: 'auto',
        }}
      >
        <div style={{ width: '100%', maxWidth: 360 }}>
          <h1 style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 700, color: inputText, letterSpacing: '-0.02em' }}>
            Bereit für den nächsten Gast?
          </h1>
          <p style={{ margin: '0 0 28px', fontSize: 14, color: '#8a9aa8' }}>
            Willkommen zurück
          </p>

          <form action={action} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label htmlFor="email" style={labelStyle}>E-Mail-Adresse</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="auth-input"
                style={inputBase}
              />
            </div>

            <div>
              <label htmlFor="password" style={labelStyle}>Passwort</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  name="password"
                  type={showPw ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  className="auth-input"
                  style={{ ...inputBase, paddingRight: 44 }}
                />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: labelColor, padding: 4, lineHeight: 0 }}>
                  <EyeIcon open={showPw} />
                </button>
              </div>
            </div>

            {state && 'error' in state && (
              <div style={{
                padding: '11px 14px',
                background: 'rgba(220,38,38,0.1)',
                border: '1px solid rgba(220,38,38,0.3)',
                borderRadius: 8,
                fontSize: 13,
                color: '#f87171',
              }}>
                {state.error}
              </div>
            )}

            <div style={{ textAlign: 'right' }}>
              <a href="/admin/forgot-password" style={{ fontSize: 12, color: labelColor, textDecoration: 'none' }}>
                Passwort vergessen?
              </a>
            </div>

            <button
              type="submit"
              disabled={pending}
              className="auth-cta btn-shine"
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: 8,
                border: 'none',
                background: accent,
                color: '#fff',
                fontSize: 15,
                fontWeight: 600,
                cursor: pending ? 'not-allowed' : 'pointer',
                opacity: pending ? 0.7 : 1,
                letterSpacing: '-0.01em',
              }}
            >
              {pending ? 'Einen Moment…' : 'Bring mich rein'}
            </button>
          </form>

          <p style={{ marginTop: 24, fontSize: 13, color: labelColor, textAlign: 'center' }}>
            Noch kein Konto?{' '}
            <a href="/register" style={{ color: inputText, fontWeight: 600, textDecoration: 'none' }}>Kostenlos registrieren</a>
          </p>
        </div>
      </div>
    </div>
  )
}

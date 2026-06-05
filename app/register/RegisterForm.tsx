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

const accent = '#0E8BA9';
const inputBorder = '#252d38';
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


export default function RegisterForm({ bgIndex }: { bgIndex: number }) {
  const [state, action, pending] = useActionState(registerHotel, undefined);
  const [slug, setSlug] = useState('');
  const [autoSlug] = useState(true);
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [terms, setTerms] = useState(false);

  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
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
        .invite-body {
          overflow: hidden;
          transition: max-height 0.25s ease, opacity 0.2s ease, margin-top 0.2s ease;
        }
        .invite-body.open { max-height: 60px; opacity: 1; margin-top: 0; }
        .invite-body.closed { max-height: 0; opacity: 0; margin-top: 0; }
        .pw-grid { display: grid; grid-template-columns: 1fr; gap: 16px; }
        @media (min-width: 480px) { .pw-grid { grid-template-columns: 1fr 1fr; } }
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
          overflowY: 'auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '64px 40px',
        }}
      >
      <div style={{ width: '100%', maxWidth: 420 }}>
          <h1 style={{ margin: '0 0 6px', fontSize: 26, fontWeight: 700, color: inputText, letterSpacing: '-0.02em' }}>
            Bereit für den ersten Gast?
          </h1>
          <p style={{ margin: '0 0 28px', fontSize: 14, color: '#8a9aa8', lineHeight: 1.5 }}>
            Kostenlos starten
          </p>

          <form action={action} style={{ display: 'grid', gap: 16 }}>
            {/* Honeypot */}
            <input name="website" type="text" tabIndex={-1} autoComplete="off" aria-hidden="true"
              style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, opacity: 0 }} />

            {state?.error && (
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

            <div>
              <label htmlFor="reg-hotel-name" style={labelStyle}>Name deiner Unterkunft</label>
              <input
                id="reg-hotel-name"
                name="hotelName"
                required
                placeholder="z. B. Ferienwohnungen Müller"
                className="auth-input"
                style={inputBase}
                onChange={(e) => { if (autoSlug) setSlug(generateSlug(e.target.value)); }}
              />
            </div>

            <input type="hidden" name="slug" value={slug} />

            <div>
              <label htmlFor="reg-email" style={labelStyle}>E-Mail-Adresse</label>
              <input
                id="reg-email"
                name="email"
                type="email"
                required
                placeholder="info@unterkunft.at"
                className="auth-input"
                style={inputBase}
              />
            </div>

            <div className="pw-grid">
              <div>
                <label htmlFor="reg-password" style={labelStyle}>Passwort</label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="reg-password"
                    name="password"
                    type={showPw ? 'text' : 'password'}
                    required
                    placeholder="Min. 8 Zeichen"
                    className="auth-input"
                    style={{ ...inputBase, paddingRight: 44 }}
                  />
                  <button type="button" onClick={() => setShowPw(v => !v)}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: labelColor, padding: 4, lineHeight: 0 }}>
                    <EyeIcon open={showPw} />
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="reg-confirm" style={labelStyle}>Passwort wiederholen</label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="reg-confirm"
                    name="confirm"
                    type={showConfirm ? 'text' : 'password'}
                    required
                    placeholder="Wiederholen"
                    className="auth-input"
                    style={{ ...inputBase, paddingRight: 44 }}
                  />
                  <button type="button" onClick={() => setShowConfirm(v => !v)}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: labelColor, padding: 4, lineHeight: 0 }}>
                    <EyeIcon open={showConfirm} />
                  </button>
                </div>
              </div>
            </div>

            {/* Invite code — collapsible */}
            <div style={{ marginTop: 8 }}>
              <button
                type="button"
                onClick={() => setInviteOpen(v => !v)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '10px 14px',
                  background: '#1a1f27',
                  border: `1px solid ${inviteOpen ? accent : inputBorder}`,
                  borderBottom: inviteOpen ? 'none' : `1px solid ${inputBorder}`,
                  borderRadius: inviteOpen ? '8px 8px 0 0' : 8,
                  color: inviteOpen ? accent : labelColor,
                  fontSize: 13,
                  cursor: 'pointer',
                  transition: 'border-color 0.15s, color 0.15s',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  Einladungscode
                </span>
                <svg
                  width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  style={{ transition: 'transform 0.2s', transform: inviteOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              <div className={`invite-body ${inviteOpen ? 'open' : 'closed'}`}>
                <input
                  name="inviteCode"
                  type="text"
                  placeholder="Code eingeben"
                  className="auth-input"
                  style={{
                    ...inputBase,
                    borderRadius: '0 0 8px 8px',
                    borderTop: 'none',
                    borderColor: accent,
                    boxShadow: '0 0 0 3px rgba(14,139,169,.10)',
                  }}
                />
              </div>
            </div>

            <input type="hidden" name="plan" value="starter" />

            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: '#8a9aa8', lineHeight: 1.5, cursor: 'pointer' }}>
              <input name="terms" type="checkbox" required checked={terms} onChange={() => {}} onClick={e => e.preventDefault()} style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }} />
              <div
                onClick={() => setTerms(v => !v)}
                style={{
                  width: 18, height: 18, borderRadius: 5, flexShrink: 0, marginTop: 1,
                  border: `2px solid ${terms ? accent : '#3a4450'}`,
                  background: terms ? accent : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'background 0.15s, border-color 0.15s',
                  cursor: 'pointer',
                }}
              >
                {terms && (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M1.5 5l2.5 2.5L8.5 2" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <span>
                Ich akzeptiere die{' '}
                <a href="/agb" target="_blank" rel="noopener noreferrer" style={{ color: inputText, textDecoration: 'underline' }}>AGB</a>
                {' '}und die{' '}
                <a href="/datenschutz" target="_blank" rel="noopener noreferrer" style={{ color: inputText, textDecoration: 'underline' }}>Datenschutzerklärung</a>.
              </span>
            </label>

            <button
              type="submit"
              disabled={pending}
              className="auth-cta"
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: 8,
                background: accent,
                color: '#fff',
                border: 'none',
                fontSize: 15,
                fontWeight: 600,
                cursor: pending ? 'not-allowed' : 'pointer',
                opacity: pending ? 0.7 : 1,
                letterSpacing: '-0.01em',
                marginTop: 2,
              }}
            >
              {pending ? 'Einen Moment…' : 'Ich bin kostenlos dabei'}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 12, color: labelColor }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              Keine Kreditkarte — 14 Tage kostenlos
            </div>

            <p style={{ margin: 0, textAlign: 'center', fontSize: 13, color: labelColor }}>
              Bereits registriert?{' '}
              <a href="/admin/login" style={{ color: inputText, fontWeight: 600, textDecoration: 'none' }}>Einloggen</a>
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}


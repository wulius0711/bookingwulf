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
    <main className="auth-wrap">
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
        <div style={{ width: '100%', maxWidth: 420 }}>
          <h1 style={{ margin: '0 0 6px', fontSize: 26, fontWeight: 700, color: 'var(--auth-text)', letterSpacing: '-0.02em' }}>
            Bereit für den ersten Gast?
          </h1>
          <p style={{ margin: '0 0 28px', fontSize: 14, color: 'var(--auth-muted)', lineHeight: 1.5 }}>
            Kostenlos starten
          </p>

          <form action={action} style={{ display: 'grid', gap: 16 }}>
            <input name="website" type="text" tabIndex={-1} autoComplete="off" aria-hidden="true"
              style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, opacity: 0 }} />

            {state?.error && <div className="auth-error">{state.error}</div>}

            <div>
              <label htmlFor="reg-hotel-name" className="auth-label">Name deiner Unterkunft</label>
              <input
                id="reg-hotel-name" name="hotelName" required
                placeholder="z. B. Ferienwohnungen Müller"
                className="auth-input"
                onChange={(e) => { if (autoSlug) setSlug(generateSlug(e.target.value)); }}
              />
            </div>

            <input type="hidden" name="slug" value={slug} />

            <div>
              <label htmlFor="reg-email" className="auth-label">E-Mail-Adresse</label>
              <input
                id="reg-email" name="email" type="email" required
                placeholder="info@unterkunft.at"
                className="auth-input"
              />
            </div>

            <div className="pw-grid">
              <div>
                <label htmlFor="reg-password" className="auth-label">Passwort</label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="reg-password" name="password"
                    type={showPw ? 'text' : 'password'} required
                    placeholder="Min. 8 Zeichen"
                    className="auth-input auth-input-icon"
                  />
                  <button type="button" onClick={() => setShowPw(v => !v)} className="auth-eye-btn">
                    <EyeIcon open={showPw} />
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="reg-confirm" className="auth-label">Passwort wiederholen</label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="reg-confirm" name="confirm"
                    type={showConfirm ? 'text' : 'password'} required
                    placeholder="Wiederholen"
                    className="auth-input auth-input-icon"
                  />
                  <button type="button" onClick={() => setShowConfirm(v => !v)} className="auth-eye-btn">
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
                  background: 'var(--auth-surface)',
                  border: `1px solid ${inviteOpen ? 'var(--auth-accent)' : 'var(--auth-border)'}`,
                  borderBottom: inviteOpen ? 'none' : `1px solid var(--auth-border)`,
                  borderRadius: inviteOpen ? '8px 8px 0 0' : 8,
                  color: inviteOpen ? 'var(--auth-accent)' : 'var(--auth-dimmed)',
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
                  name="inviteCode" type="text" placeholder="Code eingeben"
                  className="auth-input"
                  style={{
                    borderRadius: '0 0 8px 8px',
                    borderTop: 'none',
                    borderColor: 'var(--auth-accent)',
                    boxShadow: '0 0 0 3px rgba(14,139,169,.10)',
                  }}
                />
              </div>
            </div>

            <input type="hidden" name="plan" value="starter" />

            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: 'var(--auth-muted)', lineHeight: 1.5, cursor: 'pointer' }}>
              <input name="terms" type="checkbox" required checked={terms} onChange={() => {}} onClick={e => e.preventDefault()}
                style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }} />
              <div
                onClick={() => setTerms(v => !v)}
                style={{
                  width: 18, height: 18, borderRadius: 5, flexShrink: 0, marginTop: 1,
                  border: `2px solid ${terms ? 'var(--auth-accent)' : '#3a4450'}`,
                  background: terms ? 'var(--auth-accent)' : 'transparent',
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
                <a href="/agb" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--auth-text)', textDecoration: 'underline' }}>AGB</a>
                {' '}und die{' '}
                <a href="/datenschutz" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--auth-text)', textDecoration: 'underline' }}>Datenschutzerklärung</a>.
              </span>
            </label>

            <button type="submit" disabled={pending} className="auth-btn btn-shine" style={{ marginTop: 2 }}>
              {pending ? 'Einen Moment…' : 'Ich bin kostenlos dabei'}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 12, color: 'var(--auth-dimmed)' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              Keine Kreditkarte — 14 Tage kostenlos
            </div>

            <p style={{ margin: 0, textAlign: 'center', fontSize: 13, color: 'var(--auth-dimmed)' }}>
              Bereits registriert?{' '}
              <a href="/admin/login" style={{ color: 'var(--auth-text)', fontWeight: 600, textDecoration: 'none' }}>Einloggen</a>
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}

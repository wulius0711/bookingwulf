'use client';

import { useActionState, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { resetPassword, type ResetState } from './actions';

function checkReqs(pw: string) {
  return {
    length: pw.length >= 8,
    number: /[0-9]/.test(pw),
    upper:  /[A-Z]/.test(pw),
    lower:  /[a-z]/.test(pw),
  };
}

function strengthScore(reqs: ReturnType<typeof checkReqs>) {
  return Object.values(reqs).filter(Boolean).length;
}

const STRENGTH_LABELS = ['', 'Schwach', 'Mittel', 'Stark', 'Sehr stark'];
const STRENGTH_COLORS = ['#e5e7eb', '#ef4444', '#f59e0b', '#22c55e', '#16a34a'];

export default function ResetForm({ bgIndex }: { bgIndex: number }) {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const [state, action, pending] = useActionState<ResetState, FormData>(resetPassword, undefined);
  const [pw, setPw] = useState('');

  const success = state && 'success' in state;
  const reqs = checkReqs(pw);
  const score = strengthScore(reqs);
  const allMet = score === 4;

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
            Neues Passwort
          </h1>
          <p style={{ margin: '0 0 28px', fontSize: 14, color: 'var(--auth-muted)' }}>
            Vergib ein neues, sicheres Passwort für deinen Account.
          </p>

          {success ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ padding: '14px 16px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 10, fontSize: 14, color: '#4ade80' }}>
                Passwort wurde erfolgreich geändert.
              </div>
              <a href="/admin/login" className="auth-btn btn-shine" style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>
                Zum Login
              </a>
            </div>
          ) : (
            <form action={action} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <input type="hidden" name="token" value={token} />

              <div>
                <label htmlFor="password" className="auth-label">Neues Passwort</label>
                <input
                  id="password" name="password" type="password"
                  required autoComplete="new-password"
                  value={pw} onChange={(e) => setPw(e.target.value)}
                  className="auth-input"
                />

                {pw.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--auth-muted)' }}>Anforderungen</span>
                        <span style={{ fontSize: 12, fontWeight: 600, color: STRENGTH_COLORS[score] }}>{STRENGTH_LABELS[score]}</span>
                      </div>
                      <div style={{ display: 'flex', gap: 4 }}>
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= score ? STRENGTH_COLORS[score] : '#2d3748', transition: 'background 0.2s' }} />
                        ))}
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {[
                        { ok: reqs.length, label: 'Mindestens 8 Zeichen' },
                        { ok: reqs.upper && reqs.lower, label: 'Groß- und Kleinbuchstaben' },
                        { ok: reqs.number, label: 'Mindestens eine Zahl' },
                      ].map(({ ok, label }) => (
                        <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 18, height: 18, borderRadius: '50%', flexShrink: 0, background: ok ? '#16a34a' : '#2d3748', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}>
                            {ok && <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                          </div>
                          <span style={{ fontSize: 12, color: ok ? '#4ade80' : 'var(--auth-muted)' }}>{label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="confirm" className="auth-label">Passwort bestätigen</label>
                <input id="confirm" name="confirm" type="password" required autoComplete="new-password" className="auth-input" />
              </div>

              {state && 'error' in state && (
                <div className="auth-error">{state.error}</div>
              )}

              <button type="submit" disabled={pending || !allMet} className="auth-btn btn-shine" style={{ opacity: pending || !allMet ? 0.5 : 1, cursor: pending || !allMet ? 'not-allowed' : 'pointer' }}>
                {pending ? 'Wird gespeichert…' : 'Passwort speichern'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

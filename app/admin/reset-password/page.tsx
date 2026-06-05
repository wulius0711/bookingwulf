'use client';

import { useActionState, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { resetPassword, type ResetState } from './actions';

function checkReqs(pw: string) {
  return {
    length:  pw.length >= 8,
    number:  /[0-9]/.test(pw),
    upper:   /[A-Z]/.test(pw),
    lower:   /[a-z]/.test(pw),
  };
}

function strengthScore(reqs: ReturnType<typeof checkReqs>) {
  return Object.values(reqs).filter(Boolean).length;
}

const STRENGTH_LABELS = ['', 'Schwach', 'Mittel', 'Stark', 'Sehr stark'];
const STRENGTH_COLORS = ['#e5e7eb', '#ef4444', '#f59e0b', '#22c55e', '#16a34a'];

const inp: React.CSSProperties = {
  padding: '10px 14px',
  borderRadius: 8,
  border: '1px solid var(--border)',
  fontSize: 14,
  color: 'var(--text-primary)',
  background: 'var(--surface-2)',
  width: '100%',
};

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const [state, action, pending] = useActionState<ResetState, FormData>(resetPassword, undefined);
  const [pw, setPw] = useState('');

  const success = state && 'success' in state;
  const reqs = checkReqs(pw);
  const score = strengthScore(reqs);
  const allMet = score === 4;

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
          maxWidth: 420,
          boxShadow: '0 2px 24px rgba(0,0,0,0.08)',
        }}
      >
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>
          Neues Passwort
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 28, marginTop: 0 }}>
          Vergib ein neues, sicheres Passwort für deinen Account.
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
              Passwort wurde erfolgreich geändert.
            </div>
            <a
              href="/admin/login"
              style={{
                display: 'block',
                textAlign: 'center',
                padding: '11px 0',
                borderRadius: 8,
                background: 'var(--accent)',
                color: 'var(--text-on-accent)',
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

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label htmlFor="password" style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                Neues Passwort
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="new-password"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                style={inp}
              />

              {pw.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
                  {/* Strength bar */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>Anforderungen</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: STRENGTH_COLORS[score] }}>
                        {STRENGTH_LABELS[score]}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          style={{
                            flex: 1,
                            height: 4,
                            borderRadius: 2,
                            background: i <= score ? STRENGTH_COLORS[score] : '#e5e7eb',
                            transition: 'background 0.2s',
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Checklist */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {[
                      { ok: reqs.length, label: 'Mindestens 8 Zeichen' },
                      { ok: reqs.upper && reqs.lower, label: 'Groß- und Kleinbuchstaben' },
                      { ok: reqs.number, label: 'Mindestens eine Zahl' },
                    ].map(({ ok, label }) => (
                      <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{
                          width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                          background: ok ? '#16a34a' : '#e5e7eb',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'background 0.2s',
                        }}>
                          {ok && (
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                              <path d="M2 5l2.5 2.5L8 3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </div>
                        <span style={{ fontSize: 12, color: ok ? '#16a34a' : 'var(--text-muted)' }}>{label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label htmlFor="confirm" style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                Passwort bestätigen
              </label>
              <input
                id="confirm"
                name="confirm"
                type="password"
                required
                autoComplete="new-password"
                style={inp}
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
              disabled={pending || !allMet}
              className="btn-shine"
              style={{
                marginTop: 4,
                padding: '11px 0',
                borderRadius: 8,
                border: 'none',
                background: pending || !allMet ? 'var(--primitive-gray-300)' : 'var(--accent)',
                color: '#fff',
                fontSize: 14,
                fontWeight: 600,
                cursor: pending || !allMet ? 'not-allowed' : 'pointer',
                transition: 'background 0.2s',
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

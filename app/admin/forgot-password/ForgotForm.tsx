'use client';

import { useActionState } from 'react';
import { requestPasswordReset, type ForgotState } from './actions';

export default function ForgotForm({ bgIndex }: { bgIndex: number }) {
  const [state, action, pending] = useActionState<ForgotState, FormData>(requestPasswordReset, undefined);
  const success = state && 'success' in state;

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
            Passwort vergessen
          </h1>
          <p style={{ margin: '0 0 28px', fontSize: 14, color: 'var(--auth-muted)' }}>
            Gib deine E-Mail ein. Wir senden dir einen Link zum Zurücksetzen.
          </p>

          {success ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ padding: '14px 16px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 10, fontSize: 14, color: '#4ade80' }}>
                Falls ein Konto mit dieser E-Mail existiert, haben wir einen Link zum Zurücksetzen gesendet.
              </div>
              <a href="/admin/login" className="auth-btn btn-shine" style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>
                Zurück zum Login
              </a>
            </div>
          ) : (
            <form action={action} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label htmlFor="email" className="auth-label">E-Mail</label>
                <input id="email" name="email" type="email" autoComplete="email" required className="auth-input" />
              </div>

              {state && 'error' in state && (
                <div className="auth-error">{state.error}</div>
              )}

              <button type="submit" disabled={pending} className="auth-btn btn-shine">
                {pending ? 'Wird gesendet…' : 'Link senden'}
              </button>

              <a href="/admin/login" style={{ textAlign: 'center', fontSize: 13, color: 'var(--auth-dimmed)', textDecoration: 'none' }}>
                Zurück zum Login
              </a>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

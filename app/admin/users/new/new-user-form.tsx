'use client';

import { useActionState, useState } from 'react';
import { createAdminUser } from '../actions';
import { Button } from '../../components/ui';

function checkReqs(pw: string) {
  return {
    length: pw.length >= 8,
    number: /[0-9]/.test(pw),
    upper:  /[A-Z]/.test(pw),
    lower:  /[a-z]/.test(pw),
  };
}

const STRENGTH_COLORS = ['#e5e7eb', '#ef4444', '#f59e0b', '#22c55e', '#16a34a'];
const STRENGTH_LABELS = ['', 'Schwach', 'Mittel', 'Stark', 'Sehr stark'];

type Hotel = { id: number; name: string; slug: string };

const inp: React.CSSProperties = {
  padding: '10px 12px',
  border: '1px solid var(--border)',
  borderRadius: 8,
  fontSize: 14,
  background: 'var(--surface-2)',
  color: 'var(--text-primary)',
  width: '100%',
  boxSizing: 'border-box',
};

const lbl: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  color: 'var(--text-muted)',
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  marginBottom: 4,
  display: 'block',
};

const fld: React.CSSProperties = { display: 'grid', gap: 4 };

const card: React.CSSProperties = {
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 16,
  overflow: 'hidden',
};

const cardHead: React.CSSProperties = {
  background: 'var(--surface-2)',
  padding: '14px 20px',
  borderBottom: '1px solid var(--border)',
};

const cardBody: React.CSSProperties = { padding: '20px', display: 'grid', gap: 16 };

const radioLabelStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: '10px 16px',
  border: '1px solid var(--border)',
  borderRadius: 8,
  fontSize: 14,
  cursor: 'pointer',
  background: 'var(--surface-2)',
};

export default function NewUserForm({ hotels }: { hotels: Hotel[] }) {
  const [state, action, pending] = useActionState(createAdminUser, undefined);
  const [pw, setPw] = useState('');
  const reqs = checkReqs(pw);
  const score = Object.values(reqs).filter(Boolean).length;

  return (
    <main className="admin-page" style={{ fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif' }}>
      <div style={{ maxWidth: 600, display: 'grid', gap: 24 }}>

        <div>
          <h1 style={{ margin: 0, fontSize: 28, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>Neuer Benutzer</h1>
          <p style={{ margin: '4px 0 0', fontSize: 14, color: 'var(--text-secondary)' }}>Legt einen neuen Admin-Zugang an.</p>
        </div>

        <form action={action} style={{ display: 'grid', gap: 20 }}>
          {state?.error && (
            <div style={{ padding: '12px 16px', borderRadius: 10, background: 'var(--status-cancelled-bg)', color: 'var(--status-cancelled-text)', fontSize: 14, border: '1px solid var(--border)' }}>
              {state.error}
            </div>
          )}

          <div style={card}>
            <div style={cardHead}>
              <h2 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Zugangsdaten</h2>
            </div>
            <div style={cardBody}>
              <label style={fld}>
                <span style={lbl}>E-Mail</span>
                <input name="email" type="email" required autoComplete="off" style={inp} />
              </label>
              <div style={fld}>
                <span style={lbl}>Passwort</span>
                <input name="password" type="password" required autoComplete="new-password" style={inp}
                  value={pw} onChange={(e) => setPw(e.target.value)} />
                {pw.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>Anforderungen</span>
                        <span style={{ fontSize: 12, fontWeight: 600, color: STRENGTH_COLORS[score] }}>{STRENGTH_LABELS[score]}</span>
                      </div>
                      <div style={{ display: 'flex', gap: 4 }}>
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= score ? STRENGTH_COLORS[score] : '#e5e7eb', transition: 'background 0.2s' }} />
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
                          <div style={{ width: 18, height: 18, borderRadius: '50%', flexShrink: 0, background: ok ? '#16a34a' : '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}>
                            {ok && <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                          </div>
                          <span style={{ fontSize: 12, color: ok ? '#16a34a' : 'var(--text-muted)' }}>{label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <label style={fld}>
                <span style={lbl}>Passwort bestätigen</span>
                <input name="confirm" type="password" required autoComplete="new-password" style={inp} />
              </label>
            </div>
          </div>

          <div style={card}>
            <div style={cardHead}>
              <h2 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Rolle & Hotel</h2>
            </div>
            <div style={cardBody}>
              <div style={fld}>
                <span style={lbl}>Rolle</span>
                <div style={{ display: 'flex', gap: 12 }}>
                  <label style={radioLabelStyle}>
                    <input type="radio" name="role" value="hotel_admin" defaultChecked />
                    Hotel Admin
                  </label>
                  <label style={radioLabelStyle}>
                    <input type="radio" name="role" value="super_admin" />
                    Super Admin
                  </label>
                </div>
              </div>
              <label style={fld}>
                <span style={lbl}>Hotel</span>
                <select name="hotelId" style={inp}>
                  <option value="">— kein Hotel (Super Admin) —</option>
                  {hotels.map((h) => (
                    <option key={h.id} value={h.id}>{h.name} ({h.slug})</option>
                  ))}
                </select>
                <span style={{ fontSize: 12, color: 'var(--text-disabled)', marginTop: 2 }}>Nur für Hotel Admin erforderlich.</span>
              </label>
            </div>
          </div>

          <div className="admin-form-actions">
            <a href="/admin/users" className="ui-btn ui-btn-secondary ui-btn-md">Abbrechen</a>
            <Button variant="primary" type="submit" loading={pending} disabled={pending}>
              {pending ? 'Wird angelegt…' : 'Benutzer anlegen'}
            </Button>
          </div>
        </form>

      </div>
    </main>
  );
}

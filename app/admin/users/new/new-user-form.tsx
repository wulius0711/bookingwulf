'use client';

import { useActionState } from 'react';
import { createAdminUser } from '../actions';

type Hotel = { id: number; name: string; slug: string };

const inp: React.CSSProperties = {
  padding: '10px 12px',
  border: '1px solid #e5e7eb',
  borderRadius: 8,
  fontSize: 14,
  background: '#f9fafb',
  color: '#111',
  width: '100%',
  boxSizing: 'border-box',
};

const lbl: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  color: '#4b5563',
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  marginBottom: 4,
  display: 'block',
};

const fld: React.CSSProperties = { display: 'grid', gap: 4 };

const card: React.CSSProperties = {
  background: '#fff',
  border: '1px solid #e5e7eb',
  borderRadius: 16,
  overflow: 'hidden',
};

const cardHead: React.CSSProperties = {
  background: '#fafafa',
  padding: '14px 20px',
  borderBottom: '1px solid #f3f4f6',
};

const cardBody: React.CSSProperties = { padding: '20px', display: 'grid', gap: 16 };

const radioLabelStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: '10px 16px',
  border: '1px solid #e5e7eb',
  borderRadius: 8,
  fontSize: 14,
  cursor: 'pointer',
  background: '#f9fafb',
};

export default function NewUserForm({ hotels }: { hotels: Hotel[] }) {
  const [state, action, pending] = useActionState(createAdminUser, undefined);

  return (
    <main className="admin-page" style={{ fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif' }}>
      <div style={{ maxWidth: 600, margin: '0 auto', display: 'grid', gap: 24 }}>

        <div>
          <h1 style={{ margin: 0, fontSize: 28, letterSpacing: '-0.02em', color: '#0f172a' }}>Neuer Benutzer</h1>
          <p style={{ margin: '4px 0 0', fontSize: 14, color: '#667085' }}>Legt einen neuen Admin-Zugang an.</p>
        </div>

        <form action={action} style={{ display: 'grid', gap: 20 }}>
          {state?.error && (
            <div style={{ padding: '12px 16px', borderRadius: 10, background: '#fef2f2', color: '#b91c1c', fontSize: 14, border: '1px solid #fca5a5' }}>
              {state.error}
            </div>
          )}

          <div style={card}>
            <div style={cardHead}>
              <h2 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#111827' }}>Zugangsdaten</h2>
            </div>
            <div style={cardBody}>
              <label style={fld}>
                <span style={lbl}>E-Mail</span>
                <input name="email" type="email" required autoComplete="off" style={inp} />
              </label>
              <label style={fld}>
                <span style={lbl}>Passwort</span>
                <input name="password" type="password" required minLength={8} autoComplete="new-password" style={inp} />
              </label>
              <label style={fld}>
                <span style={lbl}>Passwort bestätigen</span>
                <input name="confirm" type="password" required autoComplete="new-password" style={inp} />
              </label>
            </div>
          </div>

          <div style={card}>
            <div style={cardHead}>
              <h2 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#111827' }}>Rolle & Hotel</h2>
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
                <span style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>Nur für Hotel Admin erforderlich.</span>
              </label>
            </div>
          </div>

          <div className="admin-form-actions">
            <a href="/admin/users" className="btn-cancel">Abbrechen</a>
            <button type="submit" disabled={pending} className="btn-primary" style={{ opacity: pending ? 0.6 : 1 }}>
              {pending ? 'Wird angelegt…' : 'Benutzer anlegen'}
            </button>
          </div>
        </form>

      </div>
    </main>
  );
}

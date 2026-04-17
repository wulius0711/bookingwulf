'use client';

import { useActionState } from 'react';
import { createAdminUser } from '../actions';

type Hotel = { id: number; name: string; slug: string };

export default function NewUserForm({ hotels }: { hotels: Hotel[] }) {
  const [state, action, pending] = useActionState(createAdminUser, undefined);

  return (
    <main style={{ padding: 40, fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif', maxWidth: 520 }}>
      <h1 style={{ marginBottom: 8, fontSize: 26, color: '#111' }}>Neuer Benutzer</h1>
      <p style={{ marginBottom: 28, fontSize: 13, color: '#666' }}>
        Legt einen neuen Admin-Zugang an.
      </p>

      <form action={action} style={{ display: 'grid', gap: 16 }}>
        {state?.error && (
          <div
            style={{
              padding: '12px 16px',
              borderRadius: 10,
              background: '#fef2f2',
              color: '#b91c1c',
              fontSize: 14,
              border: '1px solid #fca5a5',
            }}
          >
            {state.error}
          </div>
        )}

        <label style={{ display: 'grid', gap: 6 }}>
          <span style={labelStyle}>E-Mail</span>
          <input
            name="email"
            type="email"
            required
            autoComplete="off"
            style={inputStyle}
          />
        </label>

        <label style={{ display: 'grid', gap: 6 }}>
          <span style={labelStyle}>Passwort</span>
          <input
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            style={inputStyle}
          />
        </label>

        <label style={{ display: 'grid', gap: 6 }}>
          <span style={labelStyle}>Passwort bestätigen</span>
          <input
            name="confirm"
            type="password"
            required
            autoComplete="new-password"
            style={inputStyle}
          />
        </label>

        <div style={{ display: 'grid', gap: 6 }}>
          <span style={labelStyle}>Rolle</span>
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

        <label style={{ display: 'grid', gap: 6 }}>
          <span style={labelStyle}>Hotel</span>
          <select name="hotelId" style={inputStyle}>
            <option value="">— kein Hotel (Super Admin) —</option>
            {hotels.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name} ({h.slug})
              </option>
            ))}
          </select>
          <span style={{ fontSize: 12, color: '#888' }}>
            Nur für Hotel Admin erforderlich.
          </span>
        </label>

        <button
          type="submit"
          disabled={pending}
          style={{
            marginTop: 8,
            padding: '12px 20px',
            borderRadius: 8,
            background: '#111',
            color: '#fff',
            border: 'none',
            fontSize: 14,
            fontWeight: 600,
            cursor: pending ? 'not-allowed' : 'pointer',
            opacity: pending ? 0.6 : 1,
          }}
        >
          {pending ? 'Wird angelegt…' : 'Benutzer anlegen'}
        </button>
      </form>
    </main>
  );
}

const labelStyle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 600,
  color: '#374151',
};

const inputStyle: React.CSSProperties = {
  padding: '10px 12px',
  border: '1px solid #d1d5db',
  borderRadius: 8,
  fontSize: 14,
  background: '#fff',
  color: '#111',
  width: '100%',
};

const radioLabelStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: '10px 16px',
  border: '1px solid #d1d5db',
  borderRadius: 8,
  fontSize: 14,
  cursor: 'pointer',
  background: '#fff',
};

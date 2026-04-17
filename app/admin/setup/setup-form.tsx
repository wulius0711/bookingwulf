'use client'
import { useActionState } from 'react'
import { createFirstAdmin, type SetupState } from './actions'

export default function SetupForm() {
  const [state, action, pending] = useActionState<SetupState, FormData>(
    createFirstAdmin,
    undefined
  )

  return (
    <form action={action} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label htmlFor="email" style={{ fontSize: 13, fontWeight: 600, color: '#333' }}>
          E-Mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          style={{
            padding: '10px 14px',
            borderRadius: 8,
            border: '1px solid #d1d5db',
            fontSize: 14,
            color: '#111',
          }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label htmlFor="password" style={{ fontSize: 13, fontWeight: 600, color: '#333' }}>
          Passwort
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          style={{
            padding: '10px 14px',
            borderRadius: 8,
            border: '1px solid #d1d5db',
            fontSize: 14,
            color: '#111',
          }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label htmlFor="confirm" style={{ fontSize: 13, fontWeight: 600, color: '#333' }}>
          Passwort bestätigen
        </label>
        <input
          id="confirm"
          name="confirm"
          type="password"
          autoComplete="new-password"
          required
          style={{
            padding: '10px 14px',
            borderRadius: 8,
            border: '1px solid #d1d5db',
            fontSize: 14,
            color: '#111',
          }}
        />
      </div>

      {state?.error && (
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
        disabled={pending}
        style={{
          marginTop: 4,
          padding: '11px 0',
          borderRadius: 8,
          border: 'none',
          background: pending ? '#aaa' : '#111',
          color: '#fff',
          fontSize: 14,
          fontWeight: 600,
          cursor: pending ? 'not-allowed' : 'pointer',
        }}
      >
        {pending ? 'Erstelle Account…' : 'Admin-Account erstellen'}
      </button>
    </form>
  )
}

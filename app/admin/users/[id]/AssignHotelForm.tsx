'use client';

import { useActionState } from 'react';
import { AssignHotelState } from '../actions';

type Hotel = { id: number; name: string; plan: string };

export default function AssignHotelForm({
  userId,
  available,
  assignHotel,
}: {
  userId: number;
  available: Hotel[];
  assignHotel: (state: AssignHotelState, formData: FormData) => Promise<AssignHotelState>;
}) {
  const [state, action, pending] = useActionState(assignHotel, undefined);

  return (
    <form action={action} style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
      <input type="hidden" name="userId" value={userId} />
      {state?.error && (
        <p style={{ width: '100%', margin: 0, fontSize: 13, color: '#dc2626', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, padding: '8px 12px' }}>
          {state.error}
        </p>
      )}
      <select
        name="hotelId"
        required
        style={{ flex: 1, padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, background: '#fff', color: '#111', minWidth: 180 }}
      >
        <option value="">Hotel auswählen…</option>
        {available.map((h) => (
          <option key={h.id} value={h.id}>{h.name} ({h.plan})</option>
        ))}
      </select>
      <button
        type="submit"
        disabled={pending}
        style={{ padding: '9px 16px', border: 'none', background: '#111', color: '#fff', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: pending ? 'not-allowed' : 'pointer', opacity: pending ? 0.6 : 1 }}
      >
        {pending ? '…' : 'Hinzufügen'}
      </button>
    </form>
  );
}

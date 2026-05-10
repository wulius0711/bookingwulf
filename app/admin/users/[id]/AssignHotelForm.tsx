'use client';

import { useActionState } from 'react';
import { AssignHotelState } from '../actions';
import { Button } from '../../components/ui';

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
        <p style={{ width: '100%', margin: 0, fontSize: 13, color: 'var(--status-cancelled-text)', background: 'var(--status-cancelled-bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px' }}>
          {state.error}
        </p>
      )}
      <select
        name="hotelId"
        required
        style={{ flex: 1, padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 14, background: 'var(--surface-2)', color: 'var(--text-primary)', minWidth: 180 }}
      >
        <option value="">Hotel auswählen…</option>
        {available.map((h) => (
          <option key={h.id} value={h.id}>{h.name} ({h.plan})</option>
        ))}
      </select>
      <Button variant="primary" type="submit" loading={pending} disabled={pending}>
        {pending ? '…' : 'Hinzufügen'}
      </Button>
    </form>
  );
}

'use client';

import { deleteRequest, deleteAllRequests } from './request-actions';

export function DeleteRequestButton({ requestId }: { requestId: number }) {
  return (
    <form
      action={deleteRequest}
      onSubmit={(e) => { if (!confirm('Anfrage #' + requestId + ' wirklich löschen?')) e.preventDefault(); }}
    >
      <input type="hidden" name="id" value={requestId} />
      <button
        type="submit"
        style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #fca5a5', background: '#fff', color: '#dc2626', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
      >
        Anfrage löschen
      </button>
    </form>
  );
}

export function DeleteAllRequestsButton({ hotelSlug, count }: { hotelSlug: string; count: number }) {
  return (
    <form
      action={deleteAllRequests}
      onSubmit={(e) => { if (!confirm(`Alle ${count} Anfragen wirklich unwiderruflich löschen?`)) e.preventDefault(); }}
    >
      <input type="hidden" name="hotelSlug" value={hotelSlug} />
      <button
        type="submit"
        style={{ padding: '10px 16px', borderRadius: 8, border: '1px solid #fca5a5', background: '#fff', color: '#dc2626', fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}
      >
        Alle löschen ({count})
      </button>
    </form>
  );
}

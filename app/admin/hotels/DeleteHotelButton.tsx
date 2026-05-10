'use client';

import { useTransition } from 'react';

export default function DeleteHotelButton({
  hotelId,
  hotelName,
  action,
}: {
  hotelId: number;
  hotelName: string;
  action: (formData: FormData) => Promise<void>;
}) {
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (!confirm(`Hotel „${hotelName}" und alle zugehörigen Daten unwiderruflich löschen?`)) {
      e.preventDefault();
    }
  }

  return (
    <form action={action} onSubmit={handleSubmit}>
      <input type="hidden" name="id" value={hotelId} />
      <button
        type="submit"
        disabled={pending}
        style={{
          padding: '8px 14px',
          borderRadius: 8,
          border: '1px solid #fca5a5',
          background: 'var(--surface)',
          color: pending ? '#aaa' : '#dc2626',
          cursor: pending ? 'not-allowed' : 'pointer',
          fontSize: 13,
        }}
      >
        {pending ? '…' : 'Löschen'}
      </button>
    </form>
  );
}

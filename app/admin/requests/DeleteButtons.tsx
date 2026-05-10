'use client';

import { useState } from 'react';
import { deleteRequest, deleteAllRequests } from './request-actions';
import { Button, ConfirmDialog } from '../components/ui';

export function DeleteRequestButton({ requestId }: { requestId: number }) {
  const [open, setOpen] = useState(false);

  async function handleDelete() {
    const fd = new FormData();
    fd.set('id', String(requestId));
    await deleteRequest(fd);
  }

  return (
    <>
      <Button variant="danger" size="sm" onClick={() => setOpen(true)}>Anfrage löschen</Button>
      <ConfirmDialog
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={handleDelete}
        title="Anfrage löschen"
        description={`Anfrage #${requestId} wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.`}
        confirmLabel="Löschen"
        dangerous
      />
    </>
  );
}

export function DeleteAllRequestsButton({ hotelSlug, count }: { hotelSlug: string; count: number }) {
  const [open, setOpen] = useState(false);

  async function handleDelete() {
    const fd = new FormData();
    fd.set('hotelSlug', hotelSlug);
    await deleteAllRequests(fd);
  }

  return (
    <>
      <Button variant="danger" size="sm" onClick={() => setOpen(true)}>Alle löschen ({count})</Button>
      <ConfirmDialog
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={handleDelete}
        title="Alle Anfragen löschen"
        description={`Alle ${count} Anfragen wirklich unwiderruflich löschen?`}
        confirmLabel="Alle löschen"
        confirmText="löschen"
        dangerous
      />
    </>
  );
}

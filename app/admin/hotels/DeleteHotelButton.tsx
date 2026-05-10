'use client';

import { useState } from 'react';
import { Button, ConfirmDialog } from '../components/ui';

export default function DeleteHotelButton({
  hotelId,
  hotelName,
  action,
}: {
  hotelId: number;
  hotelName: string;
  action: (formData: FormData) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    const fd = new FormData();
    fd.set('id', String(hotelId));
    await action(fd);
    setLoading(false);
  }

  return (
    <>
      <Button variant="danger" size="sm" onClick={() => setOpen(true)} loading={loading} disabled={loading}>
        Löschen
      </Button>
      <ConfirmDialog
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={handleDelete}
        title="Hotel löschen"
        description={`Hotel „${hotelName}" und alle zugehörigen Daten unwiderruflich löschen?`}
        confirmLabel="Löschen"
        confirmText="löschen"
        dangerous
      />
    </>
  );
}

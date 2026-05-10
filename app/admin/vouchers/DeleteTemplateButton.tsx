'use client';

import { useState } from 'react';
import { deleteVoucherTemplate } from './actions';
import { Button, ConfirmDialog } from '../components/ui';

export default function DeleteTemplateButton({ id }: { id: number }) {
  const [open, setOpen] = useState(false);

  async function handleDelete() {
    await deleteVoucherTemplate(id);
  }

  return (
    <>
      <Button variant="danger" size="sm" onClick={() => setOpen(true)}>Löschen</Button>
      <ConfirmDialog
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={handleDelete}
        title="Vorlage löschen"
        description="Diese Vorlage wirklich löschen? Bereits verkaufte Gutscheine bleiben erhalten."
        confirmLabel="Löschen"
        dangerous
      />
    </>
  );
}

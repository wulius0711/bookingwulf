'use client';

import { deleteVoucherTemplate } from './actions';

export default function DeleteTemplateButton({ id }: { id: number }) {
  return (
    <form
      action={deleteVoucherTemplate.bind(null, id)}
      onSubmit={(e) => { if (!confirm('Vorlage löschen?')) e.preventDefault(); }}
    >
      <button type="submit" className="vc-btn-danger">Löschen</button>
    </form>
  );
}

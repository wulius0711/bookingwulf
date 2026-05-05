'use client';

import { ReactNode } from 'react';

export default function ConfirmDeleteForm({
  action,
  id,
  message,
  children,
  style,
}: {
  action: (formData: FormData) => Promise<void>;
  id: number;
  message: string;
  children: ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <form
      action={action}
      style={style}
      onSubmit={(e) => { if (!confirm(message)) e.preventDefault(); }}
    >
      <input type="hidden" name="id" value={id} />
      {children}
    </form>
  );
}

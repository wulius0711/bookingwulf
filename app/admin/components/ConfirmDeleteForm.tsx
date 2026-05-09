'use client';

import { useTransition, type ReactNode } from 'react';

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
  const [, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!confirm(message)) return;
    const formData = new FormData(e.currentTarget);
    startTransition(() => { void action(formData); });
  }

  return (
    <form onSubmit={handleSubmit} style={style}>
      <input type="hidden" name="id" value={id} />
      {children}
    </form>
  );
}

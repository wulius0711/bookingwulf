'use client';

import { useState } from 'react';
import { Button } from '../components/ui';
import ConfirmDeleteForm from '../components/ConfirmDeleteForm';

export type UserRow = {
  id: number;
  email: string;
  role: string;
  isActive: boolean;
  hotelName: string | null;
  hotelSlug: string | null;
};

export default function UserList({
  users,
  currentUserId,
  onToggle,
  onRevokeSessions,
  onDelete,
}: {
  users: UserRow[];
  currentUserId: number;
  onToggle: (fd: FormData) => Promise<void>;
  onRevokeSessions: (fd: FormData) => Promise<void>;
  onDelete: (fd: FormData) => Promise<void>;
}) {
  const [q, setQ] = useState('');

  const filtered = q.trim()
    ? users.filter((u) => {
        const s = q.toLowerCase();
        return u.email.toLowerCase().includes(s) || u.hotelName?.toLowerCase().includes(s);
      })
    : users;

  return (
    <>
      <input
        type="search"
        placeholder="E-Mail oder Hotel suchen…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        style={{
          width: '100%',
          padding: '10px 14px',
          borderRadius: 10,
          border: '1px solid var(--border)',
          background: 'var(--surface)',
          color: 'var(--text-primary)',
          fontSize: 14,
          marginBottom: 12,
          outline: 'none',
        }}
      />

      {filtered.length === 0 && (
        <p style={{ color: 'var(--text-disabled)', fontSize: 14 }}>Keine Treffer.</p>
      )}

      <div style={{ display: 'grid', gap: 12 }}>
        {filtered.map((u) => (
          <div
            key={u.id}
            style={{
              border: '1px solid var(--border)',
              borderRadius: 14,
              padding: '16px 20px',
              background: 'var(--surface)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 16,
              flexWrap: 'wrap',
              opacity: u.isActive ? 1 : 0.55,
            }}
          >
            <div style={{ display: 'grid', gap: 4 }}>
              <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--text-primary)' }}>
                {u.email}
                {u.id === currentUserId && (
                  <span style={{ marginLeft: 8, fontSize: 11, color: 'var(--text-disabled)', fontWeight: 400 }}>
                    (du)
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{
                  padding: '2px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700,
                  background: u.role === 'super_admin' ? 'var(--accent)' : 'var(--status-new-bg)',
                  color: u.role === 'super_admin' ? 'var(--text-on-accent)' : 'var(--status-new-text)',
                  textTransform: 'uppercase', letterSpacing: '0.05em',
                }}>
                  {u.role === 'super_admin' ? 'Super Admin' : 'Hotel Admin'}
                </span>

                {u.hotelName && (
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{u.hotelName}</span>
                )}

                {!u.isActive && (
                  <span style={{
                    padding: '2px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700,
                    background: 'var(--status-cancelled-bg)', color: 'var(--status-cancelled-text)',
                    textTransform: 'uppercase', letterSpacing: '0.05em',
                  }}>
                    Inaktiv
                  </span>
                )}
              </div>
            </div>

            {u.id !== currentUserId && (
              <div style={{ display: 'flex', gap: 8 }}>
                {u.role === 'hotel_admin' && (
                  <a href={`/admin/users/${u.id}`} className="ui-btn ui-btn-secondary ui-btn-sm" style={{ textDecoration: 'none' }}>
                    Hotels
                  </a>
                )}
                <form action={onToggle}>
                  <input type="hidden" name="id" value={u.id} />
                  <input type="hidden" name="isActive" value={String(u.isActive)} />
                  <Button variant="secondary" size="sm" type="submit">
                    {u.isActive ? 'Deaktivieren' : 'Aktivieren'}
                  </Button>
                </form>

                <form action={onRevokeSessions}>
                  <input type="hidden" name="id" value={u.id} />
                  <Button variant="secondary" size="sm" type="submit">Sessions beenden</Button>
                </form>

                <ConfirmDeleteForm action={onDelete} id={u.id} message={`Benutzer „${u.email}" wirklich löschen?`}>
                  <Button variant="danger" size="sm" type="submit">Löschen</Button>
                </ConfirmDeleteForm>
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

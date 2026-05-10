import { prisma } from '@/src/lib/prisma';
import { verifySession } from '@/src/lib/session';
import { redirect } from 'next/navigation';
import { assignHotel, unassignHotel, AssignHotelState } from '../actions';
import AssignHotelForm from './AssignHotelForm';

export const dynamic = 'force-dynamic';

type PageProps = { params: Promise<{ id: string }> };

export default async function UserHotelsPage({ params }: PageProps) {
  const session = await verifySession();
  if (session.role !== 'super_admin') redirect('/admin');

  const { id } = await params;
  const userId = Number(id);

  const user = await prisma.adminUser.findUnique({
    where: { id: userId },
    select: { id: true, email: true, role: true },
  });
  if (!user || user.role === 'super_admin') redirect('/admin/users');

  const assigned = await prisma.adminUserHotel.findMany({
    where: { userId },
    include: { hotel: { select: { id: true, name: true, plan: true } } },
    orderBy: { hotelId: 'asc' },
  });

  const allHotels = await prisma.hotel.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
    select: { id: true, name: true, plan: true },
  });

  const assignedIds = new Set(assigned.map((a) => a.hotelId));
  const available = allHotels.filter((h) => !assignedIds.has(h.id));
  const atLimit = assigned.length >= 2;

  const inputStyle: React.CSSProperties = {
    padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 8,
    fontSize: 14, background: 'var(--surface)', color: 'var(--text-primary)', width: '100%',
  };

  return (
    <main style={{ padding: 40, fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif', maxWidth: 600 }}>
      <a href="/admin/users" style={{ fontSize: 13, color: '#6b7280', textDecoration: 'none' }}>← Zurück</a>
      <h1 className="page-title" style={{ marginTop: 12, marginBottom: 4 }}>Hotels verwalten</h1>
      <p style={{ margin: '0 0 28px', fontSize: 14, color: '#667085' }}>{user.email}</p>

      {/* Assigned hotels */}
      <div style={{ display: 'grid', gap: 10, marginBottom: 28 }}>
        {assigned.length === 0 && (
          <p style={{ fontSize: 14, color: '#9ca3af' }}>Noch kein Hotel zugewiesen.</p>
        )}
        {assigned.map((a) => (
          <div key={a.hotelId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 16px', background: 'var(--surface)' }}>
            <div>
              <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>{a.hotel.name}</span>
              <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', background: 'var(--surface-3)', border: '1px solid var(--border)', borderRadius: 5, padding: '2px 7px' }}>
                {a.hotel.plan}
              </span>
            </div>
            <form action={unassignHotel}>
              <input type="hidden" name="userId" value={userId} />
              <input type="hidden" name="hotelId" value={a.hotelId} />
              <button type="submit" style={{ padding: '5px 12px', border: '1px solid #fca5a5', background: 'var(--surface)', color: '#dc2626', borderRadius: 7, fontSize: 13, cursor: 'pointer' }}>
                Entfernen
              </button>
            </form>
          </div>
        ))}
      </div>

      {/* Add hotel */}
      {!atLimit && available.length > 0 && (
        <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: '20px 20px', background: 'var(--surface-2)' }}>
          <h2 style={{ margin: '0 0 14px', fontSize: 16, color: 'var(--text-primary)' }}>Hotel hinzufügen</h2>
          {assigned.length > 0 && (
            <p style={{ margin: '0 0 12px', fontSize: 13, color: '#6b7280' }}>
              Nur möglich wenn das Hotel auf Business-Plan ist.
            </p>
          )}
          <AssignHotelForm userId={userId} available={available} assignHotel={assignHotel} />
        </div>
      )}

      {atLimit && (
        <p style={{ fontSize: 13, color: 'var(--text-muted)', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 16px' }}>
          Limit erreicht: Business-Plan erlaubt max. 2 Hotelanlagen pro Benutzer.
        </p>
      )}
    </main>
  );
}

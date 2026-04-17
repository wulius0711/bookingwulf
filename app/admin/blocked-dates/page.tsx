import { prisma } from '@/src/lib/prisma';
import { verifySession } from '@/src/lib/session';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

async function deleteBlockedDate(formData: FormData) {
  'use server';

  const session = await verifySession();
  const id = Number(formData.get('id'));
  if (!id) return;

  if (session.hotelId !== null) {
    const range = await prisma.blockedRange.findUnique({
      where: { id },
      include: { apartment: { select: { hotelId: true } } },
    });
    if (!range || range.apartment?.hotelId !== session.hotelId) return;
  }

  await prisma.blockedRange.delete({ where: { id } });
}

export default async function BlockedDatesPage() {
  const session = await verifySession();

  const ranges = await prisma.blockedRange.findMany({
    where: session.hotelId !== null
      ? { apartment: { hotelId: session.hotelId } }
      : undefined,
    include: { apartment: true },
    orderBy: { startDate: 'asc' },
  });

  return (
    <main className="admin-page" style={{ fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20,
        }}
      >
        <h1 style={{ margin: 0, color: '#111' }}>Sperrzeiten</h1>
        {ranges.length > 0 && (
          <Link href="/admin/blocked-dates/new">
            <button
              style={{
                padding: '10px 16px',
                border: 'none',
                background: '#111',
                color: '#fff',
                cursor: 'pointer',
                borderRadius: 8,
              }}
            >
              Neu anlegen
            </button>
          </Link>
        )}
      </div>

      {ranges.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <p style={{ fontSize: 15, color: '#6b7280', marginBottom: 16 }}>Noch keine Sperrzeiten vorhanden.</p>
          <a href="/admin/blocked-dates/new" style={{ padding: '10px 20px', borderRadius: 8, background: '#111', color: '#fff', textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>
            Neue Sperrzeit anlegen
          </a>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 16 }}>
          {ranges.map((r) => (
            <div
              key={r.id}
              style={{
                border: '1px solid #e5e7eb',
                padding: '18px 20px',
                borderRadius: 14,
                background: '#fff',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 16,
              }}
            >
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, color: '#111' }}>{r.apartment?.name || 'Alle Apartments'}</div>
                <div style={{ fontSize: 14, color: '#374151', marginTop: 4 }}>
                  {new Date(r.startDate).toLocaleDateString('de-AT')} – {new Date(r.endDate).toLocaleDateString('de-AT')}
                </div>
                {r.type && <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>Typ: {r.type}</div>}
                {r.note && <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>Notiz: {r.note}</div>}
              </div>
              <form action={deleteBlockedDate}>
                <input type="hidden" name="id" value={r.id} />
                <button
                  type="submit"
                  style={{
                    padding: '8px 14px',
                    border: '1px solid #fca5a5',
                    background: '#fff',
                    color: '#dc2626',
                    cursor: 'pointer',
                    borderRadius: 8,
                    fontSize: 13,
                  }}
                >
                  Löschen
                </button>
              </form>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

import { prisma } from '@/src/lib/prisma';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

async function deleteBlockedDate(formData: FormData) {
  'use server';

  const id = Number(formData.get('id'));

  if (!id) {
    return;
  }

  await prisma.blockedRange.delete({
    where: { id },
  });
}

export default async function BlockedDatesPage() {
  const ranges = await prisma.blockedRange.findMany({
    include: {
      apartment: true,
    },
    orderBy: {
      startDate: 'asc',
    },
  });

  return (
    <main style={{ padding: 40, fontFamily: 'Arial' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20,
        }}
      >
        <h1 style={{ margin: 0 }}>Blocked Dates</h1>
        <Link href="/admin/blocked-dates/new">
          <button
            style={{
              padding: '10px 16px',
              border: 'none',
              background: '#111',
              color: '#fff',
              cursor: 'pointer',
              borderRadius: 999,
            }}
          >
            Neu anlegen
          </button>
        </Link>
      </div>

      {ranges.length === 0 ? (
        <p>Noch keine Blockierungen vorhanden.</p>
      ) : (
        <div style={{ display: 'grid', gap: 16 }}>
          {ranges.map((r) => (
            <div
              key={r.id}
              style={{
                border: '1px solid #ddd',
                padding: 16,
                borderRadius: 12,
                background: '#fff',
              }}
            >
              <strong>{r.apartment?.name}</strong>
              <br />
              {new Date(r.startDate).toLocaleDateString('de-AT')} –{' '}
              {new Date(r.endDate).toLocaleDateString('de-AT')}
              <br />
              Typ: {r.type}
              <br />
              {r.note && (
                <>
                  Notiz: {r.note}
                  <br />
                </>
              )}
              <form action={deleteBlockedDate} style={{ marginTop: 12 }}>
                <input type="hidden" name="id" value={r.id} />
                <button
                  type="submit"
                  style={{
                    padding: '8px 14px',
                    border: '1px solid #c43c57',
                    background: '#fff',
                    color: '#c43c57',
                    cursor: 'pointer',
                    borderRadius: 999,
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

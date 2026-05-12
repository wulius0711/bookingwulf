import { prisma } from '@/src/lib/prisma';
import { verifySession } from '@/src/lib/session';
import { DeleteAllRequestsButton } from './DeleteButtons';
import RequestList from './RequestList';
import ExportButton from './ExportButton';
import { EmptyState } from '../components/ui';

export const dynamic = 'force-dynamic';

export default async function RequestsPage() {
  const session = await verifySession();
  const isSuperAdmin = session.hotelId === null;

  const hotelName = session.hotelId
    ? (await prisma.hotel.findUnique({ where: { id: session.hotelId }, select: { name: true } }))?.name || ''
    : '';

  const requests = await prisma.request.findMany({
    where: session.hotelId !== null ? { hotelId: session.hotelId } : {},
    include: {
      hotel: {
        select: {
          name: true,
          slug: true,
          accentColor: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Collect unique hotelIds from requests so we can look up apartment names
  function isNumber(value: number | null): value is number {
    return value !== null;
  }
  const hotelIds = [...new Set(requests.map((r) => r.hotelId).filter(isNumber))];

  const apartments =
    hotelIds.length > 0
      ? await prisma.apartment.findMany({
          where: { hotelId: { in: hotelIds } },
          select: { id: true, name: true },
        })
      : [];

  return (
    <main className="admin-page" style={{ maxWidth: 960 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'end',
          gap: 20,
          flexWrap: 'wrap',
          marginBottom: 24,
        }}
      >
        <div>
          <h1 style={{ margin: 0 }}>Anfragen / Buchungen</h1>
          <p className="page-subtitle" style={{ margin: '6px 0 0' }}>
            {isSuperAdmin ? 'Alle Hotels' : hotelName}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <ExportButton />
          {isSuperAdmin && requests.length > 0 && (
            <DeleteAllRequestsButton hotelSlug="" count={requests.length} />
          )}
        </div>
      </div>

      {requests.length === 0 ? (
        <EmptyState
          title="Keine Buchungen vorhanden."
          description="Sobald Gäste eine Anfrage über das Widget senden, erscheint sie hier."
          className="ui-empty--standalone"
        />
      ) : (
        <RequestList requests={requests} apartments={apartments} isSuperAdmin={isSuperAdmin} />
      )}
    </main>
  );
}

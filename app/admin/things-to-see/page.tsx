import { prisma } from '@/src/lib/prisma';
import { verifySession } from '@/src/lib/session';
import ThingsToSeeManager from './ThingsToSeeManager';

export default async function ThingsToSeePage() {
  const session = await verifySession();
  const hotelId = session.hotelId ?? undefined;

  const [items, apartments] = hotelId
    ? await Promise.all([
        prisma.thingsToSee.findMany({
          where: { hotelId },
          orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
        }),
        prisma.apartment.findMany({
          where: { hotelId },
          select: { id: true, name: true },
          orderBy: { name: 'asc' },
        }),
      ])
    : [[], []];

  return (
    <div style={{ maxWidth: 760, padding: '32px 24px' }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 6 }}>
        Umgebung
      </h1>
      <p style={{ fontSize: 15, color: '#6b7280', marginBottom: 8 }}>
        Restaurants, Sehenswürdigkeiten und Aktivitäten für Ihre Gäste — einmal einpflegen, immer verfügbar.
      </p>
      <p style={{ fontSize: 13, color: '#9ca3af', marginBottom: 32 }}>
        Erscheint im Gästeportal unter dem Tab <strong style={{ color: '#6b7280' }}>Umgebung</strong>.
      </p>
      <ThingsToSeeManager
        hotelId={hotelId!}
        initialItems={items.map((i) => ({
          ...i,
          createdAt: i.createdAt.toISOString(),
          updatedAt: i.updatedAt.toISOString(),
        }))}
        apartments={apartments}
      />
    </div>
  );
}

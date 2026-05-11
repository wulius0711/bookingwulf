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
    <main className="admin-page w-sm">
      <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 6 }}>
        Umgebung
      </h1>
      <p style={{ fontSize: 15, color: 'var(--text-secondary)', marginBottom: 8 }}>
        Restaurants, Sehenswürdigkeiten und Aktivitäten für Ihre Gäste — einmal einpflegen, immer verfügbar.
      </p>
      <p style={{ fontSize: 13, color: 'var(--text-disabled)', marginBottom: 32 }}>
        Erscheint in der Gäste-Lounge unter dem Tab <strong style={{ color: 'var(--text-secondary)' }}>Umgebung</strong>.
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
    </main>
  );
}

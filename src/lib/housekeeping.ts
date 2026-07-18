import { prisma } from './prisma';
import { buildZimmerplan } from './zimmerplan';

function todayIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export const DEFAULT_CHECKLIST_ITEMS = [
  'Betten bezogen',
  'Bad geputzt',
  'Boden gewischt',
  'Müll entsorgt',
  'Verbrauchsmaterial aufgefüllt',
];

export type HousekeepingStatus = 'clean' | 'dirty' | 'repair';

export type Occupancy =
  | { kind: 'frei' }
  | { kind: 'belegt'; guestName: string; departure: string; checkoutToday: boolean }
  | { kind: 'blockiert' };

export type HousekeepingApartment = {
  id: number;
  name: string;
  status: HousekeepingStatus;
  note: string | null;
  updatedAt: string | null;
  createdAt: string;
  checklistItems: string[];
  checklistState: Record<string, boolean>;
  occupancy: Occupancy;
};

function emptyChecklistState(items: string[]): Record<string, boolean> {
  return Object.fromEntries(items.map((item) => [item, false]));
}

export async function buildHousekeeping(hotelId: number): Promise<HousekeepingApartment[]> {
  const [apartments, zimmerplan] = await Promise.all([
    prisma.apartment.findMany({
      where: { hotelId },
      select: {
        id: true,
        name: true,
        housekeepingStatus: true,
        housekeepingNote: true,
        housekeepingUpdatedAt: true,
        housekeepingChecklistItems: true,
        housekeepingChecklistState: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    }),
    buildZimmerplan(hotelId, todayIso()),
  ]);

  const zimmerplanById = new Map(zimmerplan.map((c) => [c.id, c]));

  return apartments.map((apt) => {
    const items = Array.isArray(apt.housekeepingChecklistItems)
      ? (apt.housekeepingChecklistItems as unknown[]).map(String)
      : DEFAULT_CHECKLIST_ITEMS;
    const state = (apt.housekeepingChecklistState ?? {}) as Record<string, boolean>;

    const zStatus = zimmerplanById.get(apt.id)?.status;
    const occupancy: Occupancy =
      zStatus?.kind === 'belegt'
        ? { kind: 'belegt', guestName: zStatus.guestName, departure: zStatus.departure, checkoutToday: zStatus.checkoutToday }
        : zStatus?.kind === 'blockiert'
          ? { kind: 'blockiert' }
          : { kind: 'frei' };

    return {
      id: apt.id,
      name: apt.name,
      status: (apt.housekeepingStatus as HousekeepingStatus) ?? 'clean',
      note: apt.housekeepingNote,
      updatedAt: apt.housekeepingUpdatedAt ? apt.housekeepingUpdatedAt.toISOString() : null,
      createdAt: apt.createdAt.toISOString(),
      checklistItems: items,
      checklistState: { ...emptyChecklistState(items), ...state },
      occupancy,
    };
  });
}

import { prisma } from '@/src/lib/prisma';
import { verifySession } from '@/src/lib/session';
import { redirect } from 'next/navigation';

export default async function NewPriceSeasonPage() {
  const session = await verifySession();

  const apartments = await prisma.apartment.findMany({
    where: {
      isActive: true,
      ...(session.hotelId !== null ? { hotelId: session.hotelId } : {}),
    },
    orderBy: { name: 'asc' },
  });

  async function createSeason(formData: FormData) {
    'use server';

    const session = await verifySession();
    const apartmentId = Number(formData.get('apartmentId'));
    const startDate = new Date(String(formData.get('startDate')));
    const endDate = new Date(String(formData.get('endDate')));
    const pricePerNight = Number(formData.get('pricePerNight'));
    const minStay = Number(formData.get('minStay') || 1);

    if (!apartmentId || !pricePerNight) throw new Error('Fehlende Daten');

    if (session.hotelId !== null) {
      const apt = await prisma.apartment.findUnique({
        where: { id: apartmentId },
        select: { hotelId: true },
      });
      if (!apt || apt.hotelId !== session.hotelId) throw new Error('Zugriff verweigert.');
    }

    if (endDate <= startDate) throw new Error('Enddatum muss nach Startdatum liegen');

    await prisma.priceSeason.create({
      data: { apartmentId, startDate, endDate, pricePerNight, minStay },
    });

    redirect('/admin/price-seasons');
  }

  return (
    <main style={{ padding: 40, fontFamily: 'Arial', maxWidth: 520 }}>
      <h1>Neuer Preiszeitraum</h1>

      <form
        action={createSeason}
        style={{ display: 'grid', gap: 12, marginTop: 20 }}
      >
        <select name="apartmentId" required>
          <option value="">Apartment wählen</option>
          {apartments.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>

        <input type="date" name="startDate" required />
        <input type="date" name="endDate" required />

        <input
          type="number"
          step="0.01"
          name="pricePerNight"
          placeholder="Preis pro Nacht"
          required
        />

        <input
          type="number"
          name="minStay"
          placeholder="Mindestaufenthalt"
          defaultValue={1}
        />

        <button
          type="submit"
          style={{
            padding: '12px',
            background: '#111',
            color: '#fff',
            border: 'none',
            borderRadius: 999,
            cursor: 'pointer',
          }}
        >
          Speichern
        </button>
      </form>
    </main>
  );
}

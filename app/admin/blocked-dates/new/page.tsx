import { prisma } from '@/src/lib/prisma';
import { redirect } from 'next/navigation';

export default async function NewBlockedDatePage() {
  const apartments = await prisma.apartment.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
  });

  async function createBlockedDate(formData: FormData) {
    'use server';

    const apartmentId = Number(formData.get('apartmentId'));
    const startDate = new Date(String(formData.get('startDate')));
    const endDate = new Date(String(formData.get('endDate')));
    const type = String(formData.get('type') || 'manual');
    const note = String(formData.get('note') || '');

    if (!apartmentId || !startDate || !endDate) {
      return;
    }

    // 🔥 kleine Sicherheitslogik
    if (endDate <= startDate) {
      throw new Error('Enddatum muss nach Startdatum liegen');
    }

    await prisma.blockedRange.create({
      data: {
        apartmentId,
        startDate,
        endDate,
        type,
        note,
      },
    });

    redirect('/admin/blocked-dates');
  }

  return (
    <main style={{ padding: 40, fontFamily: 'Arial', maxWidth: 600 }}>
      <h1 style={{ marginBottom: 20 }}>Neue Blockierung</h1>

      <form action={createBlockedDate} style={{ display: 'grid', gap: 16 }}>
        <div>
          <label>Apartment</label>
          <select
            name="apartmentId"
            required
            style={{ width: '100%', padding: 10 }}
          >
            <option value="">Bitte auswählen</option>
            {apartments.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Startdatum</label>
          <input
            type="date"
            name="startDate"
            required
            style={{ width: '100%', padding: 10 }}
          />
        </div>

        <div>
          <label>Enddatum</label>
          <input
            type="date"
            name="endDate"
            required
            style={{ width: '100%', padding: 10 }}
          />
        </div>

        <div>
          <label>Typ</label>
          <select name="type" style={{ width: '100%', padding: 10 }}>
            <option value="manual">Manuell</option>
            <option value="booking">Booking</option>
          </select>
        </div>

        <div>
          <label>Notiz</label>
          <input
            type="text"
            name="note"
            placeholder="z. B. Eigennutzung"
            style={{ width: '100%', padding: 10 }}
          />
        </div>

        <button
          type="submit"
          style={{
            marginTop: 10,
            padding: '12px 18px',
            background: '#cc3955',
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

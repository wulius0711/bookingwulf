'use server';

import { prisma } from '@/src/lib/prisma';
import { redirect } from 'next/navigation';

export async function confirmOnsite(formData: FormData) {
  const apartmentId = parseInt(String(formData.get('apartmentId') || ''), 10);
  const lastname = String(formData.get('lastname') || '').trim();
  const arrivalDate = String(formData.get('arrivalDate') || '').trim();

  if (!apartmentId || !lastname || !arrivalDate) {
    redirect(`/vor-ort/${apartmentId}?error=1`);
  }

  const dayStart = new Date(arrivalDate + 'T00:00:00.000Z');
  const dayEnd = new Date(arrivalDate + 'T23:59:59.999Z');
  if (isNaN(dayStart.getTime())) redirect(`/vor-ort/${apartmentId}?error=1`);

  const candidates = await prisma.request.findMany({
    where: {
      status: 'booked',
      arrival: { gte: dayStart, lte: dayEnd },
      lastname: { equals: lastname, mode: 'insensitive' },
    },
    select: { id: true, checkinToken: true, selectedApartmentIds: true },
  });

  const match = candidates.find((c) =>
    c.selectedApartmentIds.split(',').map((s) => s.trim()).includes(String(apartmentId))
  );

  if (!match || !match.checkinToken) {
    redirect(`/vor-ort/${apartmentId}?error=1`);
  }

  await prisma.request.update({
    where: { id: match.id },
    data: { checkinOnsiteConfirmedAt: new Date() },
  });

  redirect(`/gast/${match.checkinToken}`);
}

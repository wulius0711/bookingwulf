'use server';

import { prisma } from '@/src/lib/prisma';
import { redirect } from 'next/navigation';

export async function submitCheckin(formData: FormData) {
  const token = String(formData.get('token') || '').trim();
  const arrivalTime = String(formData.get('arrivalTime') || '').trim();
  const notes = String(formData.get('notes') || '').trim();

  if (!token || !arrivalTime) redirect(`/checkin/${token}`);

  const request = await prisma.request.findUnique({
    where: { checkinToken: token },
    select: { id: true, checkinCompletedAt: true },
  });

  if (!request || request.checkinCompletedAt) redirect(`/checkin/${token}`);

  await prisma.request.update({
    where: { id: request.id },
    data: {
      checkinCompletedAt: new Date(),
      checkinArrivalTime: arrivalTime,
      checkinNotes: notes || null,
    },
  });

  redirect(`/checkin/${token}`);
}

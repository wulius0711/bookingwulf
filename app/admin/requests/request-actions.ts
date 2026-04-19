'use server';

import { prisma } from '@/src/lib/prisma';
import { verifySession } from '@/src/lib/session';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export async function deleteRequest(formData: FormData) {
  const session = await verifySession();
  if (session.hotelId !== null) return;

  const id = Number(formData.get('id'));
  if (!id) return;

  await prisma.request.delete({ where: { id } });
  redirect('/admin/requests');
}

export async function deleteAllRequests(formData: FormData) {
  const session = await verifySession();
  if (session.hotelId !== null) return;

  const hotelSlug = String(formData.get('hotelSlug') || '').trim();

  if (hotelSlug) {
    const hotel = await prisma.hotel.findUnique({ where: { slug: hotelSlug }, select: { id: true } });
    if (hotel) {
      await prisma.request.deleteMany({ where: { hotelId: hotel.id } });
    }
  } else {
    await prisma.request.deleteMany({});
  }

  revalidatePath('/admin/requests');
}

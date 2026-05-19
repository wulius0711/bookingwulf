'use server';

import { prisma } from '@/src/lib/prisma';
import { redirect } from 'next/navigation';

export async function deleteAccount(formData: FormData): Promise<void> {
  const token = formData.get('token')?.toString();
  if (!token) redirect('/delete-account?error=invalid');

  const hotel = await prisma.hotel.findFirst({
    where: {
      deletionToken: token,
      deletionTokenExpiresAt: { gt: new Date() },
      subscriptionStatus: 'inactive',
    },
    select: { id: true },
  });

  if (!hotel) redirect('/delete-account?error=invalid');

  await prisma.$transaction(async (tx) => {
    await tx.adminUser.deleteMany({ where: { hotelId: hotel.id } });
    await tx.hotel.delete({ where: { id: hotel.id } });
  });

  redirect('/delete-account?deleted=1');
}

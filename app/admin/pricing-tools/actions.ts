'use server';

import { prisma } from '@/src/lib/prisma';
import { verifySession } from '@/src/lib/session';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function savePricingTools(formData: FormData) {
  const session = await verifySession();
  const hotelId = Number(formData.get('hotelId') || 0);

  if (!hotelId) throw new Error('Hotel fehlt');
  if (session.hotelId !== null && hotelId !== session.hotelId) throw new Error('Zugriff verweigert.');

  const getBool = (name: string) => formData.get(name) === 'on';

  await prisma.hotelSettings.upsert({
    where: { hotelId },
    update: {
      showUrgencySignals: getBool('showUrgencySignals'),
      urgencyThreshold: parseInt(String(formData.get('urgencyThreshold') || '40')) || 40,
      gapNightDiscount: parseInt(String(formData.get('gapNightDiscount') || '0')) || null,
      gapNightMaxLength: parseInt(String(formData.get('gapNightMaxLength') || '0')) || null,
      ortstaxePerPersonPerNight: parseFloat(String(formData.get('ortstaxePerPersonPerNight') || '0')) || null,
      ortstaxeMinAge: parseInt(String(formData.get('ortstaxeMinAge') || '0')) || null,
    },
    create: {
      hotelId,
      showUrgencySignals: getBool('showUrgencySignals'),
      urgencyThreshold: parseInt(String(formData.get('urgencyThreshold') || '40')) || 40,
      gapNightDiscount: parseInt(String(formData.get('gapNightDiscount') || '0')) || null,
      gapNightMaxLength: parseInt(String(formData.get('gapNightMaxLength') || '0')) || null,
      ortstaxePerPersonPerNight: parseFloat(String(formData.get('ortstaxePerPersonPerNight') || '0')) || null,
      ortstaxeMinAge: parseInt(String(formData.get('ortstaxeMinAge') || '0')) || null,
    },
  });

  revalidatePath('/admin/pricing-tools');
  redirect(`/admin/pricing-tools?hotel=${hotelId}&saved=1`);
}

'use server';

import { prisma } from '@/src/lib/prisma';
import { verifySession } from '@/src/lib/session';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function saveHotelSettings(formData: FormData) {
  const session = await verifySession();
  const hotelId = Number(formData.get('hotelId') || 0);

  if (!hotelId) {
    throw new Error('Hotel fehlt');
  }

  if (session.hotelId !== null && hotelId !== session.hotelId) {
    throw new Error('Zugriff verweigert.');
  }

  const getBool = (name: string) => formData.get(name) === 'on';

  await prisma.hotelSettings.upsert({
    where: { hotelId },
    update: {
      showPrices: getBool('showPrices'),
      allowMultiSelect: getBool('allowMultiSelect'),
      showAmenities: getBool('showAmenities'),
      showExtrasStep: getBool('showExtrasStep'),
      showPhoneField: getBool('showPhoneField'),
      showMessageField: getBool('showMessageField'),
      enableImageSlider: getBool('enableImageSlider'),
      enableLightbox: getBool('enableLightbox'),

      accentColor: String(formData.get('accentColor') || '') || null,
      backgroundColor: String(formData.get('backgroundColor') || '') || null,
      cardBackground: String(formData.get('cardBackground') || '') || null,
      textColor: String(formData.get('textColor') || '') || null,
      mutedTextColor: String(formData.get('mutedTextColor') || '') || null,
      borderColor: String(formData.get('borderColor') || '') || null,

      cardRadius: Number(formData.get('cardRadius') || 0) || null,
      buttonRadius: Number(formData.get('buttonRadius') || 0) || null,
    },
    create: {
      hotelId,
      showPrices: getBool('showPrices'),
      allowMultiSelect: getBool('allowMultiSelect'),
      showAmenities: getBool('showAmenities'),
      showExtrasStep: getBool('showExtrasStep'),
      showPhoneField: getBool('showPhoneField'),
      showMessageField: getBool('showMessageField'),
      enableImageSlider: getBool('enableImageSlider'),
      enableLightbox: getBool('enableLightbox'),

      accentColor: String(formData.get('accentColor') || '') || null,
      backgroundColor: String(formData.get('backgroundColor') || '') || null,
      cardBackground: String(formData.get('cardBackground') || '') || null,
      textColor: String(formData.get('textColor') || '') || null,
      mutedTextColor: String(formData.get('mutedTextColor') || '') || null,
      borderColor: String(formData.get('borderColor') || '') || null,

      cardRadius: Number(formData.get('cardRadius') || 0) || null,
      buttonRadius: Number(formData.get('buttonRadius') || 0) || null,
    },
  });

  revalidatePath('/admin/settings');
  revalidatePath('/');
  redirect(`/admin/settings?hotel=${hotelId}`);
}

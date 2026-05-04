'use server';

import { prisma } from '@/src/lib/prisma';
import { verifySession } from '@/src/lib/session';
import { writeAuditLog } from '@/src/lib/audit';
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

  const notificationEmail = String(formData.get('notificationEmail') || '').trim() || null;
  const bookingTermsUrl = String(formData.get('bookingTermsUrl') || '').trim() || null;
  const privacyPolicyUrl = String(formData.get('privacyPolicyUrl') || '').trim() || null;
  const enableInstantBooking = getBool('enableInstantBooking');

  const prevHotel = await prisma.hotel.findUnique({
    where: { id: hotelId },
    select: { bookingTermsUrl: true, privacyPolicyUrl: true },
  });
  const prevSettings = await prisma.hotelSettings.findUnique({
    where: { hotelId },
    select: { enableInstantBooking: true },
  });

  await prisma.hotel.update({
    where: { id: hotelId },
    data: { email: notificationEmail, bookingTermsUrl, privacyPolicyUrl },
  });

  await writeAuditLog(hotelId,
    { bookingTermsUrl: prevHotel?.bookingTermsUrl, privacyPolicyUrl: prevHotel?.privacyPolicyUrl, enableInstantBooking: String(prevSettings?.enableInstantBooking ?? false) },
    { bookingTermsUrl, privacyPolicyUrl, enableInstantBooking: String(enableInstantBooking) },
  );

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
      instantBooking: getBool('instantBooking'),
      enableInstantBooking: getBool('enableInstantBooking'),
      hideRequestOption: getBool('hideRequestOption'),

      accentColor: String(formData.get('accentColor') || '') || null,
      backgroundColor: String(formData.get('backgroundColor') || '') || null,
      cardBackground: String(formData.get('cardBackground') || '') || null,
      textColor: String(formData.get('textColor') || '') || null,
      mutedTextColor: String(formData.get('mutedTextColor') || '') || null,
      borderColor: String(formData.get('borderColor') || '') || null,

      cardRadius: parseInt(String(formData.get('cardRadius') || '0')) || null,
      buttonRadius: parseInt(String(formData.get('buttonRadius') || '0')) || null,
      buttonColor: String(formData.get('buttonColor') || '') || null,

      headlineFont: String(formData.get('headlineFont') || '') || null,
      bodyFont: String(formData.get('bodyFont') || '') || null,
      headlineFontSize: parseInt(String(formData.get('headlineFontSize') || '0')) || null,
      bodyFontSize: parseInt(String(formData.get('bodyFontSize') || '0')) || null,
      headlineFontWeight: parseInt(String(formData.get('headlineFontWeight') || '0')) || null,
      bodyFontWeight: parseInt(String(formData.get('bodyFontWeight') || '0')) || null,

      miniWidgetTarget: String(formData.get('miniWidgetTarget') || '').trim() || null,

      taxRateRoom: parseFloat(String(formData.get('taxRateRoom') || '')) || null,
      taxRateCleaning: parseFloat(String(formData.get('taxRateCleaning') || '')) || null,

      bankTransferEnabled: getBool('bankTransferEnabled'),
      paypalEnabled: getBool('paypalEnabled'),
      depositEnabled: getBool('depositEnabled'),
      depositType: String(formData.get('depositType') || 'percent'),
      depositValue: parseFloat(String(formData.get('depositValue') || '25')) || 25,
      depositDueDays: parseInt(String(formData.get('depositDueDays') || '7')) || 7,
      bankAccountHolder: String(formData.get('bankAccountHolder') || '').trim() || null,
      bankIban: String(formData.get('bankIban') || '').trim() || null,
      bankBic: String(formData.get('bankBic') || '').trim() || null,

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
      instantBooking: getBool('instantBooking'),
      enableInstantBooking: getBool('enableInstantBooking'),
      hideRequestOption: getBool('hideRequestOption'),
      showUrgencySignals: getBool('showUrgencySignals'),
      urgencyThreshold: parseInt(String(formData.get('urgencyThreshold') || '40')) || 40,

      accentColor: String(formData.get('accentColor') || '') || null,
      backgroundColor: String(formData.get('backgroundColor') || '') || null,
      cardBackground: String(formData.get('cardBackground') || '') || null,
      textColor: String(formData.get('textColor') || '') || null,
      mutedTextColor: String(formData.get('mutedTextColor') || '') || null,
      borderColor: String(formData.get('borderColor') || '') || null,

      cardRadius: parseInt(String(formData.get('cardRadius') || '0')) || null,
      buttonRadius: parseInt(String(formData.get('buttonRadius') || '0')) || null,
      buttonColor: String(formData.get('buttonColor') || '') || null,

      headlineFont: String(formData.get('headlineFont') || '') || null,
      bodyFont: String(formData.get('bodyFont') || '') || null,
      headlineFontSize: parseInt(String(formData.get('headlineFontSize') || '0')) || null,
      bodyFontSize: parseInt(String(formData.get('bodyFontSize') || '0')) || null,
      headlineFontWeight: parseInt(String(formData.get('headlineFontWeight') || '0')) || null,
      bodyFontWeight: parseInt(String(formData.get('bodyFontWeight') || '0')) || null,

      ortstaxePerPersonPerNight: parseFloat(String(formData.get('ortstaxePerPersonPerNight') || '0')) || null,
      ortstaxeMinAge: parseInt(String(formData.get('ortstaxeMinAge') || '0')) || null,
      miniWidgetTarget: String(formData.get('miniWidgetTarget') || '').trim() || null,
      gapNightDiscount: parseInt(String(formData.get('gapNightDiscount') || '0')) || null,
      gapNightMaxLength: parseInt(String(formData.get('gapNightMaxLength') || '0')) || null,

      preArrivalEnabled: getBool('preArrivalEnabled'),
      preArrivalHouseRules: String(formData.get('preArrivalHouseRules') || '').trim() || null,
      preArrivalReminderDays: parseInt(String(formData.get('preArrivalReminderDays') || '3')) || 3,

      taxRateRoom: parseFloat(String(formData.get('taxRateRoom') || '')) || null,
      taxRateCleaning: parseFloat(String(formData.get('taxRateCleaning') || '')) || null,

      bankTransferEnabled: getBool('bankTransferEnabled'),
      paypalEnabled: getBool('paypalEnabled'),
      depositEnabled: getBool('depositEnabled'),
      depositType: String(formData.get('depositType') || 'percent'),
      depositValue: parseFloat(String(formData.get('depositValue') || '25')) || 25,
      depositDueDays: parseInt(String(formData.get('depositDueDays') || '7')) || 7,
      bankAccountHolder: String(formData.get('bankAccountHolder') || '').trim() || null,
      bankIban: String(formData.get('bankIban') || '').trim() || null,
      bankBic: String(formData.get('bankBic') || '').trim() || null,

    },
  });

  revalidatePath('/admin/settings');
  revalidatePath('/');
  redirect(`/admin/settings?hotel=${hotelId}&saved=1`);
}

export async function resetHotelSettings(formData: FormData) {
  const session = await verifySession();
  const hotelId = Number(formData.get('hotelId') || 0);

  if (!hotelId) throw new Error('Hotel fehlt');
  if (session.hotelId !== null && hotelId !== session.hotelId) throw new Error('Zugriff verweigert.');

  await prisma.hotelSettings.upsert({
    where: { hotelId },
    update: {
      // Features → defaults
      showPrices: true, allowMultiSelect: false, showAmenities: true,
      showExtrasStep: true, showPhoneField: true, showMessageField: true,
      enableImageSlider: true, instantBooking: false, enableInstantBooking: false,
      // Colors → null (widget CSS defaults)
      accentColor: null, backgroundColor: null, cardBackground: null,
      textColor: null, mutedTextColor: null, borderColor: null,
      // Shape → null
      cardRadius: null, buttonRadius: null, buttonColor: null,
      // Typography → null (Inter, 14px/24px, 400/700)
      headlineFont: null, bodyFont: null,
      headlineFontSize: null, bodyFontSize: null,
      headlineFontWeight: null, bodyFontWeight: null,
    },
    create: { hotelId },
  });

  revalidatePath('/admin/settings');
  revalidatePath('/');
  redirect(`/admin/settings?hotel=${hotelId}`);
}

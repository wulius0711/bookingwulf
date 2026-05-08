'use server';

import { prisma } from '@/src/lib/prisma';
import { verifySession } from '@/src/lib/session';
import { revalidatePath } from 'next/cache';
import { autoTranslateFields } from '@/src/lib/translate';

export async function saveGuestPortalSettings(formData: FormData) {
  const session = await verifySession();
  const hotelId = Number(formData.get('hotelId') || 0);

  if (!hotelId) throw new Error('Hotel fehlt');
  if (session.hotelId !== null && hotelId !== session.hotelId) throw new Error('Zugriff verweigert.');

  const phone = String(formData.get('phone') || '').trim() || null;
  const whatsappNumber = String(formData.get('whatsappNumber') || '').trim() || null;
  const address = String(formData.get('address') || '').trim() || null;
  const checkinTime = String(formData.get('checkinTime') || '').trim() || null;
  const checkinInfo = String(formData.get('checkinInfo') || '').trim() || null;
  const checkoutInfo = String(formData.get('checkoutInfo') || '').trim() || null;
  const wifiSsid = String(formData.get('wifiSsid') || '').trim() || null;
  const wifiPassword = String(formData.get('wifiPassword') || '').trim() || null;
  const parkingInfo = String(formData.get('parkingInfo') || '').trim() || null;
  const wasteInfo = String(formData.get('wasteInfo') || '').trim() || null;
  const houseRules = String(formData.get('houseRules') || '').trim() || null;

  let emergencyJson: { label: string; number: string }[] = [];
  try {
    const raw = String(formData.get('emergencyJson') || '[]');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) emergencyJson = parsed;
  } catch { /* ignore */ }

  const existing = await prisma.hotelSettings.findUnique({
    where: { hotelId },
    select: { translationsJson: true },
  });

  const translationsJson = await autoTranslateFields(
    { checkinInfo, checkoutInfo, houseRules, parkingInfo, wasteInfo },
    existing?.translationsJson as Record<string, Record<string, string>> | null,
  );

  await prisma.hotel.update({
    where: { id: hotelId },
    data: { phone },
  });

  await prisma.hotelSettings.upsert({
    where: { hotelId },
    update: { whatsappNumber, address, checkinTime, checkinInfo, checkoutInfo, wifiSsid, wifiPassword, parkingInfo, wasteInfo, houseRules, emergencyJson, translationsJson },
    create: { hotelId, whatsappNumber, address, checkinTime, checkinInfo, checkoutInfo, wifiSsid, wifiPassword, parkingInfo, wasteInfo, houseRules, emergencyJson, translationsJson },
  });

  revalidatePath('/admin/guestportal');
}

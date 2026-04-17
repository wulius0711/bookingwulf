'use server';

import { prisma } from '@/src/lib/prisma';
import { verifySession } from '@/src/lib/session';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createExtra(formData: FormData) {
  const session = await verifySession();

  const hotelId = Number(formData.get('hotelId') || 0);
  if (!hotelId) throw new Error('Hotel fehlt.');
  if (session.hotelId !== null && hotelId !== session.hotelId) throw new Error('Zugriff verweigert.');

  const name = String(formData.get('name') || '').trim();
  const type = String(formData.get('type') || 'extra');
  const billingType = String(formData.get('billingType') || 'per_stay');
  const price = parseFloat(String(formData.get('price') || '0'));
  const linkUrl = String(formData.get('linkUrl') || '').trim() || null;
  const sortOrder = Number(formData.get('sortOrder') || 0);

  if (!name) throw new Error('Name ist erforderlich.');

  // Auto-generate key from name
  const key = name.toLowerCase()
    .replace(/[äöü]/g, m => ({ ä: 'ae', ö: 'oe', ü: 'ue' }[m] || m))
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
  if (isNaN(price) || price < 0) throw new Error('Ungültiger Preis.');

  await prisma.hotelExtra.create({
    data: { hotelId, name, key, type, billingType, price, linkUrl, sortOrder },
  });

  revalidatePath('/admin/extras');
  redirect(`/admin/extras?hotel=${hotelId}`);
}

export async function toggleExtra(id: number, isActive: boolean) {
  const session = await verifySession();

  const extra = await prisma.hotelExtra.findUnique({ where: { id } });
  if (!extra) throw new Error('Extra nicht gefunden.');
  if (session.hotelId !== null && extra.hotelId !== session.hotelId) throw new Error('Zugriff verweigert.');

  await prisma.hotelExtra.update({ where: { id }, data: { isActive } });
  revalidatePath('/admin/extras');
}

export async function deleteExtra(id: number) {
  const session = await verifySession();

  const extra = await prisma.hotelExtra.findUnique({ where: { id } });
  if (!extra) throw new Error('Extra nicht gefunden.');
  if (session.hotelId !== null && extra.hotelId !== session.hotelId) throw new Error('Zugriff verweigert.');

  await prisma.hotelExtra.delete({ where: { id } });
  revalidatePath('/admin/extras');
}

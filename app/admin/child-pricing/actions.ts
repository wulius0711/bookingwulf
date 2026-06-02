'use server';

import { prisma } from '@/src/lib/prisma';
import { verifySession } from '@/src/lib/session';
import { autoTranslateFields } from '@/src/lib/translate';
import { revalidatePath } from 'next/cache';

export async function createChildPriceRange(formData: FormData) {
  const session = await verifySession();
  const hotelId = session.hotelId;
  if (!hotelId) return;

  const label = (formData.get('label') as string) || null;
  let labelEn: string | null = null;
  let labelIt: string | null = null;
  if (label) {
    const tr = await autoTranslateFields({ label });
    labelEn = tr.en?.label ?? null;
    labelIt = tr.it?.label ?? null;
  }

  await prisma.childPriceRange.create({
    data: {
      hotelId,
      label,
      labelEn,
      labelIt,
      minAge: Number(formData.get('minAge')),
      maxAge: Number(formData.get('maxAge')),
      pricePerNight: Number(formData.get('pricePerNight')),
      sortOrder: Number(formData.get('sortOrder') || 0),
    },
  });
  revalidatePath('/admin/child-pricing');
  revalidatePath('/admin/price-seasons');
}

export async function updateChildPriceRange(formData: FormData) {
  const session = await verifySession();
  const hotelId = session.hotelId;
  if (!hotelId) return;

  const id = Number(formData.get('id'));
  const range = await prisma.childPriceRange.findUnique({ where: { id } });
  if (!range || range.hotelId !== hotelId) return;

  const label = (formData.get('label') as string) || null;
  let labelEn: string | null = null;
  let labelIt: string | null = null;
  if (label) {
    const tr = await autoTranslateFields({ label });
    labelEn = tr.en?.label ?? null;
    labelIt = tr.it?.label ?? null;
  }

  await prisma.childPriceRange.update({
    where: { id },
    data: {
      label,
      labelEn,
      labelIt,
      minAge: Number(formData.get('minAge')),
      maxAge: Number(formData.get('maxAge')),
      pricePerNight: Number(formData.get('pricePerNight')),
      sortOrder: Number(formData.get('sortOrder') || 0),
    },
  });
  revalidatePath('/admin/child-pricing');
  revalidatePath('/admin/price-seasons');
}

export async function deleteChildPriceRange(formData: FormData) {
  const session = await verifySession();
  const hotelId = session.hotelId;
  if (!hotelId) return;

  const id = Number(formData.get('id'));
  const range = await prisma.childPriceRange.findUnique({ where: { id } });
  if (!range || range.hotelId !== hotelId) return;

  await prisma.childPriceRange.delete({ where: { id } });
  revalidatePath('/admin/child-pricing');
  revalidatePath('/admin/price-seasons');
}

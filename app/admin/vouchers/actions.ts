'use server';

import { prisma } from '@/src/lib/prisma';
import { verifySession } from '@/src/lib/session';
import { revalidatePath } from 'next/cache';
import { autoTranslateFields } from '@/src/lib/translate';

async function buildTranslations(name: string, description: string | null) {
  return autoTranslateFields({ name, description }, null);
}

export async function createVoucherTemplate(formData: FormData) {
  const session = await verifySession();
  if (!session.hotelId) throw new Error('Unauthorized');

  const name = String(formData.get('name'));
  const description = String(formData.get('description') || '') || null;
  const translationsJson = await buildTranslations(name, description);

  await prisma.voucherTemplate.create({
    data: {
      hotelId: session.hotelId,
      name,
      type: String(formData.get('type') || 'value'),
      value: parseFloat(String(formData.get('value'))),
      price: parseFloat(String(formData.get('price'))),
      description,
      validDays: parseInt(String(formData.get('validDays') || '365')),
      isActive: true,
      translationsJson,
    },
  });
  revalidatePath('/admin/vouchers');
}

export async function updateVoucherTemplate(formData: FormData) {
  const session = await verifySession();
  if (!session.hotelId) throw new Error('Unauthorized');

  const name = String(formData.get('name'));
  const description = String(formData.get('description') || '') || null;
  const translationsJson = await buildTranslations(name, description);

  const id = parseInt(String(formData.get('id')));
  await prisma.voucherTemplate.updateMany({
    where: { id, hotelId: session.hotelId },
    data: {
      name,
      type: String(formData.get('type') || 'value'),
      value: parseFloat(String(formData.get('value'))),
      price: parseFloat(String(formData.get('price'))),
      description,
      validDays: parseInt(String(formData.get('validDays') || '365')),
      translationsJson,
    },
  });
  revalidatePath('/admin/vouchers');
}

export async function toggleVoucherTemplate(id: number, isActive: boolean) {
  const session = await verifySession();
  if (!session.hotelId) throw new Error('Unauthorized');

  await prisma.voucherTemplate.updateMany({
    where: { id, hotelId: session.hotelId },
    data: { isActive },
  });
  revalidatePath('/admin/vouchers');
}

export async function deleteVoucherTemplate(id: number) {
  const session = await verifySession();
  if (!session.hotelId) throw new Error('Unauthorized');

  await prisma.voucherTemplate.deleteMany({
    where: { id, hotelId: session.hotelId },
  });
  revalidatePath('/admin/vouchers');
}

export async function cancelVoucher(id: number) {
  const session = await verifySession();
  if (!session.hotelId) throw new Error('Unauthorized');

  await prisma.voucher.updateMany({
    where: { id, hotelId: session.hotelId },
    data: { status: 'cancelled' },
  });
  revalidatePath('/admin/vouchers');
}

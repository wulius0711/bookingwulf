'use server';

import { prisma } from '@/src/lib/prisma';
import { verifySession } from '@/src/lib/session';
import { revalidatePath } from 'next/cache';

export async function createVoucherTemplate(formData: FormData) {
  const session = await verifySession();
  if (!session.hotelId) throw new Error('Unauthorized');

  await prisma.voucherTemplate.create({
    data: {
      hotelId: session.hotelId,
      name: String(formData.get('name')),
      type: String(formData.get('type') || 'value'),
      value: parseFloat(String(formData.get('value'))),
      price: parseFloat(String(formData.get('price'))),
      description: String(formData.get('description') || '') || null,
      validDays: parseInt(String(formData.get('validDays') || '365')),
      isActive: true,
    },
  });
  revalidatePath('/admin/vouchers');
}

export async function updateVoucherTemplate(formData: FormData) {
  const session = await verifySession();
  if (!session.hotelId) throw new Error('Unauthorized');

  const id = parseInt(String(formData.get('id')));
  await prisma.voucherTemplate.updateMany({
    where: { id, hotelId: session.hotelId },
    data: {
      name: String(formData.get('name')),
      type: String(formData.get('type') || 'value'),
      value: parseFloat(String(formData.get('value'))),
      price: parseFloat(String(formData.get('price'))),
      description: String(formData.get('description') || '') || null,
      validDays: parseInt(String(formData.get('validDays') || '365')),
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

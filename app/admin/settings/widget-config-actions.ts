'use server';

import { prisma } from '@/src/lib/prisma';
import { verifySession } from '@/src/lib/session';
import { revalidatePath } from 'next/cache';

export async function getWidgetConfigCount(hotelId: number): Promise<number> {
  return prisma.widgetConfig.count({ where: { hotelId } });
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export async function saveWidgetConfig(formData: FormData) {
  const session = await verifySession();
  const hotelId = Number(formData.get('hotelId'));
  if (!hotelId) return;
  if (session.hotelId !== null && session.hotelId !== hotelId) return;

  const configId = formData.get('configId') ? Number(formData.get('configId')) : null;
  const name = String(formData.get('name') || '').trim();
  if (!name) return;

  const slug = slugify(name);

  const data = {
    name,
    slug,
    showPrices: formData.get('showPrices') === 'on',
    showAmenities: formData.get('showAmenities') === 'on',
    showExtrasStep: formData.get('showExtrasStep') === 'on',
    showPhoneField: formData.get('showPhoneField') === 'on',
    showMessageField: formData.get('showMessageField') === 'on',
    enableImageSlider: formData.get('enableImageSlider') === 'on',
    enableInstantBooking: formData.get('enableInstantBooking') === 'on',
    hideRequestOption: formData.get('hideRequestOption') === 'on',
  };

  if (configId) {
    await prisma.widgetConfig.update({ where: { id: configId }, data });
  } else {
    const count = await prisma.widgetConfig.count({ where: { hotelId } });
    if (count >= 2) return;
    await prisma.widgetConfig.create({ data: { ...data, hotelId } });
  }

  revalidatePath('/admin/settings');
}

export async function deleteWidgetConfig(formData: FormData) {
  const session = await verifySession();
  const id = Number(formData.get('id'));
  if (!id) return;

  const config = await prisma.widgetConfig.findUnique({ where: { id } });
  if (!config) return;
  if (session.hotelId !== null && session.hotelId !== config.hotelId) return;

  await prisma.widgetConfig.delete({ where: { id } });
  revalidatePath('/admin/settings');
}

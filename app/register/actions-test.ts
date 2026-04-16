'use server';

import { prisma } from '@/src/lib/prisma';

export type RegisterState = { error?: string } | undefined;

export async function registerHotelTest(
  _state: RegisterState,
  _formData: FormData,
): Promise<RegisterState> {
  const count = await prisma.hotel.count();
  return { error: `prisma ok — ${count} hotels` };
}

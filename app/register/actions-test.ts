'use server';

import { prisma } from '@/src/lib/prisma';
import { hashPassword } from '@/src/lib/password';
import { PLANS, PlanKey } from '@/src/lib/plans';
import { redirect } from 'next/navigation';

export type RegisterState = { error?: string } | undefined;

export async function registerHotelTest(
  _state: RegisterState,
  _formData: FormData,
): Promise<RegisterState> {
  const count = await prisma.hotel.count();
  const _hash = await hashPassword('test');
  const _plans = Object.keys(PLANS) as PlanKey[];
  if (count < 0) redirect('/'); // never runs
  return { error: `all imports ok — ${count} hotels` };
}

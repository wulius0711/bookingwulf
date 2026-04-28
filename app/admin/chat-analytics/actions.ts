'use server';

import { prisma } from '@/src/lib/prisma';
import { verifySession } from '@/src/lib/session';
import { revalidatePath } from 'next/cache';

export async function deleteChatLog(formData: FormData) {
  const session = await verifySession();
  if (session.role !== 'super_admin') throw new Error('Unauthorized');

  const id = Number(formData.get('id'));
  if (!id) return;

  await prisma.supportChatLog.delete({ where: { id } });
  revalidatePath('/admin/chat-analytics');
}

export async function deleteAllTestLogs() {
  const session = await verifySession();
  if (session.role !== 'super_admin') throw new Error('Unauthorized');

  await prisma.supportChatLog.deleteMany({ where: { isSuperAdmin: true } });
  revalidatePath('/admin/chat-analytics');
}

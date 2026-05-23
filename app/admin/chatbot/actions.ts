'use server';

import { prisma } from '@/src/lib/prisma';
import { verifySession } from '@/src/lib/session';
import { revalidatePath } from 'next/cache';

export async function saveChatbotSettings(formData: FormData) {
  const session = await verifySession();
  if (!session.hotelId) throw new Error('Kein Hotel');

  const name = (formData.get('chatbotName') as string | null)?.trim() || null;
  const color = (formData.get('chatbotColor') as string | null)?.trim() || '#1a1a1a';
  const enabled = formData.get('chatbotEnabled') === 'on';
  const faqRaw = (formData.get('chatbotFaq') as string | null)?.trim() || null;

  let chatbotFaq = null;
  if (faqRaw) {
    try {
      chatbotFaq = JSON.parse(faqRaw);
    } catch {
      // invalid JSON — ignore
    }
  }

  await prisma.hotel.update({
    where: { id: session.hotelId },
    data: { chatbotEnabled: enabled, chatbotName: name, chatbotColor: color, chatbotFaq },
  });

  revalidatePath('/admin/chatbot');
}

export async function scrapeWebsite(formData: FormData) {
  const session = await verifySession();
  if (!session.hotelId) throw new Error('Kein Hotel');

  const url = (formData.get('chatbotSourceUrl') as string | null)?.trim();
  if (!url) throw new Error('URL fehlt');

  const res = await fetch(`https://r.jina.ai/${url}`, {
    headers: { Accept: 'text/plain' },
    signal: AbortSignal.timeout(30_000),
  });
  if (!res.ok) throw new Error(`Jina: ${res.status}`);

  const context = await res.text();

  await prisma.hotel.update({
    where: { id: session.hotelId },
    data: {
      chatbotContext: context,
      chatbotSourceUrl: url,
      chatbotScrapedAt: new Date(),
    },
  });

  revalidatePath('/admin/chatbot');
}

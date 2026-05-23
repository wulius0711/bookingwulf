import { NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { autoTranslateFields } from '@/src/lib/translate';

export async function POST() {
  const templates = await prisma.voucherTemplate.findMany({
    where: { translationsJson: null },
    select: { id: true, name: true, description: true },
  });

  const results = [];
  for (const t of templates) {
    const translationsJson = await autoTranslateFields({ name: t.name, description: t.description }, null);
    await prisma.voucherTemplate.update({ where: { id: t.id }, data: { translationsJson } });
    results.push({ id: t.id, name: t.name });
  }

  return NextResponse.json({ total: templates.length, results });
}

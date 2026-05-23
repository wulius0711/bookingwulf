import { NextResponse } from 'next/server';
import { Prisma } from '@/src/generated/prisma';
import { prisma } from '@/src/lib/prisma';
import { verifySession } from '@/src/lib/session';
import { autoTranslateFields, translateList } from '@/src/lib/translate';

export const maxDuration = 60;

export async function POST() {
  const session = await verifySession();
  if (session.role !== 'super_admin') {
    return NextResponse.json({ error: 'Nur für Super-Admins.' }, { status: 403 });
  }

  const apartments = await prisma.apartment.findMany({
    where: {
      translationsJson: { equals: Prisma.DbNull },
      OR: [{ description: { not: null } }, { amenities: { isEmpty: false } }],
    },
    select: { id: true, description: true, amenities: true },
  });

  const results: { id: number; ok: boolean }[] = [];

  for (const apt of apartments) {
    try {
      const descTrans = await autoTranslateFields({ description: apt.description || null }, null);
      const translationsJson: Record<string, { description?: string; amenities?: string[] }> = {};
      for (const lang of ['en', 'it']) {
        translationsJson[lang] = { description: descTrans[lang]?.description };
        if (apt.amenities.length) {
          translationsJson[lang].amenities = await translateList(apt.amenities, lang);
        }
      }
      await prisma.apartment.update({ where: { id: apt.id }, data: { translationsJson } });
      results.push({ id: apt.id, ok: true });
    } catch {
      results.push({ id: apt.id, ok: false });
    }
  }

  return NextResponse.json({ total: apartments.length, results });
}

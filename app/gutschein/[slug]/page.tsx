import { prisma } from '@/src/lib/prisma';
import { notFound } from 'next/navigation';
import VoucherShop from './VoucherShop';

export const dynamic = 'force-dynamic';

export default async function VoucherShopPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ lang?: string }> }) {
  const { slug } = await params;
  const { lang = 'de' } = await searchParams;

  const hotel = await prisma.hotel.findUnique({
    where: { slug },
    select: { id: true, name: true, accentColor: true, email: true },
  });

  if (!hotel) return notFound();

  const templates = await prisma.voucherTemplate.findMany({
    where: { hotelId: hotel.id, isActive: true },
    orderBy: { price: 'asc' },
  });

  if (templates.length === 0) return notFound();

  return (
    <VoucherShop
      lang={lang}
      hotel={{ slug, name: hotel.name, accentColor: hotel.accentColor || '#111827' }}
      templates={templates.map((t) => ({
        id: t.id,
        name: t.name,
        type: t.type,
        value: Number(t.value),
        price: Number(t.price),
        description: t.description,
        imageUrl: t.imageUrl,
        validDays: t.validDays,
      }))}
    />
  );
}

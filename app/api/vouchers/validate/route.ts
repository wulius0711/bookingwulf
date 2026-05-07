import { NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';

function normalizeCode(raw: string): string {
  const stripped = raw.toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (stripped.length === 12) {
    return `${stripped.slice(0, 4)}-${stripped.slice(4, 8)}-${stripped.slice(8, 12)}`;
  }
  return raw.trim().toUpperCase();
}

export async function POST(req: Request) {
  try {
    const { code, hotelSlug } = await req.json();
    if (!code || !hotelSlug) {
      return NextResponse.json({ valid: false, error: 'Code fehlt.' });
    }

    const hotel = await prisma.hotel.findUnique({
      where: { slug: hotelSlug },
      select: { id: true },
    });
    if (!hotel) return NextResponse.json({ valid: false, error: 'Hotel nicht gefunden.' });

    const voucher = await prisma.voucher.findFirst({
      where: {
        code: normalizeCode(code),
        hotelId: hotel.id,
        status: 'active',
        type: 'value',
        expiresAt: { gt: new Date() },
      },
      select: { id: true, code: true, value: true },
    });

    if (!voucher) {
      return NextResponse.json({ valid: false, error: 'Gutschein nicht gefunden oder bereits eingelöst.' });
    }

    return NextResponse.json({
      valid: true,
      voucher: { id: voucher.id, code: voucher.code, value: Number(voucher.value) },
    });
  } catch (e) {
    console.error('[vouchers/validate]', e);
    return NextResponse.json({ valid: false, error: 'Interner Fehler.' });
  }
}

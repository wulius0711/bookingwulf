import { NextRequest } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { verifySession } from '@/src/lib/session';

type ApartmentEntry = { apartmentId: number; apartmentName: string; totalPrice: number; cleaningFee: number };
type ExtraEntry = { key: string; name: string; type: string; subtotal: number };

type PricingSnapshot = {
  apartments: ApartmentEntry[];
  extrasTotal: number;
  ortstaxeTotal: number;
  total: number;
};

function esc(val: string | number | null | undefined): string {
  const s = val == null ? '' : String(val);
  if (s.includes(';') || s.includes('"') || s.includes('\n')) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

function fmtDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function fmtNum(n: number): string {
  return n.toFixed(2).replace('.', ',');
}

export async function GET(req: NextRequest) {
  const session = await verifySession().catch(() => null);
  if (!session) return new Response('Unauthorized', { status: 401 });

  const { searchParams } = req.nextUrl;
  const from = searchParams.get('from');
  const to = searchParams.get('to');
  const includeCancelled = searchParams.get('cancelled') === '1';

  if (!from || !to) {
    return new Response('from und to Parameter erforderlich (YYYY-MM-DD)', { status: 400 });
  }

  const fromDate = new Date(from + 'T00:00:00.000Z');
  const toDate = new Date(to + 'T23:59:59.999Z');

  if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
    return new Response('Ungültiges Datumsformat', { status: 400 });
  }

  const statusFilter = includeCancelled
    ? { in: ['booked', 'cancelled'] }
    : { equals: 'booked' };

  const requests = await prisma.request.findMany({
    where: {
      ...(session.hotelId !== null ? { hotelId: session.hotelId } : {}),
      departure: { gte: fromDate, lte: toDate },
      status: statusFilter,
    },
    include: {
      hotel: {
        select: {
          name: true,
          settings: { select: { taxRateRoom: true, taxRateCleaning: true } },
        },
      },
    },
    orderBy: { departure: 'asc' },
  });

  const headers = [
    'Buchungsnr',
    'Buchungsdatum',
    'Anreise',
    'Abreise',
    'Nächte',
    'Anrede',
    'Vorname',
    'Nachname',
    'E-Mail',
    'Land',
    'Erwachsene',
    'Kinder',
    'Apartment(s)',
    'Zimmerpreis brutto',
    'Zimmerpreis netto',
    'MwSt Zimmer %',
    'MwSt Zimmer €',
    'Reinigung brutto',
    'Reinigung netto',
    'MwSt Reinigung %',
    'MwSt Reinigung €',
    'Extras brutto',
    'Ortstaxe',
    'Gesamtbetrag',
    'Status',
    'Hotel',
  ];

  const rows: string[] = [headers.join(';')];

  for (const r of requests) {
    const pricing = r.pricingJson as PricingSnapshot | null;
    const extras = (r.extrasJson as ExtraEntry[] | null) ?? [];

    const taxRateRoom = Number(r.hotel?.settings?.taxRateRoom ?? 0);
    const taxRateCleaning = Number(r.hotel?.settings?.taxRateCleaning ?? 0);

    const apartments = pricing?.apartments ?? [];
    const ortstaxeTotal = pricing?.ortstaxeTotal ?? 0;
    const total = pricing?.total ?? 0;

    const roomPriceGross = apartments.reduce((s, a) => s + (a.totalPrice - a.cleaningFee), 0);
    const cleaningGross = apartments.reduce((s, a) => s + a.cleaningFee, 0);
    const extrasGross = extras.reduce((s, e) => s + (e.subtotal ?? 0), 0);

    const roomNetto = taxRateRoom > 0 ? roomPriceGross / (1 + taxRateRoom / 100) : roomPriceGross;
    const roomTax = roomPriceGross - roomNetto;

    const cleaningNetto = taxRateCleaning > 0 ? cleaningGross / (1 + taxRateCleaning / 100) : cleaningGross;
    const cleaningTax = cleaningGross - cleaningNetto;

    const apartmentNames = apartments.map(a => a.apartmentName).join(', ')
      || r.selectedApartmentIds;

    const row = [
      r.id,
      fmtDate(r.createdAt),
      fmtDate(r.arrival),
      fmtDate(r.departure),
      r.nights,
      r.salutation,
      r.firstname ?? '',
      r.lastname,
      r.email,
      r.country,
      r.adults,
      r.children,
      apartmentNames,
      fmtNum(roomPriceGross),
      fmtNum(roomNetto),
      taxRateRoom > 0 ? fmtNum(taxRateRoom) : '',
      taxRateRoom > 0 ? fmtNum(roomTax) : '',
      fmtNum(cleaningGross),
      fmtNum(cleaningNetto),
      taxRateCleaning > 0 ? fmtNum(taxRateCleaning) : '',
      taxRateCleaning > 0 ? fmtNum(cleaningTax) : '',
      fmtNum(extrasGross),
      fmtNum(ortstaxeTotal),
      fmtNum(total),
      r.status,
      r.hotel?.name ?? '',
    ].map(esc).join(';');

    rows.push(row);
  }

  const csv = '﻿' + rows.join('\r\n'); // BOM for Excel UTF-8
  const filename = `buchungen_${from}_${to}.csv`;

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}

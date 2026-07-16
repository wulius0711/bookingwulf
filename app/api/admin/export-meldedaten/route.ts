import { NextRequest } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { verifySession } from '@/src/lib/session';

type CheckinGuest = {
  type?: 'adult' | 'child';
  firstname?: string;
  lastname?: string;
  birthdate?: string;
  nationality?: string;
  docNumber?: string;
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

export async function GET(req: NextRequest) {
  const session = await verifySession().catch(() => null);
  if (!session) return new Response('Unauthorized', { status: 401 });

  const { searchParams } = req.nextUrl;
  const from = searchParams.get('from');
  const to = searchParams.get('to');

  if (!from || !to) {
    return new Response('from und to Parameter erforderlich (YYYY-MM-DD)', { status: 400 });
  }

  const fromDate = new Date(from + 'T00:00:00.000Z');
  const toDate = new Date(to + 'T23:59:59.999Z');

  if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
    return new Response('Ungültiges Datumsformat', { status: 400 });
  }

  const requests = await prisma.request.findMany({
    where: {
      ...(session.hotelId !== null ? { hotelId: session.hotelId } : {}),
      arrival: { gte: fromDate, lte: toDate },
      status: 'booked',
      checkinCompletedAt: { not: null },
    },
    include: {
      hotel: { select: { name: true } },
    },
    orderBy: { arrival: 'asc' },
  });

  const headers = [
    'Buchungsnr',
    'Anreise',
    'Abreise',
    'Vorname',
    'Nachname',
    'Gasttyp',
    'Geburtsdatum',
    'Nationalität',
    'Ausweis-/Reisepassnr.',
    'Straße',
    'PLZ',
    'Ort',
    'Herkunftsland',
    'Hotel',
  ];

  const rows: string[] = [headers.join(';')];

  for (const r of requests) {
    const guests = Array.isArray(r.checkinGuestsJson) ? (r.checkinGuestsJson as CheckinGuest[]) : [];
    const guestRows = guests.length > 0
      ? guests
      : [{ firstname: r.firstname ?? '', lastname: r.lastname, type: 'adult' as const, birthdate: r.checkinBirthdate ?? '', nationality: r.checkinNationality ?? '', docNumber: r.checkinDocNumber ?? '' }];

    for (const g of guestRows) {
      const row = [
        r.id,
        fmtDate(r.arrival),
        fmtDate(r.departure),
        g.firstname ?? '',
        g.lastname ?? '',
        g.type === 'child' ? 'Kind' : 'Erwachsen',
        g.birthdate ?? '',
        g.nationality ?? '',
        g.docNumber ?? '',
        r.street ?? '',
        r.zip ?? '',
        r.city ?? '',
        r.country,
        r.hotel?.name ?? '',
      ].map(esc).join(';');

      rows.push(row);
    }
  }

  const csv = '﻿' + rows.join('\r\n'); // BOM for Excel UTF-8
  const filename = `meldedaten_${from}_${to}.csv`;

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}

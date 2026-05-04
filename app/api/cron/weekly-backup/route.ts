import { NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { getResend, getFromEmail } from '@/src/lib/email';

function escCsv(val: unknown): string {
  if (val === null || val === undefined) return '';
  const s = String(val);
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function toDate(d: Date) {
  return new Intl.DateTimeFormat('de-AT', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(d);
}

export async function GET(req: Request) {
  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const hotels = await prisma.hotel.findMany({
    where: { isActive: true },
    select: { id: true, name: true, email: true },
  });

  let sent = 0;

  for (const hotel of hotels) {
    if (!hotel.email) continue;

    const requests = await prisma.request.findMany({
      where: { hotelId: hotel.id },
      orderBy: { arrival: 'desc' },
      select: {
        id: true, createdAt: true, status: true,
        arrival: true, departure: true, nights: true,
        adults: true, children: true,
        salutation: true, firstname: true, lastname: true,
        email: true, country: true,
        paymentMethod: true, pricingJson: true,
        selectedApartmentIds: true,
      },
    });

    const header = [
      'ID', 'Erstellt', 'Status',
      'Anreise', 'Abreise', 'Nächte',
      'Erwachsene', 'Kinder',
      'Anrede', 'Vorname', 'Nachname',
      'E-Mail', 'Land',
      'Zahlungsart', 'Gesamtbetrag (€)',
    ].join(',');

    const rows = requests.map(r => {
      const pricing = r.pricingJson as { total?: number } | null;
      return [
        r.id, toDate(r.createdAt), r.status,
        toDate(r.arrival), toDate(r.departure), r.nights,
        r.adults, r.children,
        r.salutation, r.firstname ?? '', r.lastname,
        r.email, r.country,
        r.paymentMethod ?? '', pricing?.total ?? '',
      ].map(escCsv).join(',');
    });

    const csv = [header, ...rows].join('\n');
    const date = new Intl.DateTimeFormat('de-AT', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date());

    try {
      const resend = getResend();
      if (resend) {
        await resend.emails.send({
          from: getFromEmail(),
          to: hotel.email,
          subject: `Datensicherung ${hotel.name} — ${date}`,
          text: `Anbei die wöchentliche Datensicherung aller Buchungen für ${hotel.name} (${requests.length} Einträge, Stand ${date}).`,
          attachments: [{
            filename: `buchungen-${hotel.name.toLowerCase().replace(/\s+/g, '-')}-${date.replace(/\./g, '-')}.csv`,
            content: Buffer.from('﻿' + csv).toString('base64'), // BOM for Excel UTF-8
          }],
        });
        sent++;
      }
    } catch (e) {
      console.error(`[weekly-backup] Error for hotel ${hotel.id}:`, e);
    }
  }

  console.log(`[weekly-backup] Sent ${sent} backup(s).`);
  return NextResponse.json({ ok: true, sent });
}

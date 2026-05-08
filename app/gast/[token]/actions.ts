'use server';

import { prisma } from '@/src/lib/prisma';
import { getResend, getFromEmail, buildEmailHtml, buildInfoBlock } from '@/src/lib/email';
import { revalidatePath } from 'next/cache';

async function getRequest(token: string) {
  const request = await prisma.request.findUnique({
    where: { checkinToken: token },
    include: { hotel: { select: { name: true, email: true, accentColor: true } } },
  });
  if (!request) throw new Error('Buchung nicht gefunden');
  return request;
}

export async function sendGuestMessage(token: string, body: string) {
  const trimmed = body.trim();
  if (!trimmed || trimmed.length > 2000) throw new Error('Ungültige Nachricht');

  const request = await getRequest(token);

  await prisma.requestMessage.create({
    data: { requestId: request.id, sender: 'guest', body: trimmed },
  });

  // Notify hotel
  try {
    const resend = getResend();
    if (resend && request.hotel?.email) {
      const accent = request.hotel.accentColor || '#111827';
      await resend.emails.send({
        from: getFromEmail(),
        to: request.hotel.email,
        subject: `Neue Gästenachricht — Buchung #${request.id}`,
        html: buildEmailHtml({
          hotelName: request.hotel.name,
          accentColor: accent,
          title: 'Neue Nachricht von Ihrem Gast',
          body: `
            ${buildInfoBlock('Gast', `${request.firstname ?? ''} ${request.lastname}`.trim())}
            ${buildInfoBlock('Buchung #', String(request.id))}
            ${buildInfoBlock('Nachricht', trimmed.replace(/\n/g, '<br/>'))}
          `,
        }),
      });
    }
  } catch {
    // Email error must not block message delivery
  }

  revalidatePath(`/gast/${token}`);
}

export async function requestCheckout(token: string) {
  const request = await getRequest(token);

  if (request.checkoutRequestedAt) return;

  await prisma.request.update({
    where: { id: request.id },
    data: { checkoutRequestedAt: new Date() },
  });

  try {
    const resend = getResend();
    if (resend && request.hotel?.email) {
      const accent = request.hotel.accentColor || '#111827';
      const fmtDate = (d: Date) =>
        new Intl.DateTimeFormat('de-AT', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(d);

      await resend.emails.send({
        from: getFromEmail(),
        to: request.hotel.email,
        subject: `Check-Out Anfrage — Buchung #${request.id}`,
        html: buildEmailHtml({
          hotelName: request.hotel.name,
          accentColor: accent,
          title: 'Ihr Gast möchte auschecken',
          body: `
            ${buildInfoBlock('Gast', `${request.firstname ?? ''} ${request.lastname}`.trim())}
            ${buildInfoBlock('Abreise', fmtDate(request.departure))}
            ${buildInfoBlock('Check-Out angefragt', fmtDate(new Date()))}
          `,
        }),
      });
    }
  } catch {
    // Email error must not block checkout
  }

  revalidatePath(`/gast/${token}`);
}

export async function bookExtra(token: string, extraId: number) {
  const request = await getRequest(token);

  const extra = await prisma.hotelExtra.findFirst({
    where: { id: extraId, hotelId: request.hotelId!, isActive: true },
    select: { id: true, key: true, name: true, price: true, billingType: true, exclusiveGroup: true },
  });
  if (!extra) throw new Error('Zusatzleistung nicht gefunden');

  let existing = Array.isArray(request.extrasJson)
    ? (request.extrasJson as { key: string; name: string; price: number; total: number }[])
    : [];

  if (existing.some((e) => e.key === extra.key)) return;

  // Remove any other extras in the same exclusive group
  if (extra.exclusiveGroup) {
    const groupKeys = await prisma.hotelExtra.findMany({
      where: { hotelId: request.hotelId!, exclusiveGroup: extra.exclusiveGroup },
      select: { key: true },
    });
    const groupKeySet = new Set(groupKeys.map((g) => g.key));
    existing = existing.filter((e) => !groupKeySet.has(e.key));
  }

  const price = Number(extra.price);
  const updated = [...existing, { key: extra.key, name: extra.name, price, billingType: extra.billingType, total: price }];
  const isFirstUpsell = !request.upsellNotifiedAt;

  await prisma.request.update({
    where: { id: request.id },
    data: {
      extrasJson: updated,
      ...(isFirstUpsell ? { upsellNotifiedAt: new Date() } : {}),
    },
  });

  // One-time notification to hotel
  if (isFirstUpsell) {
    try {
      const resend = getResend();
      if (resend && request.hotel?.email) {
        const fmt = (n: number) => new Intl.NumberFormat('de-AT', { style: 'currency', currency: 'EUR' }).format(n);
        const extrasList = updated.map(e => `${e.name}: ${fmt(e.total)}`).join('<br/>');
        const total = updated.reduce((s, e) => s + e.total, 0);
        await resend.emails.send({
          from: getFromEmail(),
          to: request.hotel.email,
          subject: `Nachgebuchte Extras — Buchung #${request.id}`,
          html: buildEmailHtml({
            hotelName: request.hotel.name,
            accentColor: request.hotel.accentColor || '#111827',
            title: 'Gast hat Extras nachgebucht',
            body: `
              ${buildInfoBlock('Gast', `${request.firstname ?? ''} ${request.lastname}`.trim())}
              ${buildInfoBlock('Buchung #', String(request.id))}
              ${buildInfoBlock('Extras', extrasList)}
              ${buildInfoBlock('Offener Betrag', `<strong>${fmt(total)}</strong>`)}
            `,
          }),
        });
      }
    } catch {
      // Email error must not block the booking
    }
  }

  revalidatePath(`/gast/${token}`);
}

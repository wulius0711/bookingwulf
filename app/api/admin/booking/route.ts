'use server';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { verifySession } from '@/src/lib/session';
import { getResend, getFromEmail, buildEmailHtml, buildInfoBlock } from '@/src/lib/email';
import { getEmailTranslations } from '@/src/lib/email-i18n';

export async function POST(req: NextRequest) {
  try {
    const session = await verifySession();
    const { apartmentId, arrival, departure, adults, children, salutation, firstname, lastname, email, status, message } = await req.json();

    if (!apartmentId || !arrival || !departure || !lastname || !email) return NextResponse.json({ error: 'Pflichtfelder fehlen' }, { status: 400 });

    const arr = new Date(arrival);
    const dep = new Date(departure);
    if (dep <= arr) return NextResponse.json({ error: 'Abreise muss nach Anreise liegen' }, { status: 400 });

    let hotelData: { name: string; email: string | null; accentColor: string | null; emailTemplates: { type: string; subject: string; greeting: string | null; body: string; signoff: string | null }[] } | null = null;
    if (session.hotelId !== null) {
      const apt = await prisma.apartment.findUnique({
        where: { id: apartmentId },
        select: {
          hotelId: true,
          hotel: {
            select: {
              name: true, email: true, accentColor: true,
              emailTemplates: { select: { type: true, subject: true, greeting: true, body: true, signoff: true } },
            },
          },
        },
      });
      if (!apt || apt.hotelId !== session.hotelId) return NextResponse.json({ error: 'Zugriff verweigert' }, { status: 403 });
      hotelData = apt.hotel;
    }

    const nights = Math.round((dep.getTime() - arr.getTime()) / 86400000);

    const created = await prisma.request.create({
      data: {
        hotelId: session.hotelId,
        arrival: arr,
        departure: dep,
        nights,
        adults: Number(adults) || 2,
        children: Number(children) || 0,
        selectedApartmentIds: String(apartmentId),
        salutation: salutation || 'Herr',
        firstname: firstname || null,
        lastname,
        email,
        country: 'AT',
        message: message || null,
        status: status || 'booked',
      },
    });

    if ((status || 'booked') === 'booked') {
      await prisma.blockedRange.create({
        data: {
          apartmentId,
          startDate: arr,
          endDate: dep,
          type: 'booking',
          note: `Buchung #${created.id} — ${firstname || ''} ${lastname}`,
        },
      });
    }

    // Guest confirmation email (non-blocking)
    if (hotelData && email && (status || 'booked') === 'booked') {
      try {
        const resend = getResend();
        if (resend) {
          const i18n = getEmailTranslations('de');
          const fmtDate = (d: Date) => new Intl.DateTimeFormat('de-AT', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(d);
          const tpl = hotelData.emailTemplates.find(t => t.type === 'booking_guest');
          const fillTpl = (s: string) => s
            .replaceAll('{{guestName}}', firstname || '')
            .replaceAll('{{guestLastName}}', lastname)
            .replaceAll('{{hotelName}}', hotelData!.name)
            .replaceAll('{{arrival}}', fmtDate(arr))
            .replaceAll('{{departure}}', fmtDate(dep))
            .replaceAll('{{nights}}', String(nights))
            .replaceAll('{{bookingId}}', String(created.id));
          await resend.emails.send({
            from: getFromEmail(),
            to: email,
            subject: tpl ? fillTpl(tpl.subject) : i18n.bookingSubject(hotelData.name),
            html: buildEmailHtml({
              hotelName: hotelData.name,
              accentColor: hotelData.accentColor || undefined,
              title: i18n.bookingTitle,
              body: `
                <p style="font-size:15px;color:#374151;line-height:1.6;margin:0 0 20px;">
                  ${tpl?.greeting ? fillTpl(tpl.greeting) : i18n.greeting(firstname || '')}<br/><br/>
                  ${tpl?.body ? fillTpl(tpl.body) : i18n.bookingBody}
                </p>
                ${buildInfoBlock(i18n.period, `${fmtDate(arr)} — ${fmtDate(dep)} (${i18n.nights(nights)})`)}
                ${buildInfoBlock(i18n.guests, i18n.adults(Number(adults) || 2) + (children ? i18n.children(Number(children)) : ''))}
                <p style="font-size:15px;color:#374151;line-height:1.6;margin:24px 0 0;">${tpl?.signoff ? fillTpl(tpl.signoff) : i18n.signoff},<br/><strong>${hotelData.name}</strong></p>
              `,
              footer: `<p style="margin:0;font-size:12px;color:#6b7280;">Buchungs-ID: #${created.id}</p>`,
            }),
          });
        }
      } catch (emailErr) {
        console.error('[AdminBooking] guest email failed:', emailErr);
      }
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Fehler beim Speichern' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await verifySession();
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: 'ID fehlt' }, { status: 400 });
    if (session.hotelId !== null) {
      const r = await prisma.request.findUnique({ where: { id }, select: { hotelId: true } });
      if (!r || r.hotelId !== session.hotelId) return NextResponse.json({ error: 'Zugriff verweigert' }, { status: 403 });
    }
    await prisma.request.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Fehler beim Löschen' }, { status: 500 });
  }
}

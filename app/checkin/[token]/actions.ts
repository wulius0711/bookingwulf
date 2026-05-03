'use server';

import { prisma } from '@/src/lib/prisma';
import { getResend, getFromEmail, buildEmailHtml, buildInfoBlock, buildDivider } from '@/src/lib/email';
import { redirect } from 'next/navigation';

export async function submitCheckin(formData: FormData) {
  const token = String(formData.get('token') || '').trim();
  const arrivalTime = String(formData.get('arrivalTime') || '').trim();
  const notes = String(formData.get('notes') || '').trim();
  const birthdate = String(formData.get('birthdate') || '').trim();
  const nationality = String(formData.get('nationality') || '').trim();
  const docNumber = String(formData.get('docNumber') || '').trim();

  if (!token || !arrivalTime) redirect(`/checkin/${token}`);

  const request = await prisma.request.findUnique({
    where: { checkinToken: token },
    select: {
      id: true,
      checkinCompletedAt: true,
      firstname: true,
      lastname: true,
      arrival: true,
      departure: true,
      nights: true,
      adults: true,
      children: true,
      hotelId: true,
      hotel: { select: { name: true, accentColor: true, email: true } },
    },
  });

  if (!request || request.checkinCompletedAt) redirect(`/checkin/${token}`);

  await prisma.request.update({
    where: { id: request.id },
    data: {
      checkinCompletedAt: new Date(),
      checkinArrivalTime: arrivalTime,
      checkinNotes: notes || null,
      checkinBirthdate: birthdate || null,
      checkinNationality: nationality || null,
      checkinDocNumber: docNumber || null,
    },
  });

  // Send hotel notification
  try {
    const resend = getResend();
    const hotelEmail = request.hotel?.email || process.env.BOOKING_RECEIVER_EMAIL;
    if (resend && hotelEmail) {
      const hotelName = request.hotel?.name || 'Hotel';
      const accent = request.hotel?.accentColor || '#111827';
      const fmtDate = (d: Date) =>
        new Intl.DateTimeFormat('de-AT', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(d));

      await resend.emails.send({
        from: getFromEmail(),
        to: hotelEmail,
        subject: `Online Check-in abgeschlossen — ${request.firstname || ''} ${request.lastname} (Buchung #${request.id})`,
        html: buildEmailHtml({
          hotelName,
          accentColor: accent,
          title: 'Online Check-in abgeschlossen',
          preheader: `${request.firstname || ''} ${request.lastname} hat eingecheckt — Ankunft: ${arrivalTime}`,
          body: `
            <p style="font-size:15px;color:#374151;line-height:1.6;margin:0 0 20px;">
              Gast <strong>${request.firstname || ''} ${request.lastname}</strong> hat den Online Check-in für Buchung <strong>#${request.id}</strong> abgeschlossen.
            </p>
            ${buildDivider()}
            ${buildInfoBlock('Zeitraum', `${fmtDate(request.arrival)} — ${fmtDate(request.departure)} (${request.nights} Nächte)`)}
            ${buildInfoBlock('Personen', `${request.adults} Erwachsene${request.children ? `, ${request.children} Kinder` : ''}`)}
            ${buildInfoBlock('Geplante Ankunft', arrivalTime)}
            ${buildDivider()}
            <div style="font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:12px;">Meldedaten (Meldegesetz)</div>
            ${buildInfoBlock('Name', [request.salutation, request.firstname, request.lastname].filter(Boolean).join(' '))}
            ${birthdate ? buildInfoBlock('Geburtsdatum', birthdate) : ''}
            ${nationality ? buildInfoBlock('Staatsangehörigkeit', nationality) : ''}
            ${request.country ? buildInfoBlock('Herkunftsland', request.country) : ''}
            ${docNumber ? buildInfoBlock('Ausweis-/Reisepassnr.', docNumber) : ''}
            ${notes ? `${buildDivider()}${buildInfoBlock('Besondere Wünsche', notes)}` : ''}
          `,
          footer: `<p style="margin:0;font-size:12px;color:#6b7280;">Buchungs-ID: #${request.id}</p>`,
        }),
      });
    }
  } catch (e) {
    console.error('[checkin] Hotel notification failed:', e);
  }

  redirect(`/checkin/${token}`);
}

'use server';

import { prisma } from '@/src/lib/prisma';
import { getResend, getFromEmail, buildEmailHtml, buildInfoBlock, buildDivider } from '@/src/lib/email';
import { redirect } from 'next/navigation';

type CheckinGuest = {
  type: 'adult' | 'child';
  firstname: string;
  lastname: string;
  birthdate: string;
  nationality: string;
  docNumber?: string;
};

export async function submitCheckin(formData: FormData) {
  const token = String(formData.get('token') || '').trim();
  const arrivalTime = String(formData.get('arrivalTime') || '').trim();
  const notes = String(formData.get('notes') || '').trim();

  if (!token || !arrivalTime) redirect(`/checkin/${token}`);

  const request = await prisma.request.findUnique({
    where: { checkinToken: token },
    select: {
      id: true,
      checkinCompletedAt: true,
      salutation: true,
      firstname: true,
      lastname: true,
      country: true,
      arrival: true,
      departure: true,
      nights: true,
      adults: true,
      children: true,
      guestsJson: true,
      hotelId: true,
      hotel: { select: { name: true, accentColor: true, email: true } },
    },
  });

  if (!request || request.checkinCompletedAt) redirect(`/checkin/${token}`);

  // Build guest list from form: primary guest + additional guests from guestsJson
  type AdditionalGuest = { type: 'adult' | 'child'; firstname: string; lastname: string; birthday?: string };
  const additionalGuests: AdditionalGuest[] = Array.isArray(request.guestsJson)
    ? (request.guestsJson as AdditionalGuest[])
    : [];

  const allGuests = [
    { type: 'adult' as const, firstname: request.firstname ?? '', lastname: request.lastname, birthday: undefined },
    ...additionalGuests,
  ];

  const checkinGuests: CheckinGuest[] = allGuests.map((g, i) => ({
    type: g.type,
    firstname: g.firstname,
    lastname: g.lastname,
    birthdate: String(formData.get(`g${i}_birthdate`) || g.birthday || '').trim(),
    nationality: String(formData.get(`g${i}_nationality`) || '').trim(),
    ...(g.type === 'adult' ? { docNumber: String(formData.get(`g${i}_docnumber`) || '').trim() } : {}),
  }));

  const primary = checkinGuests[0];

  await prisma.request.update({
    where: { id: request.id },
    data: {
      checkinCompletedAt: new Date(),
      checkinArrivalTime: arrivalTime,
      checkinNotes: notes || null,
      checkinBirthdate: primary?.birthdate || null,
      checkinNationality: primary?.nationality || null,
      checkinDocNumber: primary?.docNumber || null,
      checkinGuestsJson: checkinGuests,
    },
  });

  try {
    const resend = getResend();
    const hotelEmail = request.hotel?.email || process.env.BOOKING_RECEIVER_EMAIL;
    if (resend && hotelEmail) {
      const hotelName = request.hotel?.name || 'Hotel';
      const accent = request.hotel?.accentColor || '#111827';
      const fmtDate = (d: Date) =>
        new Intl.DateTimeFormat('de-AT', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(d));

      const guestsHtml = checkinGuests.map((g, i) => {
        const label = i === 0 ? 'Hauptgast' : g.type === 'child' ? `Kind ${i}` : `Gast ${i + 1}`;
        return `
          <div style="margin-bottom:14px;">
            <div style="font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px;">${label}</div>
            ${buildInfoBlock('Name', `${g.firstname} ${g.lastname}`.trim())}
            ${g.birthdate ? buildInfoBlock('Geburtsdatum', g.birthdate) : ''}
            ${g.nationality ? buildInfoBlock('Staatsangehörigkeit', g.nationality) : ''}
            ${g.docNumber ? buildInfoBlock('Ausweis-/Reisepassnr.', g.docNumber) : ''}
          </div>
        `;
      }).join('');

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
            ${guestsHtml}
            ${request.country ? buildInfoBlock('Herkunftsland', request.country) : ''}
            ${notes ? `${buildDivider()}${buildInfoBlock('Besondere Wünsche', notes)}` : ''}
          `,
          footer: `<p style="margin:0;font-size:12px;color:#6b7280;">Buchungs-ID: #${request.id}</p>`,
        }),
      });
    }
  } catch (e) {
    console.error('[checkin] Hotel notification failed:', e);
  }

  redirect(`/gast/${token}`);
}

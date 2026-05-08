import { prisma } from '@/src/lib/prisma';
import { notFound } from 'next/navigation';
import { submitCheckin } from './actions';

type Props = { params: Promise<{ token: string }> };

export const dynamic = 'force-dynamic';

type AdditionalGuest = { type: 'adult' | 'child'; firstname: string; lastname: string; birthday?: string };

export default async function CheckinPage({ params }: Props) {
  const { token } = await params;

  const request = await prisma.request.findUnique({
    where: { checkinToken: token },
    select: {
      id: true,
      firstname: true,
      lastname: true,
      arrival: true,
      departure: true,
      nights: true,
      adults: true,
      children: true,
      checkinCompletedAt: true,
      checkinArrivalTime: true,
      checkinNationality: true,
      guestsJson: true,
      hotelId: true,
      hotel: { select: { name: true, accentColor: true } },
    },
  });

  if (!request) notFound();

  const settings = request.hotelId
    ? await prisma.hotelSettings.findUnique({
        where: { hotelId: request.hotelId },
        select: { houseRules: true, preArrivalEnabled: true },
      })
    : null;

  if (!settings?.preArrivalEnabled) notFound();

  const accent = request.hotel?.accentColor || '#111827';
  const hotelName = request.hotel?.name || 'Hotel';

  function hexLuminance(hex: string): number {
    const c = hex.replace('#', '');
    const r = parseInt(c.slice(0, 2), 16) / 255;
    const g = parseInt(c.slice(2, 4), 16) / 255;
    const b = parseInt(c.slice(4, 6), 16) / 255;
    const toLinear = (v: number) => v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
  }
  const checkmarkColor = hexLuminance(accent) > 0.4 ? '#111827' : '#ffffff';

  const fmtDate = (d: Date) =>
    new Intl.DateTimeFormat('de-AT', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(d));

  const completed = !!request.checkinCompletedAt;

  // Build guest list: primary guest first, then additional guests from guestsJson
  const additionalGuests: AdditionalGuest[] = Array.isArray(request.guestsJson)
    ? (request.guestsJson as AdditionalGuest[])
    : [];

  const guests = [
    { type: 'adult' as const, firstname: request.firstname ?? '', lastname: request.lastname, birthday: undefined as string | undefined, isPrimary: true },
    ...additionalGuests.map((g) => ({ ...g, isPrimary: false })),
  ];

  return (
    <html lang="de">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Online Check-in — {hotelName}</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <style>{`
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: Inter, ui-sans-serif, system-ui, sans-serif; background: #f5f7fa; color: #111827; min-height: 100vh; }
          .wrap { max-width: 520px; margin: 0 auto; padding: 32px 16px 64px; }
          .card { background: #fff; border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.08); overflow: hidden; }
          .card-header { padding: 24px 28px; background: ${accent}; color: #fff; }
          .card-header h1 { font-size: 20px; font-weight: 700; }
          .card-header p { font-size: 14px; opacity: 0.85; margin-top: 4px; }
          .card-body { padding: 24px 28px; display: grid; gap: 20px; }
          .summary { background: #f9fafb; border-radius: 10px; padding: 16px; display: grid; gap: 8px; }
          .summary-row { display: flex; justify-content: space-between; font-size: 14px; }
          .summary-row .lbl { color: #6b7280; }
          .summary-row .val { font-weight: 600; }
          label { display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 6px; }
          input[type="text"], input[type="date"], select, textarea { width: 100%; padding: 10px 12px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 14px; font-family: inherit; color: #111; background: #fff; }
          input[type="text"]:focus, input[type="date"]:focus, select:focus, textarea:focus { outline: 2px solid ${accent}; border-color: transparent; }
          input[readonly] { background: #f9fafb; color: #6b7280; cursor: default; }
          .rules { background: #f9fafb; border-radius: 10px; padding: 16px; font-size: 13px; color: #374151; line-height: 1.7; max-height: 200px; overflow-y: auto; white-space: pre-wrap; border: 1px solid #e5e7eb; }
          .checkbox-row { display: flex; align-items: flex-start; gap: 10px; }
          .checkbox-row input { width: 18px; height: 18px; margin-top: 2px; accent-color: ${accent}; flex-shrink: 0; }
          .checkbox-row span { font-size: 14px; color: #374151; line-height: 1.5; }
          .btn { display: block; width: 100%; padding: 13px; border-radius: 10px; border: none; background: ${accent}; color: #fff; font-size: 15px; font-weight: 700; cursor: pointer; font-family: inherit; }
          .btn:hover { opacity: 0.9; }
          .success { text-align: center; padding: 32px 20px; }
          .success .icon { margin-bottom: 12px; display: flex; justify-content: center; }
          .success h2 { font-size: 22px; font-weight: 700; margin-bottom: 8px; }
          .success p { font-size: 15px; color: #6b7280; line-height: 1.6; }
          .logo { text-align: center; margin-bottom: 24px; font-size: 13px; color: #9ca3af; font-weight: 500; letter-spacing: 0.04em; }
          /* Guest accordions */
          .guest-accordion { border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; }
          .guest-accordion summary { padding: 14px 16px; cursor: pointer; list-style: none; display: flex; align-items: center; justify-content: space-between; font-size: 14px; font-weight: 600; color: #111827; background: #f9fafb; user-select: none; -webkit-user-select: none; }
          .guest-accordion summary::-webkit-details-marker { display: none; }
          .guest-accordion[open] summary { border-bottom: 1px solid #e5e7eb; }
          .guest-badge { font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 20px; background: ${accent}22; color: ${accent}; }
          .guest-caret { transition: transform 0.2s; }
          .guest-accordion[open] .guest-caret { transform: rotate(180deg); }
          .guest-fields { padding: 16px; display: grid; gap: 14px; }
          .readonly-name { font-size: 14px; color: #6b7280; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 10px 12px; }
          .field-note { font-size: 12px; color: #9ca3af; font-weight: 400; margin-left: 4px; }
        `}</style>
      </head>
      <body>
        <div className="wrap">
          <div className="logo">{hotelName}</div>

          <div className="card">
            <div className="card-header">
              <h1>Online Check-in</h1>
              <p>Willkommen, {request.firstname || request.lastname}!</p>
            </div>

            {completed ? (
              <div className="success">
                <div className="icon">
                  <svg width="48" height="48" viewBox="0 0 64 64" fill="none">
                    <circle cx="32" cy="32" r="32" fill={accent} />
                    <path d="M18 33l10 10 18-18" stroke={checkmarkColor} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h2>Bereits eingecheckt</h2>
                <p>
                  Du hast das Check-in Formular bereits ausgefüllt.
                  {request.checkinArrivalTime && <><br />Geplante Ankunft: <strong>{request.checkinArrivalTime}</strong></>}
                  {request.checkinNationality && <><br />Staatsangehörigkeit: <strong>{request.checkinNationality}</strong></>}
                </p>
              </div>
            ) : (
              <form action={submitCheckin} className="card-body">
                <input type="hidden" name="token" value={token} />

                {/* Booking summary */}
                <div className="summary">
                  <div className="summary-row">
                    <span className="lbl">Anreise</span>
                    <span className="val">{fmtDate(request.arrival)}</span>
                  </div>
                  <div className="summary-row">
                    <span className="lbl">Abreise</span>
                    <span className="val">{fmtDate(request.departure)}</span>
                  </div>
                  <div className="summary-row">
                    <span className="lbl">Nächte</span>
                    <span className="val">{request.nights}</span>
                  </div>
                  <div className="summary-row">
                    <span className="lbl">Personen</span>
                    <span className="val">{request.adults} Erwachsene{request.children ? `, ${request.children} Kinder` : ''}</span>
                  </div>
                </div>

                {/* Arrival time */}
                <div>
                  <label htmlFor="arrivalTime">Geplante Ankunftszeit</label>
                  <select id="arrivalTime" name="arrivalTime" required>
                    <option value="">Bitte wählen …</option>
                    {['12:00–13:00','13:00–14:00','14:00–15:00','15:00–16:00','16:00–17:00','17:00–18:00','18:00–19:00','19:00–20:00','20:00–21:00','21:00–22:00','Nach 22:00'].map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                {/* Meldezettel notice */}
                <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10, padding: '12px 14px', fontSize: 13, color: '#1e40af', lineHeight: 1.5 }}>
                  <strong>Kurzer Hinweis:</strong> In Österreich sind Beherbergungsbetriebe gesetzlich verpflichtet, bei der Anreise die Ausweisdaten ihrer Gäste zu erfassen. Das dauert nur einen Moment — danke für Ihr Verständnis!
                </div>

                {/* Per-guest accordions */}
                <div style={{ display: 'grid', gap: 10 }}>
                  <label style={{ marginBottom: 0 }}>Meldedaten</label>
                  {guests.map((guest, i) => {
                    const isChild = guest.type === 'child';
                    const label = isChild
                      ? `Kind: ${guest.firstname} ${guest.lastname}`.trim()
                      : guest.isPrimary
                        ? `${guest.firstname} ${guest.lastname}`.trim() || 'Hauptgast'
                        : `${guest.firstname} ${guest.lastname}`.trim();
                    return (
                      <details key={i} className="guest-accordion" {...(i === 0 ? { open: true } : {})}>
                        <summary>
                          <span>{label}</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span className="guest-badge">{isChild ? 'Kind' : 'Erwachsen'}</span>
                            <svg className="guest-caret" width="16" height="16" viewBox="0 0 16 16" fill="none">
                              <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </span>
                        </summary>
                        <div className="guest-fields">
                          <div>
                            <label>Name</label>
                            <div className="readonly-name">{guest.firstname} {guest.lastname}</div>
                          </div>
                          <div>
                            <label htmlFor={`g${i}_birthdate`}>
                              Geburtsdatum
                            </label>
                            <input
                              id={`g${i}_birthdate`}
                              name={`g${i}_birthdate`}
                              type="date"
                              required
                              defaultValue={guest.birthday ?? ''}
                            />
                          </div>
                          <div>
                            <label htmlFor={`g${i}_nationality`}>Staatsangehörigkeit</label>
                            <input
                              id={`g${i}_nationality`}
                              name={`g${i}_nationality`}
                              type="text"
                              required
                              placeholder="z. B. Österreich, Deutschland …"
                            />
                          </div>
                          {!isChild && (
                            <div>
                              <label htmlFor={`g${i}_docnumber`}>Reisepass- / Ausweisnummer</label>
                              <input
                                id={`g${i}_docnumber`}
                                name={`g${i}_docnumber`}
                                type="text"
                                required
                                placeholder="z. B. P1234567"
                              />
                            </div>
                          )}
                        </div>
                      </details>
                    );
                  })}
                </div>

                {/* Notes */}
                <div>
                  <label htmlFor="notes">Besondere Wünsche / Hinweise <span className="field-note">(optional)</span></label>
                  <textarea id="notes" name="notes" rows={3} placeholder="z. B. Allergien, Kinderbett benötigt, …" />
                </div>

                {/* House rules */}
                {settings?.houseRules && (
                  <div style={{ display: 'grid', gap: 10 }}>
                    <label>Hausordnung</label>
                    <div className="rules">{settings.houseRules}</div>
                    <div className="checkbox-row">
                      <input type="checkbox" id="acceptRules" name="acceptRules" value="1" required />
                      <label htmlFor="acceptRules" style={{ marginBottom: 0 }}>
                        <span>Ich habe die Hausordnung gelesen und akzeptiere sie.</span>
                      </label>
                    </div>
                  </div>
                )}

                <button type="submit" className="btn">Check-in abschließen</button>
              </form>
            )}
          </div>
        </div>
      </body>
    </html>
  );
}

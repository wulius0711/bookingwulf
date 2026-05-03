import { prisma } from '@/src/lib/prisma';
import { notFound } from 'next/navigation';
import { submitCheckin } from './actions';

type Props = { params: Promise<{ token: string }> };

export const dynamic = 'force-dynamic';

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
      checkinNotes: true,
      checkinBirthdate: true,
      checkinNationality: true,
      checkinDocNumber: true,
      hotelId: true,
      hotel: { select: { name: true, accentColor: true } },
    },
  });

  if (!request) notFound();

  const settings = request.hotelId
    ? await prisma.hotelSettings.findUnique({
        where: { hotelId: request.hotelId },
        select: { preArrivalHouseRules: true, preArrivalEnabled: true },
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
          select, textarea { width: 100%; padding: 10px 12px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 14px; font-family: inherit; color: #111; background: #fff; }
          select:focus, textarea:focus { outline: 2px solid ${accent}; border-color: transparent; }
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
                  <svg width="48" height="48" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
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

                {/* Meldezettel */}
                <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10, padding: '12px 14px', fontSize: 13, color: '#1e40af', lineHeight: 1.5 }}>
                  <strong>Kurzer Hinweis:</strong> In Österreich sind Beherbergungsbetriebe gesetzlich verpflichtet, bei der Anreise die Ausweisdaten ihrer Gäste zu erfassen. Das dauert nur einen Moment — danke für dein Verständnis!
                </div>
                <div>
                  <label htmlFor="birthdate">Geburtsdatum</label>
                  <input id="birthdate" name="birthdate" type="date" required style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', color: '#111', background: '#fff' }} />
                </div>
                <div>
                  <label htmlFor="nationality">Staatsangehörigkeit</label>
                  <input id="nationality" name="nationality" type="text" required placeholder="z. B. Österreich, Deutschland …" style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', color: '#111', background: '#fff' }} />
                </div>
                <div>
                  <label htmlFor="docNumber">Reisepass- / Ausweisnummer</label>
                  <input id="docNumber" name="docNumber" type="text" required placeholder="z. B. P1234567" style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', color: '#111', background: '#fff' }} />
                </div>

                {/* Notes */}
                <div>
                  <label htmlFor="notes">Besondere Wünsche / Hinweise <span style={{ fontWeight: 400, color: '#9ca3af' }}>(optional)</span></label>
                  <textarea id="notes" name="notes" rows={3} placeholder="z. B. Allergien, Kinderbett benötigt, …" />
                </div>

                {/* House rules */}
                {settings?.preArrivalHouseRules && (
                  <div style={{ display: 'grid', gap: 10 }}>
                    <label>Hausordnung</label>
                    <div className="rules">{settings.preArrivalHouseRules}</div>
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

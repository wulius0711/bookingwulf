import { prisma } from '@/src/lib/prisma';
import { notFound } from 'next/navigation';
import { confirmOnsite } from './actions';

type Props = {
  params: Promise<{ apartmentId: string }>;
  searchParams: Promise<{ error?: string }>;
};

export const dynamic = 'force-dynamic';

export default async function VorOrtPage({ params, searchParams }: Props) {
  const { apartmentId } = await params;
  const { error } = await searchParams;
  const id = parseInt(apartmentId, 10);
  if (!Number.isInteger(id)) notFound();

  const apartment = await prisma.apartment.findUnique({
    where: { id },
    select: { name: true, hotel: { select: { name: true, accentColor: true } } },
  });

  if (!apartment) notFound();

  const accent = apartment.hotel?.accentColor || '#111827';
  const hotelName = apartment.hotel?.name || 'Hotel';
  const today = new Date().toISOString().slice(0, 10);

  return (
    <html lang="de">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Ankunft bestätigen — {hotelName}</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <style>{`
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: Inter, ui-sans-serif, system-ui, sans-serif; background: #f5f7fa; color: #111827; min-height: 100vh; }
          .wrap { max-width: 420px; margin: 0 auto; padding: 40px 16px 64px; }
          .card { background: #fff; border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.08); overflow: hidden; }
          .card-header { padding: 24px 28px; background: ${accent}; color: #fff; }
          .card-header h1 { font-size: 20px; font-weight: 700; }
          .card-header p { font-size: 14px; opacity: 0.85; margin-top: 4px; }
          .card-body { padding: 24px 28px; display: grid; gap: 16px; }
          label { display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 6px; }
          input[type="text"], input[type="date"] { width: 100%; padding: 10px 12px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 14px; font-family: inherit; color: #111; background: #fff; }
          input:focus { outline: 2px solid ${accent}; border-color: transparent; }
          .btn { display: block; width: 100%; padding: 13px; border-radius: 10px; border: none; background: ${accent}; color: #fff; font-size: 15px; font-weight: 700; cursor: pointer; font-family: inherit; }
          .btn:hover { opacity: 0.9; }
          .error { background: #fef2f2; border: 1px solid #fecaca; color: #b91c1c; border-radius: 8px; padding: 10px 12px; font-size: 13px; }
          .hint { font-size: 13px; color: #6b7280; line-height: 1.6; }
          .logo { text-align: center; margin-bottom: 24px; font-size: 13px; color: #9ca3af; font-weight: 500; letter-spacing: 0.04em; }
        `}</style>
      </head>
      <body>
        <div className="wrap">
          <div className="logo">{hotelName}</div>
          <div className="card">
            <div className="card-header">
              <h1>Ankunft bestätigen</h1>
              <p>{apartment.name}</p>
            </div>
            <form action={confirmOnsite} className="card-body">
              <input type="hidden" name="apartmentId" value={id} />
              <p className="hint">
                Bitte bestätige, dass du jetzt vor Ort angekommen bist. Damit wird deine beim Online Check-in erfasste Unterschrift gültig (gesetzliche Vorgabe lt. Meldegesetz).
              </p>
              {error && <div className="error">Keine passende Buchung gefunden. Bitte Nachname und Anreisedatum prüfen oder an der Rezeption melden.</div>}
              <div>
                <label htmlFor="lastname">Nachname</label>
                <input id="lastname" name="lastname" type="text" required autoFocus />
              </div>
              <div>
                <label htmlFor="arrivalDate">Anreisedatum</label>
                <input id="arrivalDate" name="arrivalDate" type="date" required defaultValue={today} />
              </div>
              <button type="submit" className="btn">Ankunft bestätigen</button>
            </form>
          </div>
        </div>
      </body>
    </html>
  );
}

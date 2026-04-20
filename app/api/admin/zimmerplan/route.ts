import { verifySession } from '@/src/lib/session';
import { buildZimmerplan } from '@/src/lib/zimmerplan';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const session = await verifySession();
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date') ?? '';

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return Response.json({ error: 'Invalid date' }, { status: 400 });
  }

  try {
    const apartments = await buildZimmerplan(session.hotelId, date);
    return Response.json({ apartments });
  } catch (err) {
    console.error('[zimmerplan]', err);
    return Response.json({ error: 'Fehler beim Laden des Zimmerplans.' }, { status: 500 });
  }
}

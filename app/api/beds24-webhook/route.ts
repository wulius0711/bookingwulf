// Beds24 inbound webhook — receives availability change notifications
// Webhook URL: https://your-domain.com/api/beds24-webhook?token=<BEDS24_WEBHOOK_SECRET>

import { timingSafeEqual } from 'crypto';

export async function POST(req: Request) {
  const secret = process.env.BEDS24_WEBHOOK_SECRET;
  const token = new URL(req.url).searchParams.get('token') ?? '';
  const authorized =
    !!secret &&
    token.length === secret.length &&
    timingSafeEqual(Buffer.from(token), Buffer.from(secret));
  if (!authorized) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  console.log('[Beds24 webhook]', JSON.stringify(body));

  // TODO: parse body, find Beds24ApartmentMapping by roomId,
  //       upsert BlockedRange with type: 'beds24_sync'
  //       Example body shape (Beds24 v2):
  //       { roomId: "123", from: "2026-05-01", to: "2026-05-05", type: "blocked" }

  return Response.json({ ok: true });
}

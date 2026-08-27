// One-off, throwaway test: verifies whether POST /properties can actually write
// room.offers[].enable (the "Beta"-marked endpoint's nested-array partial-update semantics
// were never confirmed). Touches ONLY an unused offer slot (offerId 2, currently disabled,
// no priceRules/channels attached to it) on a single live room — never price1/price2 or any
// field with a real channel enabled. Captures a before/after snapshot and reverts immediately.
//
// Usage: npx tsx scripts/beds24-offer-write-test.ts <hotelId> <roomId>

import { prisma } from '../src/lib/prisma';

const BEDS24_API = 'https://api.beds24.com/v2';
const hotelId = Number(process.argv[2]);
const roomId = process.argv[3];

if (!hotelId || !roomId) {
  console.error('Usage: npx tsx scripts/beds24-offer-write-test.ts <hotelId> <roomId>');
  process.exit(1);
}

async function getAccessToken(): Promise<string> {
  const config = await prisma.beds24Config.findUnique({
    where: { hotelId },
    select: { refreshToken: true, accessToken: true, accessTokenExpiresAt: true },
  });
  if (!config) throw new Error(`Keine Beds24Config für Hotel ${hotelId}`);

  if (config.accessToken && config.accessTokenExpiresAt && config.accessTokenExpiresAt.getTime() - 60 * 60 * 1000 > Date.now()) {
    return config.accessToken;
  }
  const res = await fetch(`${BEDS24_API}/authentication/token`, { headers: { refreshToken: config.refreshToken } });
  if (!res.ok) throw new Error(`Token-Refresh fehlgeschlagen: HTTP ${res.status} ${await res.text()}`);
  const data = await res.json();
  await prisma.beds24Config.update({
    where: { hotelId },
    data: {
      accessToken: data.token,
      accessTokenExpiresAt: new Date(Date.now() + (data.expiresIn ?? 86400) * 1000),
      ...(data.refreshToken && data.refreshToken !== config.refreshToken ? { refreshToken: data.refreshToken } : {}),
    },
  });
  return data.token;
}

async function getRoomState(token: string): Promise<any> {
  const url = new URL(`${BEDS24_API}/properties`);
  url.searchParams.set('roomId', roomId);
  url.searchParams.set('includeAllRooms', 'true');
  url.searchParams.set('includeOffers', 'true');
  url.searchParams.set('includePriceRules', 'true');
  const res = await fetch(url.toString(), { headers: { token } });
  if (!res.ok) throw new Error(`GET /properties fehlgeschlagen: HTTP ${res.status} ${await res.text()}`);
  const data = await res.json();
  const property = data?.data?.[0];
  const room = property?.roomTypes?.find((r: any) => String(r.id) === String(roomId));
  if (!room) throw new Error(`Zimmer ${roomId} nicht in Antwort gefunden: ${JSON.stringify(data).slice(0, 500)}`);
  return room;
}

function findOffer(room: any, offerId: number) {
  return (room.offers ?? []).find((o: any) => Number(o.offerId) === offerId);
}

async function writeOfferEnable(token: string, offerId: number, enable: string) {
  const body = [{ roomTypes: [{ id: roomId, offers: [{ offerId, enable }] }] }];
  const res = await fetch(`${BEDS24_API}/properties`, {
    method: 'POST',
    headers: { token, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let data: any;
  try { data = JSON.parse(text); } catch { data = text; }
  return { ok: res.ok, status: res.status, data };
}

async function main() {
  const token = await getAccessToken();

  console.log(`\n=== 1. Baseline GET (Zimmer ${roomId}) ===`);
  const before = await getRoomState(token);
  console.log('offers:', JSON.stringify(before.offers, null, 2));
  const offer2Before = findOffer(before, 2);
  console.log('Offer 2 vorher:', JSON.stringify(offer2Before));

  if (!offer2Before) {
    console.log('Offer 2 existiert nicht im offers-Array — Test bricht ab, kein Schreibversuch.');
    return;
  }
  if (offer2Before.enable !== 'no') {
    console.log(`ABBRUCH: Offer 2 hat enable="${offer2Before.enable}" (nicht "no" wie erwartet) — evtl. bereits in Nutzung. Kein Schreibversuch, um nichts Echtes zu verändern.`);
    return;
  }

  console.log(`\n=== 2. Schreibversuch: Offer 2 enable "no" -> "always" ===`);
  const writeResult = await writeOfferEnable(token, 2, 'always');
  console.log('POST Ergebnis:', JSON.stringify(writeResult, null, 2));

  console.log(`\n=== 3. Verifikations-GET ===`);
  const after = await getRoomState(token);
  const offer2After = findOffer(after, 2);
  console.log('Offer 2 nachher:', JSON.stringify(offer2After));

  // Diff everything else in offers[] / priceRules[] to catch unintended side effects
  const otherOffersBefore = (before.offers ?? []).filter((o: any) => Number(o.id) !== 2);
  const otherOffersAfter = (after.offers ?? []).filter((o: any) => Number(o.id) !== 2);
  const otherOffersChanged = JSON.stringify(otherOffersBefore) !== JSON.stringify(otherOffersAfter);
  console.log('Andere Offers unverändert:', !otherOffersChanged);
  if (otherOffersChanged) {
    console.log('!!! ACHTUNG: andere Offers haben sich mitverändert !!!');
    console.log('vorher:', JSON.stringify(otherOffersBefore, null, 2));
    console.log('nachher:', JSON.stringify(otherOffersAfter, null, 2));
  }

  console.log(`\n=== 4. Rückgängig machen: Offer 2 enable "always" -> "no" ===`);
  const revertResult = await writeOfferEnable(token, 2, 'no');
  console.log('POST Ergebnis:', JSON.stringify(revertResult, null, 2));

  console.log(`\n=== 5. Bestätigungs-GET ===`);
  const restored = await getRoomState(token);
  const offer2Restored = findOffer(restored, 2);
  console.log('Offer 2 final:', JSON.stringify(offer2Restored));
  const fullyRestored = JSON.stringify(restored.offers) === JSON.stringify(before.offers) && JSON.stringify(restored.priceRules) === JSON.stringify(before.priceRules);
  console.log('\nVollständig auf Ausgangszustand zurückgesetzt:', fullyRestored);
}

main()
  .catch((err) => { console.error('FEHLER:', err); process.exitCode = 1; })
  .finally(() => prisma.$disconnect())
  .finally(() => process.exit());

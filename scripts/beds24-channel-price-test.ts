// One-off, throwaway test — verifies the two Beds24 write paths still needed for per-channel
// pricing that were NOT covered by beds24-offer-write-test.ts:
//   Block A: writing priceRules[].channels.<channel>.enable (channel routing for a price rule)
//   Block B: writing a real price2 value via the existing /inventory/rooms/calendar endpoint,
//            including whether price2: null cleans up the field again
// Touches ONLY priceRule id 2 (currently an empty, unattached stub) and a single far-future
// date (no real guest could plausibly be booked there). Reverts everything it changes and
// re-verifies the reverted state before exiting. See docs/DOCUMENTATION.md §18 and
// project_beds24_preisregeln_nicht_via_api.md (memory) for context.
//
// Usage: npx tsx scripts/beds24-channel-price-test.ts <hotelId> <roomId>

import { prisma } from '../src/lib/prisma';

const BEDS24_API = 'https://api.beds24.com/v2';
const hotelId = Number(process.argv[2]);
const roomId = process.argv[3];
const TEST_PRICE_RULE_ID = 2;
const TEST_PRICE_FIELD = 'price2';
const TEST_PRICE_VALUE = 12345.67; // distinctive, unmistakably-a-test value

if (!hotelId || !roomId) {
  console.error('Usage: npx tsx scripts/beds24-channel-price-test.ts <hotelId> <roomId>');
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
function findPriceRule(room: any, id: number) {
  return (room.priceRules ?? []).find((r: any) => Number(r.id) === id);
}

async function postProperties(token: string, roomTypePatch: Record<string, unknown>) {
  const res = await fetch(`${BEDS24_API}/properties`, {
    method: 'POST',
    headers: { token, 'Content-Type': 'application/json' },
    body: JSON.stringify([{ roomTypes: [{ id: roomId, ...roomTypePatch }] }]),
  });
  const text = await res.text();
  let data: any;
  try { data = JSON.parse(text); } catch { data = text; }
  return { ok: res.ok, status: res.status, data };
}

async function getCalendarDay(token: string, date: string): Promise<any> {
  const url = new URL(`${BEDS24_API}/inventory/rooms/calendar`);
  url.searchParams.set('roomId', roomId);
  url.searchParams.set('startDate', date);
  url.searchParams.set('endDate', date);
  url.searchParams.set('includePrices', 'true');
  url.searchParams.set('includeOverride', 'true');
  url.searchParams.set('includeMinStay', 'true');
  url.searchParams.set('includeNumAvail', 'true');
  const res = await fetch(url.toString(), { headers: { token } });
  if (!res.ok) throw new Error(`GET /inventory/rooms/calendar fehlgeschlagen: HTTP ${res.status} ${await res.text()}`);
  const data = await res.json();
  const roomEntry = data?.data?.find((r: any) => String(r.roomId) === String(roomId));
  const day = roomEntry?.calendar?.find((c: any) => c.from === date || (c.from <= date && c.to >= date));
  return day ?? null;
}

async function postCalendarPrice(token: string, date: string, priceField: string, value: number | null) {
  const res = await fetch(`${BEDS24_API}/inventory/rooms/calendar`, {
    method: 'POST',
    headers: { token, 'Content-Type': 'application/json' },
    body: JSON.stringify([{ roomId, calendar: [{ from: date, to: date, [priceField]: value }] }]),
  });
  const text = await res.text();
  let data: any;
  try { data = JSON.parse(text); } catch { data = text; }
  return { ok: res.ok, status: res.status, data };
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

async function blockA(token: string) {
  console.log('\n\n########## BLOCK A: priceRules[].channels.airbnb.enable ##########');

  console.log('\n=== A1. Baseline GET ===');
  const before = await getRoomState(token);
  const offer2Before = findOffer(before, TEST_PRICE_RULE_ID);
  const rule2Before = findPriceRule(before, TEST_PRICE_RULE_ID);
  console.log('Offer 2 vorher:', JSON.stringify(offer2Before));
  console.log('PriceRule 2 vorher:', JSON.stringify(rule2Before));

  if (!offer2Before || offer2Before.enable !== 'no') {
    console.log('ABBRUCH: Offer 2 ist nicht im erwarteten Ausgangszustand (enable="no") — evtl. bereits in Nutzung. Kein Schreibversuch.');
    return;
  }
  if (rule2Before?.channels) {
    console.log('ABBRUCH: PriceRule 2 hat bereits konfigurierte channels — evtl. bereits in Nutzung. Kein Schreibversuch.');
    return;
  }

  console.log('\n=== A2. Schreibversuch: priceRules[id=2].channels.airbnb.enable = true ===');
  const writeResult = await postProperties(token, { priceRules: [{ id: TEST_PRICE_RULE_ID, channels: { airbnb: { enable: true } } }] });
  console.log('POST Ergebnis:', JSON.stringify(writeResult, null, 2));

  console.log('\n=== A3. Verifikations-GET ===');
  const after = await getRoomState(token);
  const rule2After = findPriceRule(after, TEST_PRICE_RULE_ID);
  console.log('PriceRule 2 nachher:', JSON.stringify(rule2After));

  const otherRulesBefore = (before.priceRules ?? []).filter((r: any) => Number(r.id) !== TEST_PRICE_RULE_ID);
  const otherRulesAfter = (after.priceRules ?? []).filter((r: any) => Number(r.id) !== TEST_PRICE_RULE_ID);
  const otherRulesChanged = JSON.stringify(otherRulesBefore) !== JSON.stringify(otherRulesAfter);
  const offersUnchanged = JSON.stringify(before.offers) === JSON.stringify(after.offers);
  console.log('Andere priceRules unverändert:', !otherRulesChanged);
  console.log('offers[] komplett unverändert (Block A sollte nur priceRules anfassen):', offersUnchanged);
  if (otherRulesChanged) {
    console.log('!!! ACHTUNG: andere priceRules haben sich mitverändert !!!');
    console.log('vorher:', JSON.stringify(otherRulesBefore, null, 2));
    console.log('nachher:', JSON.stringify(otherRulesAfter, null, 2));
  }

  console.log('\n=== A4. Rückgängig machen: channels.airbnb.enable = false ===');
  const revertResult = await postProperties(token, { priceRules: [{ id: TEST_PRICE_RULE_ID, channels: { airbnb: { enable: false } } }] });
  console.log('POST Ergebnis:', JSON.stringify(revertResult, null, 2));

  console.log('\n=== A5. Bestätigungs-GET ===');
  const restored = await getRoomState(token);
  const rule2Restored = findPriceRule(restored, TEST_PRICE_RULE_ID);
  console.log('PriceRule 2 final:', JSON.stringify(rule2Restored));
  console.log('Hinweis: "enable: false" ist evtl. nicht bit-identisch mit dem Ausgangszustand (kein channels-Objekt) —');
  console.log('das ist erwartbar und harmlos (airbnb bleibt disabled), wird unten trotzdem verglichen:');
  const fullyRestored = JSON.stringify(restored.priceRules) === JSON.stringify(before.priceRules);
  console.log('priceRules bit-identisch zum Ausgangszustand:', fullyRestored);
}

async function blockB(token: string) {
  console.log('\n\n########## BLOCK B: price2 über /inventory/rooms/calendar ##########');

  const testDate = isoDate(new Date(Date.now() + 400 * 24 * 60 * 60 * 1000));
  console.log(`\nTest-Datum (weit in der Zukunft): ${testDate}`);

  console.log('\n=== B1. Baseline GET (Kalendertag) ===');
  const before = await getCalendarDay(token, testDate);
  console.log('Tag vorher:', JSON.stringify(before, null, 2));

  if (before && before[TEST_PRICE_FIELD] != null) {
    console.log(`ABBRUCH: ${TEST_PRICE_FIELD} ist an diesem Datum bereits gesetzt (${before[TEST_PRICE_FIELD]}) — evtl. bereits in Nutzung. Kein Schreibversuch.`);
    return;
  }

  console.log(`\n=== B2. Schreibversuch: ${TEST_PRICE_FIELD} = ${TEST_PRICE_VALUE} (sonst nichts im Payload) ===`);
  const writeResult = await postCalendarPrice(token, testDate, TEST_PRICE_FIELD, TEST_PRICE_VALUE);
  console.log('POST Ergebnis:', JSON.stringify(writeResult, null, 2));

  console.log('\n=== B3. Verifikations-GET ===');
  const after = await getCalendarDay(token, testDate);
  console.log('Tag nachher:', JSON.stringify(after, null, 2));

  const otherFieldsBefore = { ...(before ?? {}) };
  const otherFieldsAfter = { ...(after ?? {}) };
  delete otherFieldsBefore[TEST_PRICE_FIELD];
  delete otherFieldsAfter[TEST_PRICE_FIELD];
  const otherFieldsChanged = JSON.stringify(otherFieldsBefore) !== JSON.stringify(otherFieldsAfter);
  console.log(`${TEST_PRICE_FIELD} korrekt gesetzt:`, after?.[TEST_PRICE_FIELD] === TEST_PRICE_VALUE);
  console.log('Alle anderen Felder (override/minStay/numAvail/price1/price3..) unverändert:', !otherFieldsChanged);
  if (otherFieldsChanged) {
    console.log('!!! ACHTUNG: andere Kalenderfelder haben sich mitverändert !!!');
    console.log('vorher (ohne Testfeld):', JSON.stringify(otherFieldsBefore, null, 2));
    console.log('nachher (ohne Testfeld):', JSON.stringify(otherFieldsAfter, null, 2));
  }

  console.log(`\n=== B4. Löschtest: ${TEST_PRICE_FIELD} = null ===`);
  const nullResult = await postCalendarPrice(token, testDate, TEST_PRICE_FIELD, null);
  console.log('POST Ergebnis:', JSON.stringify(nullResult, null, 2));

  console.log('\n=== B5. Bestätigungs-GET ===');
  const restored = await getCalendarDay(token, testDate);
  console.log('Tag final:', JSON.stringify(restored, null, 2));
  console.log(`${TEST_PRICE_FIELD} durch null vollständig entfernt:`, restored?.[TEST_PRICE_FIELD] == null);
  const otherFieldsRestored = { ...(restored ?? {}) };
  delete otherFieldsRestored[TEST_PRICE_FIELD];
  console.log('Sonstige Felder final == Ausgangszustand:', JSON.stringify(otherFieldsRestored) === JSON.stringify(otherFieldsBefore));
}

// Block A revealed that priceRules[].id does NOT automatically equal the offer/price slot it
// governs — Beds24 defaulted priceRule id=2's "offer" field to 1 (not 2) when we wrote channels
// without specifying it. This checks whether explicitly setting "offer" sticks, and reverts it.
async function blockC(token: string) {
  console.log('\n\n########## BLOCK C: priceRules[id=2].offer explizit setzen ##########');

  console.log('\n=== C1. Baseline GET ===');
  const before = await getRoomState(token);
  const rule2Before = findPriceRule(before, TEST_PRICE_RULE_ID);
  console.log('PriceRule 2 vorher (offer-Feld):', rule2Before?.offer);

  if (rule2Before?.offer === TEST_PRICE_RULE_ID) {
    console.log('offer ist bereits 2 — nichts zu tun, kein Schreibversuch nötig.');
    return;
  }

  console.log(`\n=== C2. Schreibversuch: priceRules[id=${TEST_PRICE_RULE_ID}].offer = ${TEST_PRICE_RULE_ID} ===`);
  const writeResult = await postProperties(token, { priceRules: [{ id: TEST_PRICE_RULE_ID, offer: TEST_PRICE_RULE_ID }] });
  console.log('POST Ergebnis:', JSON.stringify(writeResult, null, 2));

  console.log('\n=== C3. Verifikations-GET ===');
  const after = await getRoomState(token);
  const rule2After = findPriceRule(after, TEST_PRICE_RULE_ID);
  console.log('PriceRule 2 nachher (offer-Feld):', rule2After?.offer);
  console.log('offer korrekt auf 2 gesetzt (nicht wieder auf Default zurückgefallen):', rule2After?.offer === TEST_PRICE_RULE_ID);

  const otherFieldsBefore = { ...rule2Before };
  const otherFieldsAfter = { ...rule2After };
  delete otherFieldsBefore.offer;
  delete otherFieldsAfter.offer;
  console.log('Sonstige Felder von PriceRule 2 unverändert:', JSON.stringify(otherFieldsBefore) === JSON.stringify(otherFieldsAfter));

  console.log(`\n=== C4. Rückgängig machen: offer zurück auf ${rule2Before?.offer} ===`);
  const revertResult = await postProperties(token, { priceRules: [{ id: TEST_PRICE_RULE_ID, offer: rule2Before?.offer ?? 1 }] });
  console.log('POST Ergebnis:', JSON.stringify(revertResult, null, 2));

  console.log('\n=== C5. Bestätigungs-GET ===');
  const restored = await getRoomState(token);
  const rule2Restored = findPriceRule(restored, TEST_PRICE_RULE_ID);
  console.log('PriceRule 2 final (offer-Feld):', rule2Restored?.offer);
  console.log('Vollständig auf Ausgangszustand zurückgesetzt:', JSON.stringify(rule2Restored) === JSON.stringify(rule2Before));
}

async function main() {
  const token = await getAccessToken();
  await blockA(token);
  await blockB(token);
  await blockC(token);
  console.log('\n\nFertig. Bitte Ausgabe oben Zeile für Zeile gegen die Sicherheits-Checks (ABBRUCH-Meldungen, "!!! ACHTUNG") prüfen.');
}

main()
  .catch((err) => { console.error('FEHLER:', err); process.exitCode = 1; })
  .finally(() => prisma.$disconnect())
  .finally(() => process.exit());

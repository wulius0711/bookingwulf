// Full end-to-end verification of the channel-price feature against the real production
// function (provisionChannelOffers, pushChannelPriceSync from src/lib/beds24.ts) — not a
// reimplementation like the earlier probe scripts. Runs against MSQ (hotelId 44, apartmentId 25
// "MSQ DIANA", roomId 691904). Fully reverts everything at the end: deletes the test
// ChannelPriceRange (clears price on Beds24 via null), disables the provisioned offer/channel
// routing, and restores connectedChannels/channelOfferIds to null — so the team can walk
// through the real setup manually afterward with a clean slate.
//
// Usage: npx tsx scripts/beds24-channel-price-e2e-test.ts

import { prisma } from '../src/lib/prisma';
import { Prisma } from '../src/generated/prisma/client';
import { provisionChannelOffers, pushChannelPriceSync } from '../src/lib/beds24';

const BEDS24_API = 'https://api.beds24.com/v2';
const HOTEL_ID = 44;
const APARTMENT_ID = 25;
const ROOM_ID = '691904';
const CHANNEL = 'airbnb';
const TEST_PRICE = 199.99;

function isoDate(d: Date): string { return d.toISOString().slice(0, 10); }

async function getAccessToken(): Promise<string> {
  const config = await prisma.beds24Config.findUnique({ where: { hotelId: HOTEL_ID }, select: { refreshToken: true, accessToken: true, accessTokenExpiresAt: true } });
  if (!config) throw new Error('Keine Beds24Config');
  if (config.accessToken && config.accessTokenExpiresAt && config.accessTokenExpiresAt.getTime() - 60 * 60 * 1000 > Date.now()) return config.accessToken;
  const res = await fetch(`${BEDS24_API}/authentication/token`, { headers: { refreshToken: config.refreshToken } });
  if (!res.ok) throw new Error(`Token-Refresh fehlgeschlagen: HTTP ${res.status} ${await res.text()}`);
  const data = await res.json();
  await prisma.beds24Config.update({ where: { hotelId: HOTEL_ID }, data: { accessToken: data.token, accessTokenExpiresAt: new Date(Date.now() + (data.expiresIn ?? 86400) * 1000), ...(data.refreshToken && data.refreshToken !== config.refreshToken ? { refreshToken: data.refreshToken } : {}) } });
  return data.token;
}

async function getRoomState(token: string): Promise<any> {
  const url = new URL(`${BEDS24_API}/properties`);
  url.searchParams.set('roomId', ROOM_ID);
  url.searchParams.set('includeAllRooms', 'true');
  url.searchParams.set('includeOffers', 'true');
  url.searchParams.set('includePriceRules', 'true');
  const res = await fetch(url.toString(), { headers: { token } });
  if (!res.ok) throw new Error(`GET /properties fehlgeschlagen: HTTP ${res.status} ${await res.text()}`);
  const data = await res.json();
  const room = data?.data?.[0]?.roomTypes?.find((r: any) => String(r.id) === ROOM_ID);
  if (!room) throw new Error('Zimmer nicht gefunden');
  return room;
}

async function getCalendarDay(token: string, date: string): Promise<any> {
  const url = new URL(`${BEDS24_API}/inventory/rooms/calendar`);
  url.searchParams.set('roomId', ROOM_ID);
  url.searchParams.set('startDate', date);
  url.searchParams.set('endDate', date);
  url.searchParams.set('includePrices', 'true');
  url.searchParams.set('includeOverride', 'true');
  url.searchParams.set('includeMinStay', 'true');
  url.searchParams.set('includeNumAvail', 'true');
  const res = await fetch(url.toString(), { headers: { token } });
  if (!res.ok) throw new Error(`GET calendar fehlgeschlagen: HTTP ${res.status} ${await res.text()}`);
  const data = await res.json();
  const room = data?.data?.find((r: any) => String(r.roomId) === ROOM_ID);
  return room?.calendar?.find((c: any) => c.from === date) ?? null;
}

async function revertOffer(token: string, offerId: number) {
  const enableRes = await fetch(`${BEDS24_API}/properties`, {
    method: 'POST', headers: { token, 'Content-Type': 'application/json' },
    body: JSON.stringify([{ roomTypes: [{ id: ROOM_ID, offers: [{ offerId, enable: 'no' }] }] }]),
  });
  console.log('Revert offers[].enable:', JSON.stringify(await enableRes.json()));

  const ruleRes = await fetch(`${BEDS24_API}/properties`, {
    method: 'POST', headers: { token, 'Content-Type': 'application/json' },
    body: JSON.stringify([{ roomTypes: [{ id: ROOM_ID, priceRules: [{ id: offerId, channels: { [CHANNEL]: { enable: false } } }] }] }]),
  });
  console.log('Revert priceRules[].channels:', JSON.stringify(await ruleRes.json()));
}

async function main() {
  const token = await getAccessToken();

  console.log('\n=== PHASE 1: Baseline ===');
  const baselineConfig = await prisma.beds24Config.findUnique({ where: { hotelId: HOTEL_ID }, select: { connectedChannels: true } });
  const baselineMapping = await prisma.beds24ApartmentMapping.findUnique({ where: { apartmentId: APARTMENT_ID }, select: { channelOfferIds: true } });
  console.log('connectedChannels vorher:', JSON.stringify(baselineConfig?.connectedChannels));
  console.log('channelOfferIds vorher:', JSON.stringify(baselineMapping?.channelOfferIds));
  if (baselineConfig?.connectedChannels || baselineMapping?.channelOfferIds) {
    console.log('ABBRUCH: State ist nicht im erwarteten Ausgangszustand (beides sollte null sein).');
    return;
  }
  const roomBefore = await getRoomState(token);
  console.log('offers vor Provisionierung:', JSON.stringify(roomBefore.offers?.map((o: any) => ({ offerId: o.offerId, enable: o.enable }))));

  console.log('\n=== PHASE 2: connectedChannels = ["airbnb"] setzen ===');
  await prisma.beds24Config.update({ where: { hotelId: HOTEL_ID }, data: { connectedChannels: [CHANNEL] } });

  console.log('\n=== PHASE 3: provisionChannelOffers() — echte Produktionsfunktion ===');
  const provisionResult = await provisionChannelOffers(HOTEL_ID, APARTMENT_ID);
  console.log('Ergebnis:', JSON.stringify(provisionResult, null, 2));
  if (!provisionResult.ok) {
    console.log('ABBRUCH: Provisionierung meldet Konflikte, kein Preis-Test, aber connectedChannels wird trotzdem zurückgesetzt.');
    await prisma.beds24Config.update({ where: { hotelId: HOTEL_ID }, data: { connectedChannels: Prisma.JsonNull } });
    return;
  }
  const offerId = provisionResult.assigned[CHANNEL];
  console.log(`Zugewiesenes Offer für ${CHANNEL}: ${offerId}`);

  console.log('\n=== PHASE 4: Verifikations-GET nach Provisionierung ===');
  const roomAfterProvision = await getRoomState(token);
  const offerState = roomAfterProvision.offers?.find((o: any) => Number(o.offerId) === offerId);
  const ruleState = roomAfterProvision.priceRules?.find((r: any) => Number(r.id) === offerId);
  console.log('Offer-Zustand:', JSON.stringify(offerState));
  console.log('PriceRule-Zustand:', JSON.stringify({ id: ruleState?.id, offer: ruleState?.offer, airbnbChannel: ruleState?.channels?.[CHANNEL] }));
  console.log('offers[].enable == "always":', offerState?.enable === 'always');
  console.log('priceRules[].offer == offerId:', ruleState?.offer === offerId);
  console.log('priceRules[].channels.airbnb.enable == true:', ruleState?.channels?.[CHANNEL]?.enable === true);

  console.log('\n=== PHASE 5: Kanalpreis anlegen + pushen (echte Produktionsfunktion) ===');
  const start = new Date(Date.now() + 400 * 24 * 60 * 60 * 1000);
  const end = new Date(Date.now() + 403 * 24 * 60 * 60 * 1000);
  console.log(`Zeitraum: ${isoDate(start)} bis ${isoDate(end)} (exklusiv), Preis: ${TEST_PRICE}`);

  const range = await prisma.channelPriceRange.create({ data: { apartmentId: APARTMENT_ID, channel: CHANNEL, startDate: start, endDate: end, pricePerNight: TEST_PRICE, name: 'E2E-Test (wird gelöscht)' } });
  const syncError = await pushChannelPriceSync(HOTEL_ID, APARTMENT_ID, CHANNEL, start, end);
  console.log('pushChannelPriceSync Ergebnis (null = Erfolg):', syncError);

  console.log('\n=== PHASE 6: Verifikations-GET Kalender ===');
  const testDate = isoDate(new Date(Date.now() + 401 * 24 * 60 * 60 * 1000));
  const dayAfterPush = await getCalendarDay(token, testDate);
  console.log(`Tag ${testDate} nach Push:`, JSON.stringify(dayAfterPush));
  console.log(`price${offerId} korrekt gesetzt:`, dayAfterPush?.[`price${offerId}`] === TEST_PRICE);

  console.log('\n=== PHASE 7: Kanalpreis wieder löschen (räumt price über null) ===');
  await prisma.channelPriceRange.delete({ where: { id: range.id } });
  const clearError = await pushChannelPriceSync(HOTEL_ID, APARTMENT_ID, CHANNEL, start, end);
  console.log('pushChannelPriceSync (Löschen) Ergebnis (null = Erfolg):', clearError);

  const dayAfterClear = await getCalendarDay(token, testDate);
  console.log(`Tag ${testDate} nach Löschen:`, JSON.stringify(dayAfterClear));
  console.log(`price${offerId} sauber entfernt:`, dayAfterClear?.[`price${offerId}`] == null);

  console.log('\n=== PHASE 8: Offer/Kanal-Routing zurücksetzen ===');
  await revertOffer(token, offerId);
  await prisma.$executeRaw`UPDATE "Beds24ApartmentMapping" SET "channelOfferIds" = NULL WHERE "apartmentId" = ${APARTMENT_ID}`;
  await prisma.$executeRaw`UPDATE "Beds24Config" SET "connectedChannels" = NULL WHERE "hotelId" = ${HOTEL_ID}`;

  console.log('\n=== PHASE 9: Finale Bestätigung ===');
  const roomFinal = await getRoomState(token);
  const offerFinal = roomFinal.offers?.find((o: any) => Number(o.offerId) === offerId);
  const ruleFinal = roomFinal.priceRules?.find((r: any) => Number(r.id) === offerId);
  console.log('Offer final:', JSON.stringify(offerFinal));
  console.log('PriceRule final (airbnb-Kanal):', JSON.stringify(ruleFinal?.channels?.[CHANNEL]));
  console.log('offers[].enable == "no":', offerFinal?.enable === 'no');
  console.log('priceRules[].channels.airbnb.enable == false:', ruleFinal?.channels?.[CHANNEL]?.enable === false);
  console.log('HINWEIS: priceRules-Objekt bleibt als voll expandiertes Objekt bestehen (Beds24 kann einmal materialisierte PriceRules nicht auf den ursprünglichen Bare-Stub zurücksetzen) — funktional aber deaktiviert, gleiches Verhalten wie bei PriceRule 2 im Verifikationstest.');

  const dbConfig = await prisma.beds24Config.findUnique({ where: { hotelId: HOTEL_ID }, select: { connectedChannels: true } });
  const dbMapping = await prisma.beds24ApartmentMapping.findUnique({ where: { apartmentId: APARTMENT_ID }, select: { channelOfferIds: true } });
  const remainingRanges = await prisma.channelPriceRange.count({ where: { apartmentId: APARTMENT_ID } });
  console.log('connectedChannels final (sollte null sein):', JSON.stringify(dbConfig?.connectedChannels));
  console.log('channelOfferIds final (sollte null sein):', JSON.stringify(dbMapping?.channelOfferIds));
  console.log('verbleibende ChannelPriceRange-Zeilen (sollte 0 sein):', remainingRanges);

  console.log('\nFertig.');
}

main()
  .catch((err) => { console.error('FEHLER:', err); process.exitCode = 1; })
  .finally(() => prisma.$disconnect())
  .finally(() => process.exit());

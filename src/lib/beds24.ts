import { randomUUID } from 'crypto';
import { prisma } from '@/src/lib/prisma';

const BEDS24_API = 'https://api.beds24.com/v2';

export type Beds24BookingPayload = {
  roomId: string;
  arrival: string;   // YYYY-MM-DD
  departure: string; // YYYY-MM-DD
  guestName: string;
  guestEmail?: string;
  numAdults?: number;
  numChildren?: number;
  externalRef?: string;
};

// Beds24 v2 booking webhook payload (subset of fields we care about)
export type Beds24WebhookBooking = {
  id?: number;
  roomId?: string | number;
  arrival?: string;   // YYYY-MM-DD
  departure?: string; // YYYY-MM-DD
  status?: string;    // "1"=confirmed, "2"=provisional, "3"=cancelled
  firstName?: string;
  lastName?: string;
  email?: string;
  numAdult?: number;
  numChild?: number;
  guestCountry?: string; // ISO 3166-1 alpha-2 country code
  apiSource?: string; // e.g. "Airbnb", "Booking.com" — the OTA channel a booking came through
};

// Exchange invite code for refresh token (one-time setup)
// Invite codes are generated in Beds24: Einstellungen → Marketplace → API → Invite Code generieren
export async function setupWithInviteCode(inviteCode: string): Promise<{ refreshToken: string; accessToken: string; expiresIn: number }> {
  const res = await fetch(`${BEDS24_API}/authentication/setup`, {
    method: 'GET',
    headers: { 'code': inviteCode.trim() },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Beds24 Setup fehlgeschlagen: HTTP ${res.status} ${text}`);
  }
  const data = await res.json();
  if (!data.refreshToken || !data.token) {
    throw new Error('Beds24: Ungültige Antwort — refreshToken oder token fehlt');
  }
  return { refreshToken: data.refreshToken, accessToken: data.token, expiresIn: data.expiresIn ?? 86400 };
}

// Get an access token for a hotel, reusing the cached one while it's still valid.
// Beds24 access tokens last ~24h; requesting a new one also rotates the refresh token
// (invalidating the old one), so refreshing on every call risks races between concurrent
// requests and burns Beds24 API credits unnecessarily. Only refresh when actually expired.
const EXPIRY_BUFFER_MS = 60 * 60 * 1000; // 1h safety margin under Beds24's actual expiresIn

async function getAccessToken(hotelId: number): Promise<string> {
  const config = await prisma.beds24Config.findUnique({
    where: { hotelId },
    select: { refreshToken: true, accessToken: true, accessTokenExpiresAt: true },
  });
  if (!config) throw new Error(`Beds24: keine Config für Hotel ${hotelId}`);

  if (config.accessToken && config.accessTokenExpiresAt && config.accessTokenExpiresAt.getTime() - EXPIRY_BUFFER_MS > Date.now()) {
    return config.accessToken;
  }

  // Note: the refresh call needs the "refreshToken" header, NOT "token" — "token" is only
  // for authenticated calls made WITH an access token (e.g. GET /bookings).
  const res = await fetch(`${BEDS24_API}/authentication/token`, {
    method: 'GET',
    headers: { 'refreshToken': config.refreshToken },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Beds24 Token-Refresh fehlgeschlagen: HTTP ${res.status} ${text}`);
  }
  const data = await res.json();
  if (!data.token) throw new Error('Beds24: Token-Refresh lieferte kein token');

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

export type Beds24InvoiceItem = {
  type: string;
  description: string;
  amount: number;
  vatRate?: number;
};

export type Beds24PricingSnapshot = {
  source: 'beds24';
  total: number;
  beds24Items: Beds24InvoiceItem[];
  apartments: { apartmentName: string; totalPrice: number; cleaningFee: number }[];
  extrasTotal: number;
  ortstaxeTotal: number;
};

// OTA bookings (Airbnb etc.) often come back with no invoiceItems, or a single lump line
// that doesn't map to room/cleaning — but Beds24 includes a labeled breakdown in
// rateDescription ("Base Price 190 EUR\nCleaning fee 35.00 EUR\n...") we can parse instead.
const RATE_DESCRIPTION_LABELS_DE: Record<string, string> = {
  'base price': 'Zimmerpreis',
  'cleaning fee': 'Endreinigung',
  'city tax': 'Ortstaxe',
  'tourist tax': 'Ortstaxe',
  'ortstaxe': 'Ortstaxe',
  'kurtaxe': 'Kurtaxe',
};

function parseRateDescriptionItems(rateDescription: string): Beds24InvoiceItem[] {
  const items: Beds24InvoiceItem[] = [];
  for (const line of rateDescription.split('\n')) {
    const match = line.trim().match(/^(Base Price|Cleaning fee|City Tax|Tourist Tax|Ortstaxe|Kurtaxe)\s+(-?[\d.,]+)\s*[A-Za-z]{0,3}$/i);
    if (!match) continue;
    const amount = Number(match[2].replace(',', '.'));
    if (!Number.isFinite(amount)) continue;
    const description = RATE_DESCRIPTION_LABELS_DE[match[1].toLowerCase()] ?? match[1];
    items.push({ type: 'rateDescription', description, amount });
  }
  return items;
}

export async function fetchBeds24BookingDetails(
  hotelId: number,
  bookingId: string,
  apartmentName = 'Zimmer',
): Promise<Beds24PricingSnapshot | null> {
  try {
    const accessToken = await getAccessToken(hotelId);
    const url = new URL(`${BEDS24_API}/bookings`);
    url.searchParams.set('bookingId', bookingId);
    url.searchParams.set('includeInvoiceItems', 'true');
    const res = await fetch(url.toString(), { headers: { token: accessToken } });
    if (!res.ok) return null;
    const data = await res.json() as { data?: Record<string, unknown>[] };
    const b = data?.data?.[0];
    if (!b) return null;

    const isCleaning = (item: Beds24InvoiceItem) =>
      /cleaning|reinigung|endreinigung/i.test(item.description) || /cleaning/i.test(item.type);
    const isTouristTax = (item: Beds24InvoiceItem) =>
      /ortstaxe|kurtaxe|tourist|city.?tax|local.?tax/i.test(item.description) ||
      /local_fee|tourist|city_tax/i.test(item.type);
    const isRoom = (item: Beds24InvoiceItem) =>
      /room|zimmer|booking|unterkunft|base price/i.test(item.type) || /room|zimmer|base price/i.test(item.description);

    const rawItems = (Array.isArray(b.invoiceItems) ? b.invoiceItems : []) as Record<string, unknown>[];
    let items: Beds24InvoiceItem[] = rawItems.map((i) => ({
      type: String(i.type ?? ''),
      description: String(i.description ?? ''),
      amount: Number(i.amount ?? 0),
      vatRate: i.vatRate != null ? Number(i.vatRate) : undefined,
    }));

    if (!items.some(isCleaning) && typeof b.rateDescription === 'string') {
      const parsed = parseRateDescriptionItems(b.rateDescription);
      if (parsed.length > 0) items = parsed;
    }

    const invoiceTotal = Number(b.invoiceTotal ?? b.price ?? items.reduce((s, i) => s + i.amount, 0));

    const roomTotal = items.filter((i) => isRoom(i) && !isCleaning(i)).reduce((s, i) => s + i.amount, 0);
    const cleaningFee = items.filter(isCleaning).reduce((s, i) => s + i.amount, 0);
    const ortstaxeTotal = items.filter(isTouristTax).reduce((s, i) => s + i.amount, 0);
    const extrasTotal = items
      .filter((i) => !isRoom(i) && !isCleaning(i) && !isTouristTax(i))
      .reduce((s, i) => s + i.amount, 0);

    return {
      source: 'beds24',
      total: invoiceTotal,
      beds24Items: items,
      apartments: [{ apartmentName, totalPrice: roomTotal + cleaningFee, cleaningFee }],
      extrasTotal,
      ortstaxeTotal,
    };
  } catch {
    return null;
  }
}

// Push a confirmed booking to Beds24 so Airbnb/Booking.com get blocked
export async function pushBooking(hotelId: number, payload: Beds24BookingPayload): Promise<string> {
  const accessToken = await getAccessToken(hotelId);

  const nameParts = payload.guestName.trim().split(/\s+/);
  const firstName = nameParts[0] ?? payload.guestName;
  const lastName = nameParts.slice(1).join(' ') || '-';

  const body = [{
    roomId: payload.roomId,
    arrival: payload.arrival,
    departure: payload.departure,
    firstName,
    lastName,
    email: payload.guestEmail ?? '',
    numAdult: payload.numAdults ?? 1,
    numChild: payload.numChildren ?? 0,
    status: '1', // confirmed
    ...(payload.externalRef ? { apiReference: payload.externalRef } : {}),
  }];

  const res = await fetch(`${BEDS24_API}/bookings`, {
    method: 'POST',
    headers: { 'token': accessToken, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Beds24 pushBooking fehlgeschlagen: HTTP ${res.status} ${text}`);
  }

  const data = await res.json().catch(() => []);
  return String(data?.[0]?.id ?? '');
}

export type Beds24Message = {
  id?: number | string;
  bookingId?: number | string;
  message?: string;
  text?: string;
  source?: 'guest' | 'host' | 'internalNote' | 'system';
};

// Send a host reply to Airbnb/Booking.com through Beds24 (used from the admin chat for OTA bookings)
export async function sendBeds24Message(
  hotelId: number,
  bookingId: string,
  message: string,
): Promise<{ id: string }> {
  const accessToken = await getAccessToken(hotelId);
  const res = await fetch(`${BEDS24_API}/bookings/messages`, {
    method: 'POST',
    headers: { 'token': accessToken, 'Content-Type': 'application/json' },
    body: JSON.stringify([{ bookingId, message, source: 'host' }]),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Beds24 sendMessage fehlgeschlagen: HTTP ${res.status} ${text}`);
  }
  const data = await res.json().catch(() => []);
  return { id: String(data?.[0]?.id ?? data?.data?.[0]?.id ?? '') };
}

// Fetch the message thread for an OTA booking (used by the fallback poll cron)
export async function fetchBeds24Messages(hotelId: number, bookingId: string): Promise<Beds24Message[]> {
  const accessToken = await getAccessToken(hotelId);
  const url = new URL(`${BEDS24_API}/bookings/messages`);
  url.searchParams.set('bookingId', bookingId);
  const res = await fetch(url.toString(), { headers: { token: accessToken } });
  if (!res.ok) return [];
  const data = await res.json().catch(() => ({}));
  return (Array.isArray(data?.data) ? data.data : []) as Beds24Message[];
}

// Saves an inbound Beds24 message (guest or host, from webhook or poll cron) into RequestMessage.
// Dedup is by external Beds24 message id, NOT by sender: Beds24 mirrors the full OTA thread back,
// including messages bookingwulf itself sent via sendBeds24Message (same id → recognized as echo
// and skipped) as well as replies the host typed directly in the Airbnb/Booking.com app (new id →
// saved as a 'hotel' message so the admin chat stays a complete mirror regardless of reply channel).
export async function saveIncomingBeds24Message(bookingId: string, msg: Beds24Message): Promise<boolean> {
  const body = (msg.message ?? msg.text ?? '').trim();
  if (!body) return false;
  if (msg.source === 'internalNote' || msg.source === 'system') return false;

  const request = await prisma.request.findUnique({ where: { beds24BookingId: bookingId }, select: { id: true } });
  if (!request) return false;

  const externalId = msg.id != null ? String(msg.id) : null;
  if (externalId) {
    const existing = await prisma.requestMessage.findFirst({ where: { requestId: request.id, externalId }, select: { id: true } });
    if (existing) return false;
  }

  const sender = msg.source === 'host' ? 'hotel' : 'guest';

  await prisma.requestMessage.create({
    data: { requestId: request.id, sender, channel: 'beds24', externalId, body },
  });
  return true;
}

// List bookings in a date range (by check-in date) — used for one-off backfills, not the
// live sync path (that runs via webhook). Beds24 v2 GET /bookings filters: checkInFrom/checkInTo.
export async function fetchBookingsInRange(
  hotelId: number,
  checkInFrom: string,
  checkInTo: string,
): Promise<Beds24WebhookBooking[]> {
  const accessToken = await getAccessToken(hotelId);
  const url = new URL(`${BEDS24_API}/bookings`);
  url.searchParams.set('checkInFrom', checkInFrom);
  url.searchParams.set('checkInTo', checkInTo);
  const res = await fetch(url.toString(), { headers: { token: accessToken } });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Beds24 fetchBookingsInRange fehlgeschlagen: HTTP ${res.status} ${text}`);
  }
  const data = await res.json().catch(() => ({}));
  return (Array.isArray(data?.data) ? data.data : []) as Beds24WebhookBooking[];
}

async function findExistingBlockId(apartmentId: number, arrival: string, departure: string): Promise<number | null> {
  const existing = await prisma.blockedRange.findFirst({
    where: { apartmentId, startDate: new Date(arrival), endDate: new Date(departure), type: 'beds24_sync' },
    select: { id: true },
  });
  return existing?.id ?? null;
}

export type ProcessBookingResult =
  | 'blocked' | 'cancelled' | 'skipped-incomplete' | 'skipped-no-mapping' | 'skipped-hotel-mismatch';

// Shared per-booking logic for both the live webhook and one-off backfills: maps the Beds24
// room to a local apartment, upserts BlockedRange + Request, and stores a pricing snapshot.
export async function processBeds24Booking(
  booking: Beds24WebhookBooking,
  authorizedHotelId: number,
): Promise<ProcessBookingResult> {
  const roomId = String(booking.roomId ?? '');
  const arrival = booking.arrival;
  const departure = booking.departure;
  // Status comes as a numeric string ("1"/"2"/"3") from the webhook, but as a word
  // ("confirmed"/"cancelled"/...) from GET /bookings — normalize both.
  const status = String(booking.status ?? '1').toLowerCase();
  const isCancelled = status === '3' || status === 'cancelled';

  if (!roomId || !arrival || !departure) return 'skipped-incomplete';

  const mapping = await prisma.beds24ApartmentMapping.findFirst({
    where: { beds24RoomId: roomId },
    select: { apartmentId: true, apartment: { select: { hotelId: true } } },
  });
  if (!mapping) return 'skipped-no-mapping';
  if (mapping.apartment?.hotelId !== authorizedHotelId) return 'skipped-hotel-mismatch';

  if (isCancelled) {
    await prisma.blockedRange.deleteMany({
      where: { type: 'beds24_sync', startDate: new Date(arrival), endDate: new Date(departure), apartmentId: mapping.apartmentId },
    });
    const beds24Id = booking.id ? String(booking.id) : null;
    if (beds24Id) {
      await prisma.request.updateMany({ where: { beds24BookingId: beds24Id }, data: { status: 'cancelled' } });
    }
    return 'cancelled';
  }

  // "[Airbnb] 12345" mirrors the iCal-sync note format so the admin UI can show a channel
  // badge instead of a generic "beds24" label — falls back to a plain note if Beds24 doesn't
  // tell us the source channel.
  const note = booking.apiSource ? `[${booking.apiSource}] ${booking.id ?? roomId}` : `Beds24 sync — booking ${booking.id ?? roomId}`;

  await prisma.blockedRange.upsert({
    where: { id: await findExistingBlockId(mapping.apartmentId, arrival, departure) ?? 0 },
    update: { endDate: new Date(departure), note },
    create: {
      apartmentId: mapping.apartmentId,
      hotelId: authorizedHotelId,
      startDate: new Date(arrival),
      endDate: new Date(departure),
      type: 'beds24_sync',
      note,
    },
  });

  const beds24Id = booking.id ? String(booking.id) : null;
  if (beds24Id) {
    const arrivalDate = new Date(arrival);
    const departureDate = new Date(departure);
    const nights = Math.round((departureDate.getTime() - arrivalDate.getTime()) / 86_400_000);

    await prisma.request.upsert({
      where: { beds24BookingId: beds24Id },
      update: {
        arrival: arrivalDate, departure: departureDate, nights,
        adults: booking.numAdult ?? 1, children: booking.numChild ?? 0,
        selectedApartmentIds: String(mapping.apartmentId),
        firstname: booking.firstName ?? '', lastname: booking.lastName || '—',
        email: booking.email ?? '', country: booking.guestCountry ?? '',
        status: 'booked',
      },
      create: {
        beds24BookingId: beds24Id,
        hotelId: authorizedHotelId,
        arrival: arrivalDate, departure: departureDate, nights,
        adults: booking.numAdult ?? 1, children: booking.numChild ?? 0,
        selectedApartmentIds: String(mapping.apartmentId),
        salutation: '',
        firstname: booking.firstName ?? '', lastname: booking.lastName || '—',
        email: booking.email ?? '', country: booking.guestCountry ?? '',
        status: 'booked', language: 'de', checkinToken: randomUUID(),
      },
    });

    const beds24Config = await prisma.beds24Config.findUnique({ where: { hotelId: authorizedHotelId }, select: { isEnabled: true } });
    if (beds24Config?.isEnabled) {
      const aptName = await prisma.apartment.findUnique({ where: { id: mapping.apartmentId }, select: { name: true } });
      const pricing = await fetchBeds24BookingDetails(authorizedHotelId, beds24Id, aptName?.name ?? 'Zimmer');
      if (pricing) {
        await prisma.request.update({ where: { beds24BookingId: beds24Id }, data: { pricingJson: pricing } });
      }
    }
  }

  return 'blocked';
}

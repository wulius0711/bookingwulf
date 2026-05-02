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
};

// Exchange invite code for refresh token (one-time setup)
// Invite codes are generated in Beds24: Einstellungen → Marketplace → API → Invite Code generieren
export async function setupWithInviteCode(inviteCode: string): Promise<{ refreshToken: string; accessToken: string }> {
  const res = await fetch(`${BEDS24_API}/authentication/setup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ inviteCode: inviteCode.trim() }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Beds24 Setup fehlgeschlagen: HTTP ${res.status} ${text}`);
  }
  const data = await res.json();
  if (!data.refreshToken || !data.token) {
    throw new Error('Beds24: Ungültige Antwort — refreshToken oder token fehlt');
  }
  return { refreshToken: data.refreshToken, accessToken: data.token };
}

// Get a fresh access token from the stored refresh token
// Refresh tokens don't expire as long as they're used within 30 days
async function getAccessToken(refreshToken: string): Promise<string> {
  const res = await fetch(`${BEDS24_API}/authentication/token`, {
    method: 'GET',
    headers: { 'token': refreshToken },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Beds24 Token-Refresh fehlgeschlagen: HTTP ${res.status} ${text}`);
  }
  const data = await res.json();
  if (!data.token) throw new Error('Beds24: Token-Refresh lieferte kein token');
  return data.token;
}

// Push a confirmed booking to Beds24 so Airbnb/Booking.com get blocked
export async function pushBooking(refreshToken: string, payload: Beds24BookingPayload): Promise<string> {
  const accessToken = await getAccessToken(refreshToken);

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

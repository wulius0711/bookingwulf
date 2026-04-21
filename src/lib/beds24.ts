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

export type Beds24AvailabilityBlock = {
  roomId: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
};

function headers(propKey: string, accountKey: string): Record<string, string> {
  return {
    'propKey': propKey,
    'accountKey': accountKey,
    'Content-Type': 'application/json',
  };
}

export async function testConnection(propKey: string, accountKey: string): Promise<{ ok: boolean; info?: string }> {
  try {
    const res = await fetch(`${BEDS24_API}/authentication/setup`, {
      method: 'GET',
      headers: headers(propKey, accountKey),
    });
    if (res.ok) {
      const data = await res.json().catch(() => ({}));
      return { ok: true, info: data?.propInfo?.name };
    }
    return { ok: false, info: `HTTP ${res.status}` };
  } catch (err) {
    return { ok: false, info: String(err) };
  }
}

export async function getAvailability(
  _propKey: string,
  _accountKey: string,
  _roomId: string,
  _from: string,
  _to: string,
): Promise<unknown> {
  throw new Error('[Beds24] getAvailability not yet implemented');
}

export async function setAvailability(
  _propKey: string,
  _accountKey: string,
  _blocks: Beds24AvailabilityBlock[],
): Promise<void> {
  throw new Error('[Beds24] setAvailability not yet implemented');
}

export async function getBookings(
  _propKey: string,
  _accountKey: string,
  _roomId?: string,
): Promise<unknown> {
  throw new Error('[Beds24] getBookings not yet implemented');
}

export async function pushBooking(
  _propKey: string,
  _accountKey: string,
  _payload: Beds24BookingPayload,
): Promise<string> {
  throw new Error('[Beds24] pushBooking not yet implemented');
}

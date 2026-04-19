const NUKI_API = 'https://api.nuki.io';

export interface NukiLock {
  smartlockId: number;
  name: string;
  type: number;
}

export async function getNukiLocks(apiToken: string): Promise<NukiLock[]> {
  const res = await fetch(`${NUKI_API}/smartlock`, {
    headers: { Authorization: `Bearer ${apiToken}` },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Nuki API ${res.status}`);
  return res.json();
}

export async function createNukiCode(
  apiToken: string,
  smartlockId: string,
  guestName: string,
  arrival: Date,
  departure: Date,
  code: number,
): Promise<number> {
  const res = await fetch(`${NUKI_API}/smartlock/${smartlockId}/auth`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: guestName,
      type: 13,
      code,
      allowedFromDate: arrival.toISOString(),
      allowedUntilDate: departure.toISOString(),
      allowedWeekDays: 127,
      timeZoneId: 'Europe/Vienna',
    }),
  });
  if (!res.ok) throw new Error(`Nuki create auth ${res.status}`);
  const data = await res.json();
  return data.id as number;
}

export async function deleteNukiCode(
  apiToken: string,
  smartlockId: string,
  authId: string,
): Promise<void> {
  await fetch(`${NUKI_API}/smartlock/${smartlockId}/auth/${authId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${apiToken}` },
  });
}

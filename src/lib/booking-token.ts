import { createHmac } from 'crypto';

function secret(): string {
  const s = process.env.ADMIN_SESSION_SECRET;
  if (!s) throw new Error('ADMIN_SESSION_SECRET is not set');
  return s;
}

export function generateBookingToken(id: number, createdAt: Date): string {
  return createHmac('sha256', secret())
    .update(`${id}:${createdAt.toISOString()}`)
    .digest('hex')
    .slice(0, 40);
}

export function verifyBookingToken(id: number, createdAt: Date, token: string): boolean {
  const expected = generateBookingToken(id, createdAt);
  return token.length === 40 && token === expected;
}

export function bookingIcalUrl(id: number, createdAt: Date): string {
  const base =
    process.env.NEXT_PUBLIC_BASE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
  const token = generateBookingToken(id, createdAt);
  return `${base}/api/booking-ical?id=${id}&token=${token}`;
}

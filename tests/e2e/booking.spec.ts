import { test, expect } from '@playwright/test';
import { createPool } from './db';
import { TEST_HOTEL_SLUG, TEST_GUEST_EMAIL } from './global-setup';

let pool: ReturnType<typeof createPool>;
let apartmentId: number;

test.beforeAll(async () => {
  pool = createPool();
  const { rows } = await pool.query(
    `SELECT a.id FROM "Apartment" a JOIN "Hotel" h ON h.id = a."hotelId" WHERE h.slug = $1 LIMIT 1`,
    [TEST_HOTEL_SLUG],
  );
  apartmentId = rows[0].id;
});

test.afterAll(async () => {
  await pool.end();
});

test.afterEach(async () => {
  await pool.query(`DELETE FROM "BlockedRange" WHERE "apartmentId" = $1`, [apartmentId]);
  await pool.query(`DELETE FROM "Request" WHERE email = $1`, [TEST_GUEST_EMAIL]);
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (redisUrl && redisToken) {
    await fetch(`${redisUrl}/del/booking:email:${TEST_GUEST_EMAIL}`, {
      headers: { Authorization: `Bearer ${redisToken}` },
    });
  }
});

const ARRIVAL = '2030-01-15';
const DEPARTURE = '2030-01-17';

function basePayload() {
  return {
    hotel: TEST_HOTEL_SLUG,
    email: TEST_GUEST_EMAIL,
    arrival: ARRIVAL,
    departure: DEPARTURE,
    nights: 2,
    adults: 2,
    selected_apartments: String(apartmentId),
    lastname: 'Playwright',
    firstname: 'Test',
    payment_method: 'bank_transfer',
  };
}

test.describe('Booking Flow — Banküberweisung', () => {
  test('Buchungsanfrage wird als "new" gespeichert', async ({ context }) => {
    const res = await context.request.post('/api/request', {
      data: { ...basePayload(), bookingType: 'request' },
    });

    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(typeof body.requestId).toBe('number');

    const { rows } = await pool.query(
      `SELECT status, "paymentMethod" FROM "Request" WHERE id = $1`,
      [body.requestId],
    );
    expect(rows).toHaveLength(1);
    expect(rows[0].status).toBe('new');
    expect(rows[0].paymentMethod).toBe('bank_transfer');
  });

  test('Sofortbuchung wird als "booked" gespeichert', async ({ context }) => {
    const res = await context.request.post('/api/request', {
      data: { ...basePayload(), bookingType: 'booking' },
    });

    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(typeof body.requestId).toBe('number');

    const { rows } = await pool.query(
      `SELECT status, "paymentMethod" FROM "Request" WHERE id = $1`,
      [body.requestId],
    );
    expect(rows).toHaveLength(1);
    expect(rows[0].status).toBe('booked');
    expect(rows[0].paymentMethod).toBe('bank_transfer');
  });

  test('Doppelbuchung für gleiche Daten wird abgelehnt (409)', async ({ context }) => {
    const payload = { ...basePayload(), bookingType: 'booking' };

    const r1 = await context.request.post('/api/request', { data: payload });
    expect(r1.status()).toBe(200);
    expect((await r1.json()).success).toBe(true);

    const r2 = await context.request.post('/api/request', { data: payload });
    expect(r2.status()).toBe(409);
    expect((await r2.json()).success).toBe(false);
  });
});

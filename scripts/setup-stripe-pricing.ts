import 'dotenv/config';
import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) throw new Error('STRIPE_SECRET_KEY ist nicht gesetzt.');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2026-03-25.dahlia' });

const BASE_PLANS = [
  { key: 'STARTER', name: 'bookingwulf Starter', monthly: 2900, yearly: 2600 },
  { key: 'PRO', name: 'bookingwulf Pro', monthly: 5900, yearly: 5300 },
  { key: 'BUSINESS', name: 'bookingwulf Business', monthly: 8900, yearly: 8000 },
] as const;

async function createRecurringPrice(productName: string, unitAmountCents: number, interval: 'month' | 'year') {
  const product = await stripe.products.create({ name: productName });
  const price = await stripe.prices.create({
    product: product.id,
    currency: 'eur',
    // Bei jährlicher Abrechnung wird EINMAL PRO JAHR abgebucht, daher hier den vollen Jahresbetrag (Monats-Äquivalent × 12) verwenden.
    unit_amount: interval === 'year' ? unitAmountCents * 12 : unitAmountCents,
    recurring: { interval },
  });
  return price.id;
}

async function main() {
  const envLines: string[] = [];

  for (const plan of BASE_PLANS) {
    const monthlyId = await createRecurringPrice(`${plan.name} — Grundgebühr (monatlich)`, plan.monthly, 'month');
    const yearlyId = await createRecurringPrice(`${plan.name} — Grundgebühr (jährlich)`, plan.yearly, 'year');
    envLines.push(`STRIPE_PRICE_${plan.key}_BASE=${monthlyId}`);
    envLines.push(`STRIPE_PRICE_${plan.key}_BASE_YEARLY=${yearlyId}`);
  }

  const apartmentMonthlyId = await createRecurringPrice('bookingwulf Apartment-Fee (monatlich)', 1000, 'month');
  const apartmentYearlyId = await createRecurringPrice('bookingwulf Apartment-Fee (jährlich)', 900, 'year');
  envLines.push(`STRIPE_PRICE_APARTMENT=${apartmentMonthlyId}`);
  envLines.push(`STRIPE_PRICE_APARTMENT_YEARLY=${apartmentYearlyId}`);

  console.log('\nNeue Price-IDs erstellt. In .env.local (und Vercel-Env für Production) eintragen:\n');
  console.log(envLines.join('\n'));
  console.log('\nDie alten STRIPE_PRICE_STARTER / _PRO / _BUSINESS (+ _YEARLY) Variablen können danach entfernt werden.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

import Stripe from 'stripe';
import { PLANS, PlanKey } from './plans';

export { PLANS } from './plans';
export type { PlanKey } from './plans';

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) throw new Error('STRIPE_SECRET_KEY is not set');
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2026-03-25.dahlia' });
  }
  return _stripe;
}

export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return (getStripe() as unknown as Record<string | symbol, unknown>)[prop];
  },
});

/** Findet den Plan anhand der Grundgebühr-Price-ID unter allen Line-Items einer Subscription (die Apartment-Fee-Price-ID ist planübergreifend identisch und daher nicht aussagekräftig). */
export function getPlanFromPriceIds(priceIds: string[]): PlanKey {
  const priceMap: Record<string, PlanKey> = {
    [process.env.STRIPE_PRICE_STARTER_BASE ?? '']: 'starter',
    [process.env.STRIPE_PRICE_PRO_BASE ?? '']: 'pro',
    [process.env.STRIPE_PRICE_BUSINESS_BASE ?? '']: 'business',
    [process.env.STRIPE_PRICE_STARTER_BASE_YEARLY ?? '']: 'starter',
    [process.env.STRIPE_PRICE_PRO_BASE_YEARLY ?? '']: 'pro',
    [process.env.STRIPE_PRICE_BUSINESS_BASE_YEARLY ?? '']: 'business',
  };
  const match = priceIds.find((id) => priceMap[id]);
  return match ? priceMap[match] : 'starter';
}

export function getPriceId(plan: PlanKey, interval: 'month' | 'year' = 'month'): string {
  if (interval === 'year') {
    const map: Record<PlanKey, string> = {
      starter: process.env.STRIPE_PRICE_STARTER_BASE_YEARLY ?? '',
      pro: process.env.STRIPE_PRICE_PRO_BASE_YEARLY ?? '',
      business: process.env.STRIPE_PRICE_BUSINESS_BASE_YEARLY ?? '',
      bundle_all: process.env.STRIPE_PRICE_BUNDLE_BASE_YEARLY ?? '',
    };
    return map[plan];
  }
  const map: Record<PlanKey, string> = {
    starter: process.env.STRIPE_PRICE_STARTER_BASE ?? '',
    pro: process.env.STRIPE_PRICE_PRO_BASE ?? '',
    business: process.env.STRIPE_PRICE_BUSINESS_BASE ?? '',
    bundle_all: process.env.STRIPE_PRICE_BUNDLE_BASE ?? '',
  };
  return map[plan];
}

/** Gemeinsame Apartment-Fee-Price-ID (10€/Monat, gleich für Starter/Pro/Business) für das gewünschte Abrechnungsintervall. */
export function getApartmentPriceId(interval: 'month' | 'year' = 'month'): string {
  return interval === 'year'
    ? process.env.STRIPE_PRICE_APARTMENT_YEARLY ?? ''
    : process.env.STRIPE_PRICE_APARTMENT ?? '';
}

/** Alle bekannten Apartment-Fee-Price-IDs (monatlich + jährlich), zum Wiedererkennen eines Subscription-Items. */
export function getApartmentPriceIds(): string[] {
  return [process.env.STRIPE_PRICE_APARTMENT, process.env.STRIPE_PRICE_APARTMENT_YEARLY].filter(
    (id): id is string => Boolean(id)
  );
}

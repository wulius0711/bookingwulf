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

export function getPlanFromPriceId(priceId: string): PlanKey {
  const priceMap: Record<string, PlanKey> = {
    [process.env.STRIPE_PRICE_STARTER ?? '']: 'starter',
    [process.env.STRIPE_PRICE_PRO ?? '']: 'pro',
    [process.env.STRIPE_PRICE_BUSINESS ?? '']: 'business',
    [process.env.STRIPE_PRICE_STARTER_YEARLY ?? '']: 'starter',
    [process.env.STRIPE_PRICE_PRO_YEARLY ?? '']: 'pro',
    [process.env.STRIPE_PRICE_BUSINESS_YEARLY ?? '']: 'business',
  };
  return priceMap[priceId] ?? 'starter';
}

export function getPriceId(plan: PlanKey, interval: 'month' | 'year' = 'month'): string {
  if (interval === 'year') {
    const map: Record<PlanKey, string> = {
      starter: process.env.STRIPE_PRICE_STARTER_YEARLY ?? '',
      pro: process.env.STRIPE_PRICE_PRO_YEARLY ?? '',
      business: process.env.STRIPE_PRICE_BUSINESS_YEARLY ?? '',
    };
    return map[plan];
  }
  const map: Record<PlanKey, string> = {
    starter: process.env.STRIPE_PRICE_STARTER ?? '',
    pro: process.env.STRIPE_PRICE_PRO ?? '',
    business: process.env.STRIPE_PRICE_BUSINESS ?? '',
  };
  return map[plan];
}

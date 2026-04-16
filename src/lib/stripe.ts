import Stripe from 'stripe';

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) throw new Error('STRIPE_SECRET_KEY is not set');
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2026-03-25.dahlia' });
  }
  return _stripe;
}

// Keep named export for convenience — resolved lazily at call time
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return (getStripe() as unknown as Record<string | symbol, unknown>)[prop];
  },
});

export const PLANS = {
  starter: {
    name: 'Starter',
    priceId: process.env.STRIPE_PRICE_STARTER!,
    maxApartments: 5,
    maxUsers: 1,
    features: ['Bis zu 5 Apartments', '1 Admin-User', 'Standard-Branding', 'E-Mail-Benachrichtigungen'],
  },
  pro: {
    name: 'Pro',
    priceId: process.env.STRIPE_PRICE_PRO!,
    maxApartments: 20,
    maxUsers: 3,
    features: ['Bis zu 20 Apartments', '3 Admin-User', 'Volles Branding', 'Konfigurierbare Extras', 'Preissaisons'],
  },
  business: {
    name: 'Business',
    priceId: process.env.STRIPE_PRICE_BUSINESS!,
    maxApartments: Infinity,
    maxUsers: Infinity,
    features: ['Unlimitierte Apartments', 'Unlimitierte User', 'Custom Domain', 'Analytics', 'Priority Support'],
  },
} as const;

export type PlanKey = keyof typeof PLANS;

export function getPlanFromPriceId(priceId: string): PlanKey {
  for (const [key, plan] of Object.entries(PLANS)) {
    if (plan.priceId === priceId) return key as PlanKey;
  }
  return 'starter';
}

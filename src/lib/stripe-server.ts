import Stripe from 'stripe';

export function getStripe(secretKey: string) {
  return new Stripe(secretKey);
}

export async function createPaymentIntent(
  secretKey: string,
  amountEur: number,
  metadata: Record<string, string>,
): Promise<{ clientSecret: string; paymentIntentId: string }> {
  const stripe = getStripe(secretKey);
  const pi = await stripe.paymentIntents.create({
    amount: Math.round(amountEur * 100),
    currency: 'eur',
    metadata,
    automatic_payment_methods: { enabled: true, allow_redirects: 'never' },
  });
  return { clientSecret: pi.client_secret!, paymentIntentId: pi.id };
}

export async function retrievePaymentIntent(secretKey: string, paymentIntentId: string) {
  return getStripe(secretKey).paymentIntents.retrieve(paymentIntentId);
}

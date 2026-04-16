export const PLANS = {
  starter: {
    name: 'Starter',
    priceEur: '49',
    maxApartments: 5,
    maxUsers: 1,
    features: ['Bis zu 5 Apartments', '1 Admin-User', 'Standard-Branding', 'E-Mail-Benachrichtigungen'],
  },
  pro: {
    name: 'Pro',
    priceEur: '99',
    maxApartments: 20,
    maxUsers: 3,
    features: ['Bis zu 20 Apartments', '3 Admin-User', 'Volles Branding', 'E-Mail-Benachrichtigungen', 'Konfigurierbare Extras', 'Preissaisons'],
  },
  business: {
    name: 'Business',
    priceEur: '199',
    maxApartments: Infinity,
    maxUsers: Infinity,
    features: ['Alles aus Pro', 'Unlimitierte Apartments', 'Unlimitierte User', 'Custom Domain', 'Analytics', 'Priority Support'],
  },
} as const;

export type PlanKey = keyof typeof PLANS;

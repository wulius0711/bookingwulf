export const PLANS = {
  starter: {
    name: 'Starter',
    priceMonthly: 55,
    priceYearly: 49,
    maxApartments: 5,
    maxUsers: 1,
    maxHotels: 1,
    features: ['Bis zu 5 Apartments', '1 Admin-User', 'Basis Branding', 'E-Mail-Benachrichtigungen'],
  },
  pro: {
    name: 'Pro',
    priceMonthly: 109,
    priceYearly: 99,
    maxApartments: 20,
    maxUsers: 3,
    maxHotels: 1,
    features: ['Bis zu 20 Apartments', '3 Admin-User', 'Erweitertes Branding', 'Anpassbare E-Mail-Texte', 'Konfigurierbare Zusatzleistungen', 'Preissaisons', 'Widget doppelt einsetzbar – für Anfrage & Buchung'],
  },
  business: {
    name: 'Business',
    priceMonthly: 217,
    priceYearly: 199,
    maxApartments: Infinity,
    maxUsers: Infinity,
    maxHotels: 2,
    features: ['Alles aus Pro', 'Volles Branding', 'Ohne bookingwulf-Logo', 'Direktnachrichten an Gäste', 'Bis zu 2 Hotelanlagen', 'Unlimitierte Apartments', 'Unlimitierte User', 'Analytics', 'Priority Support'],
  },
} as const;

export type PlanKey = keyof typeof PLANS;

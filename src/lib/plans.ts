export const PLANS = {
  starter: {
    name: 'Starter',
    priceMonthly: 59,
    priceYearly: 54,
    maxApartments: 5,
    maxUsers: 1,
    maxHotels: 1,
    features: ['Bis zu 5 Apartments', '1 Admin-User', 'Basis Branding', 'E-Mail-Benachrichtigungen', 'Zimmerplan'],
  },
  pro: {
    name: 'Pro',
    priceMonthly: 119,
    priceYearly: 109,
    maxApartments: 20,
    maxUsers: 3,
    maxHotels: 1,
    features: ['Alles aus Starter', 'Bis zu 20 Apartments', '3 Admin-User', 'Erweitertes Branding', 'Anpassbare E-Mail-Texte', 'Konfigurierbare Zusatzleistungen', 'Preissaisons & Mindestaufenthalt', 'Last-Minute Rabatt', 'Nuki-Integration', 'Widget doppelt einsetzbar – für Anfrage & Buchung'],
  },
  business: {
    name: 'Business',
    priceMonthly: 249,
    priceYearly: 229,
    maxApartments: Infinity,
    maxUsers: Infinity,
    maxHotels: 2,
    features: ['Alles aus Pro', 'Bis zu 2 Hotelanlagen', 'Unlimitierte Apartments', 'Unlimitierte User', 'Belegungsbasierter Preisaufschlag', 'Volles Branding', 'Ohne bookingwulf-Logo', 'Direktnachrichten an Gäste', 'Analytics', 'Priority Support'],
  },
} as const;

export type PlanKey = keyof typeof PLANS;

export const PLANS = {
  starter: {
    name: 'Starter',
    priceMonthly: 59,
    priceYearly: 54,
    maxApartments: 3,
    maxUsers: 1,
    maxHotels: 1,
    features: ['Bis zu 3 Apartments', '1 Admin-User', 'Basis Branding', 'E-Mail-Benachrichtigungen', 'Zimmerplan', 'Online Check-in für Gäste'],
  },
  pro: {
    name: 'Pro',
    priceMonthly: 119,
    priceYearly: 109,
    maxApartments: 15,
    maxUsers: 3,
    maxHotels: 1,
    features: ['Alles aus Starter', 'Bis zu 15 Apartments', '3 Admin-User', 'Erweitertes Branding', 'Anpassbare E-Mail-Texte', 'Konfigurierbare Zusatzleistungen', 'Preissaisons & Mindestaufenthalt', 'Last-Minute Rabatt', 'Lücken-Rabatt', 'Nuki-Integration', 'Widget doppelt einsetzbar – für Anfrage & Buchung', 'KI-Assistent im Admin'],
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

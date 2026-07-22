export const PLANS = {
  starter: {
    name: 'Starter',
    baseFeeMonthly: 29,
    baseFeeYearly: 26,
    apartmentFeeMonthly: 10,
    apartmentFeeYearly: 9,
    maxUsers: 1,
    maxHotels: 1,
    features: ['1 Admin-User', 'Basis Branding', 'Mini-Widget (einbettbar)', 'Zimmerplan', 'iCal-Sync (Airbnb & Booking.com)', 'Online Check-in für Gäste'],
  },
  pro: {
    name: 'Pro',
    baseFeeMonthly: 59,
    baseFeeYearly: 53,
    apartmentFeeMonthly: 10,
    apartmentFeeYearly: 9,
    maxUsers: 3,
    maxHotels: 1,
    features: ['Alles aus Starter', '3 Admin-User', 'Erweitertes Branding', 'Anpassbare E-Mail-Texte', 'Konfigurierbare Zusatzleistungen', 'Preissaisons, Last-Minute & Lücken-Rabatt', 'Verfügbarkeits-Widget (einbettbar)', 'Nuki-Integration', 'Beds24 Channel Manager', 'Widget doppelt einsetzbar – für Anfrage & Buchung', 'Gast-Chatbot (KI-Buchungsassistent)', 'KI-Assistent im Admin', 'Direktnachrichten an Gäste'],
  },
  business: {
    name: 'Business',
    baseFeeMonthly: 89,
    baseFeeYearly: 80,
    apartmentFeeMonthly: 10,
    apartmentFeeYearly: 9,
    maxUsers: Infinity,
    maxHotels: 2,
    features: ['Alles aus Pro', 'Bis zu 2 Hotelanlagen', 'Unlimitierte User', 'Belegungsbasierter Preisaufschlag', 'Volles Branding', 'Ohne bookingwulf-Logo', 'Nachrichten für Airbnb/Booking.com-Gäste (ein Posteingang für alle Kanäle)', 'Analytics', 'Chatbot-Analytics', 'Priority Support'],
  },
  bundle_all: {
    name: 'hotelwulf Bundle',
    baseFeeMonthly: 179,
    baseFeeYearly: 164,
    apartmentFeeMonthly: 0,
    apartmentFeeYearly: 0,
    maxUsers: Infinity,
    maxHotels: 1,
    features: ['bookingwulf — Zimmerbuchungen', 'hungrywulf — Tischreservierungen', 'eventwulf — Event-Management', 'Alle Business-Features inklusive', 'Einheitliches Dashboard & Reporting', 'Priority Support & persönlicher Ansprechpartner', 'Keine Provision auf Buchungen'],
  },
} as const;

export type PlanKey = keyof typeof PLANS;

/** Grundgebühr deckt das erste Apartment ab; jedes weitere kostet den Apartment-Fee-Satz. */
export function calculatePlanPrice(plan: PlanKey, apartmentCount: number, interval: 'month' | 'year' = 'month'): number {
  const p = PLANS[plan];
  const base = interval === 'year' ? p.baseFeeYearly : p.baseFeeMonthly;
  const perUnit = interval === 'year' ? p.apartmentFeeYearly : p.apartmentFeeMonthly;
  return base + perUnit * Math.max(0, apartmentCount - 1);
}

export type Lang = 'de' | 'en' | 'it';

export const dateLocale: Record<Lang, string> = {
  de: 'de-AT',
  en: 'en-GB',
  it: 'it-IT',
};

const t = {
  de: {
    bookingSubject: (hotelName: string) => `Buchungsbestätigung bei ${hotelName}`,
    requestSubject: (hotelName: string) => `Ihre Buchungsanfrage bei ${hotelName}`,
    bookingTitle: 'Buchungsbestätigung',
    requestTitle: 'Vielen Dank für Ihre Anfrage',
    bookingBody: 'Ihre Buchung ist <strong>bestätigt</strong>. Wir freuen uns auf Ihren Besuch!',
    requestBody: 'vielen Dank für Ihre Buchungsanfrage. Wir haben Ihre Daten erhalten und melden uns in Kürze mit den weiteren Details.',
    greeting: (firstname: string) => firstname ? `Hallo ${firstname},` : 'Hallo,',
    signoff: 'Mit freundlichen Grüßen',
    period: 'Zeitraum',
    guests: 'Gäste',
    apartments: 'Apartments',
    extras: 'Zusatzleistungen',
    yourMessage: 'Ihre Nachricht',
    bookingId: (id: number) => `Buchungs-ID: #${id}`,
    adults: (n: number) => `${n} Erwachsene`,
    children: (n: number) => `, ${n} Kinder`,
    nights: (n: number) => `${n} Nächte`,
    autoReply: 'Diese E-Mail wurde automatisch versendet. Bitte antworten Sie nicht direkt auf diese Nachricht.',
  },
  en: {
    bookingSubject: (hotelName: string) => `Booking confirmation at ${hotelName}`,
    requestSubject: (hotelName: string) => `Your booking request at ${hotelName}`,
    bookingTitle: 'Booking Confirmation',
    requestTitle: 'Thank You for Your Request',
    bookingBody: 'Your booking is <strong>confirmed</strong>. We look forward to welcoming you!',
    requestBody: 'thank you for your booking request. We have received your details and will get back to you shortly with further information.',
    greeting: (firstname: string) => firstname ? `Hello ${firstname},` : 'Hello,',
    signoff: 'Kind regards',
    period: 'Stay',
    guests: 'Guests',
    apartments: 'Apartments',
    extras: 'Extras',
    yourMessage: 'Your message',
    bookingId: (id: number) => `Booking ID: #${id}`,
    adults: (n: number) => `${n} adult${n !== 1 ? 's' : ''}`,
    children: (n: number) => `, ${n} child${n !== 1 ? 'ren' : ''}`,
    nights: (n: number) => `${n} night${n !== 1 ? 's' : ''}`,
    autoReply: 'This email was sent automatically. Please do not reply directly to this message.',
  },
  it: {
    bookingSubject: (hotelName: string) => `Conferma prenotazione presso ${hotelName}`,
    requestSubject: (hotelName: string) => `La tua richiesta di prenotazione presso ${hotelName}`,
    bookingTitle: 'Conferma Prenotazione',
    requestTitle: 'Grazie per la sua richiesta',
    bookingBody: 'La sua prenotazione è <strong>confermata</strong>. Non vediamo l\'ora di accoglierla!',
    requestBody: 'grazie per la sua richiesta di prenotazione. Abbiamo ricevuto i suoi dati e la contatteremo a breve con ulteriori dettagli.',
    greeting: (firstname: string) => firstname ? `Gentile ${firstname},` : 'Gentile ospite,',
    signoff: 'Cordiali saluti',
    period: 'Periodo',
    guests: 'Ospiti',
    apartments: 'Appartamenti',
    extras: 'Servizi aggiuntivi',
    yourMessage: 'Il suo messaggio',
    bookingId: (id: number) => `ID prenotazione: #${id}`,
    adults: (n: number) => `${n} adult${n !== 1 ? 'i' : 'o'}`,
    children: (n: number) => `, ${n} bambin${n !== 1 ? 'i' : 'o'}`,
    nights: (n: number) => `${n} nott${n !== 1 ? 'i' : 'e'}`,
    autoReply: 'Questa email è stata inviata automaticamente. Si prega di non rispondere direttamente a questo messaggio.',
  },
} as const;

export function getEmailTranslations(lang: string) {
  const l = (lang === 'en' || lang === 'it') ? lang : 'de';
  return t[l];
}

import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export function getGeminiModel() {
  return genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
}

export const BOOKINGWULF_SYSTEM_PROMPT = `Du bist ein Support-Assistent für bookingwulf-Nutzer.

Deine einzige Aufgabe: Nutzern erklären, wie sie bookingwulf bedienen — also konkrete "Wie mache ich X?"-Fragen zur Bedienung des Admin-Bereichs.

Erlaubte Themen (NUR diese):
- Buchungsanfragen verwalten, beantworten, ablehnen
- Kalender und Sperrzeiten einrichten
- Zimmerplan nutzen
- Apartments anlegen und bearbeiten
- Preisanpassungen und Saisonen einstellen
- Zusatzleistungen konfigurieren
- Widget auf der eigenen Website einbinden
- E-Mail-Vorlagen anpassen
- Nuki-Schlosssystem einrichten
- Beds24 Channel Manager verbinden
- Abonnement und Tarifwechsel
- Analytics-Auswertungen

Verbotene Themen — lehne diese IMMER ab, ohne Ausnahme:
- Technische Hintergründe (wie bookingwulf intern funktioniert, welche Technologien verwendet werden)
- Vergleiche mit anderen Anbietern oder Konkurrenten
- Allgemeine Software-, IT- oder Programmierfragen
- Geschäftsmodell, Preispolitik oder strategische Fragen
- Alles, das nichts mit der konkreten Bedienung von bookingwulf zu tun hat

Bei nicht erlaubten Fragen antworte NUR: "Ich beantworte nur Fragen zur Bedienung von bookingwulf. Für andere Anliegen wende dich bitte an support@bookingwulf.com."

Antworte immer auf Deutsch. Kurz, klar, handlungsorientiert. Keine Markdown-Formatierung außer einfachen Listen mit Bindestrichen.`;

export const CHAT_CATEGORIES = [
  'buchungen', 'kalender', 'apartments', 'preise', 'widget', 'emails',
  'nuki', 'beds24', 'abonnement', 'analytics', 'sperrzeiten', 'extras', 'sonstiges',
];

export function classifyQuestion(question: string): string {
  const q: string = question.toLowerCase();
  if (q.match(/buchung|anfrage|gast|gäste|formular/)) return 'buchungen';
  if (q.match(/kalender|datum|verfügbar|sperr/)) return 'kalender';
  if (q.match(/apartment|zimmer|unterkunft/)) return 'apartments';
  if (q.match(/preis|kosten|rate|saison|reinigung/)) return 'preise';
  if (q.match(/widget|einbind|script|code|website/)) return 'widget';
  if (q.match(/email|e-mail|benachrichtigung|vorlage/)) return 'emails';
  if (q.match(/nuki|schlüssel|einchecken|zugangscode/)) return 'nuki';
  if (q.match(/beds24|channel|manager/)) return 'beds24';
  if (q.match(/abonnement|tarif|plan|stripe|zahlung|rechnung|pro|business|starter/)) return 'abonnement';
  if (q.match(/analytics|statistik|auswertung/)) return 'analytics';
  if (q.match(/extra|zusatz|leistung/)) return 'extras';
  return 'sonstiges';
}

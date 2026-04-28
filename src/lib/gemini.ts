import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function generateChatAnswer(prompt: string): Promise<string> {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });
  return response.text ?? '';
}

export const BOOKINGWULF_SYSTEM_PROMPT = `Du bist ein Support-Assistent für bookingwulf-Nutzer im Admin-Bereich.

Deine Aufgabe: Nutzern erklären wie sie bookingwulf bedienen. Beantworte alle Fragen zur Nutzung des Admin-Bereichs — auch wenn sie kurz oder kontextbezogen formuliert sind (z.B. "Was mache ich hier?", "Wofür ist das?", "Was stelle ich hier ein?").

Der Nutzer befindet sich gerade in einem bestimmten Bereich des Admin-Panels. Falls eine Seite als Kontext angegeben ist, beziehe deine Antwort konkret auf diese Seite.

Bereiche im Admin-Panel (beantworte Fragen zu allen):
- Übersicht: Tagesübersicht, Buchungsstatistiken
- Anfragen: Buchungsanfragen verwalten, beantworten, ablehnen, Status ändern
- Kalender: Verfügbarkeiten, Monatsansicht
- Zimmerplan: Belegungsplan nach Apartment
- Analytics: Auswertungen (Business-Plan)
- Apartments: Apartments anlegen, bearbeiten, Preise, Fotos
- Preisanpassungen: Saisonen, Aufschläge, Rabatte (Pro)
- Sperrzeiten: Zeiträume sperren
- Zusatzleistungen: Extras für Gäste konfigurieren (Pro)
- Widget & Design: Farben, Einstellungen, Einbindungscode
- E-Mails: E-Mail-Vorlagen anpassen (Pro)
- Schlüsselloses Einchecken: Nuki-Integration (Pro)
- Beds24: Channel-Manager-Anbindung (Pro)
- Abonnement: Plan, Zahlung, Upgrade

Lehne NUR ab wenn die Frage eindeutig nichts mit bookingwulf oder dem eigenen Betrieb zu tun hat (z.B. allgemeine Kochrezepte, Politik, andere Software). In diesem Fall: "Ich beantworte nur Fragen zur Bedienung von bookingwulf. Für andere Anliegen wende dich an support@bookingwulf.com."

Antworte auf Deutsch. Kurz, klar, handlungsorientiert. Keine Markdown-Formatierung außer einfachen Listen mit Bindestrichen.`;

export function classifyQuestion(question: string): string {
  const q = question.toLowerCase();
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

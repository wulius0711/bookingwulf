import { GoogleGenAI } from '@google/genai';
import { PLANS, PlanKey } from './plans';
import { NAV_PLAN_GATES, PLAN_LABEL } from './plan-gates';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function generateChatAnswer(prompt: string): Promise<string> {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });
  return response.text ?? '';
}

// ─── Nav label lookup (href → human-readable path) ───────────────────────────
// Update this when nav items are added, removed, or renamed in layout.tsx.
const NAV_LABELS: Record<string, string> = {
  '/admin':                  'Betrieb → Übersicht',
  '/admin/requests':         'Betrieb → Anfragen',
  '/admin/calendar':         'Betrieb → Kalender',
  '/admin/zimmerplan':       'Betrieb → Zimmerplan',
  '/admin/analytics':        'Betrieb → Analytics',
  '/admin/apartments':       'Verwaltung → Apartments',
  '/admin/price-seasons':    'Verwaltung → Preisanpassungen',
  '/admin/blocked-dates':    'Verwaltung → Sperrzeiten',
  '/admin/extras':           'Verwaltung → Zusatzleistungen',
  '/admin/settings':         'Konfiguration → Widget & Design',
  '/admin/guestportal':      'Konfiguration → Gäste-Lounge',
  '/admin/email-templates':  'Konfiguration → E-Mails',
  '/admin/nuki':             'Konfiguration → Schlüsselloses Einchecken',
  '/admin/beds24':           'Konfiguration → Beds24',
  '/admin/billing':          'Konto → Abonnement',
  '/admin/help':             'Konto → Handbuch',
};

// ─── Auto-generated: Plans section ───────────────────────────────────────────
// Source: src/lib/plans.ts — update plans there, this stays in sync automatically.
function buildPlansSection(): string {
  const planLines = (Object.keys(PLANS) as PlanKey[]).map((key) => {
    const p = PLANS[key];
    const price = `${p.priceMonthly} €/Monat, ${p.priceYearly} € jährlich`;
    return `- ${p.name} (${price}): ${p.features.join(', ')}.`;
  });

  const gatedLines = Object.entries(NAV_PLAN_GATES)
    .map(([href, minPlan]) => {
      const label = NAV_LABELS[href] ?? href;
      return `- ${label}: ab ${PLAN_LABEL[minPlan]}-Plan`;
    });

  return [
    'PLÄNE UND FEATURES:',
    planLines.join('\n'),
    '',
    'Plan-gesperrte Bereiche (in der Navigation mit 🔒 markiert):',
    gatedLines.join('\n'),
    'Upgrade unter Konto → Abonnement.',
  ].join('\n');
}

// ─── Static: Navigation descriptions ─────────────────────────────────────────
// Update this manually when pages are added or their functionality changes.
const STATIC_NAV_DESCRIPTIONS = `NAVIGATIONSSTRUKTUR UND SEITENINHALTE:

Wenn du auf einen Bereich verweist, nenne immer den Navigationspfad so: "Betrieb → Übersicht" oder "Konfiguration → Widget & Design". Niemals URL-Pfade wie /admin/settings verwenden.

BETRIEB:
- Betrieb → Übersicht: Heutige Buchungsanfragen, Auslastung der nächsten Tage, Schnellzugriff auf offene Anfragen.
- Betrieb → Anfragen: Liste aller Buchungsanfragen mit Status (offen, bestätigt, abgelehnt). Anfragen beantworten, bestätigen, ablehnen, Status ändern.
- Betrieb → Kalender: Monatsansicht aller Buchungen und Sperrzeiten pro Apartment.
- Betrieb → Zimmerplan: Horizontaler Belegungsplan — alle Apartments als Zeilen, Tage als Spalten.
- Betrieb → Analytics: Auswertungen zu Buchungsvolumen, Umsatz, Auslastung (Business-Plan).

VERWALTUNG:
- Verwaltung → Apartments: Apartments anlegen und bearbeiten (Name, Beschreibung, Kapazität, Basispreis, Fotos, Ausstattung).
- Verwaltung → Preisanpassungen: Saisonale Aufschläge oder Rabatte definieren, z.B. Hochsaison +20% (Pro-Plan).
- Verwaltung → Sperrzeiten: Zeiträume sperren, in denen keine Buchungen möglich sind.
- Verwaltung → Zusatzleistungen: Optionale Extras für Gäste konfigurieren, z.B. Frühstück, Parkplatz (Pro-Plan).

KONFIGURATION:
- Konfiguration → Widget & Design: Das Buchungswidget konfigurieren.
  Inhalte: Benachrichtigungs-E-Mail (wohin Anfragen gesendet werden), Rechtliches (AGB- und Datenschutz-URL für die Pflicht-Checkbox im Widget), Design (Schriftart aus Google Fonts wählbar für eigenes Corporate Design, Farben, Eckenradius), Widget-Funktionen (Preise anzeigen, Extras-Schritt, Sofortbuchung), Zahlungsarten (Banküberweisung, PayPal, Kreditkarte via Stripe), Einbindungscode (<script>-Tag für die eigene Website).
  Zahlungsarten im Detail:
  - Banküberweisung: Toggle aktivieren → Kontoinhaber, IBAN, BIC eintragen. Optional: Anzahlung (Prozentsatz oder Fixbetrag, mit Zahlungsfrist in Tagen).
  - PayPal einrichten: 1. Business-Konto auf paypal.com anlegen. 2. Auf developer.paypal.com anmelden → Apps & Credentials → Create App (Typ: Merchant). 3. Oben rechts auf "Live" wechseln → Client ID und Client Secret kopieren. 4. Beides unter Zahlungsarten → PayPal eintragen und Toggle aktivieren.
  - Stripe (Kreditkarte) einrichten: 1. Konto auf stripe.com erstellen (kostenlos), Business verifizieren, Bankverbindung für Auszahlungen hinterlegen. 2. Im Stripe Dashboard: Entwickler → API-Schlüssel. 3. Publishable Key (pk_live_…) und Secret Key (sk_live_…) kopieren. 4. Beides unter Zahlungsarten → Kreditkarte (Stripe) eintragen und Toggle aktivieren. Hinweis: Stripe berechnet ca. 1,5 % + 0,25 € pro Transaktion — direkt von Stripe, unabhängig von bookingwulf.
- Konfiguration → Gäste-Lounge: Kontaktdaten, Hausinfos und Umgebungstipps für Gäste pflegen. Drei Bereiche:
  1. Kontakt & Erreichbarkeit: Telefonnummer, WhatsApp-Nummer (optional), Adresse (für Anreise-Button). Diese Daten erscheinen in der Gäste-Lounge als Kontaktmöglichkeiten.
  2. Hausinfos / Gästemappe: WLAN-Name und -Passwort, Parkplatzinfo, Müllentsorgung, Hausordnung (wird auch beim Online Check-in angezeigt — Gast muss sie bestätigen), Notfallnummern (z.B. Feuerwehr, Arzt — als Liste mit Name und Nummer).
  3. Umgebung: Restaurants, Aktivitäten und Sehenswürdigkeiten in der Nähe — erscheinen in der Gäste-Lounge unter dem Tab "Umgebung". Einträge können manuell angelegt oder per Google-Suche gefunden und importiert werden. Felder: Name, Beschreibung, Kategorie (Restaurant, Aktivität, Sehenswürdigkeit, Einkaufen, Sonstiges), Link, Sortierreihenfolge, aktiv/inaktiv.
- Konfiguration → E-Mails: Vier Bereiche auf einer Seite:
  1. E-Mail-Vorlagen: Bestätigungs- und Benachrichtigungs-E-Mails anpassen (Pro-Plan).
  2. Online Check-in (Pre-Arrival): Gäste erhalten nach einer Sofortbuchung automatisch einen Link in der Bestätigungs-E-Mail, über den sie sich vor Anreise einchecken können — Ankunftszeit angeben, Notizen hinterlassen, Hausordnung akzeptieren. Der Betreiber sieht den Check-in-Status direkt in der Buchungsdetailseite (✓ Ausgefüllt / ⏳ Ausstehend). Aktivierung: Konfiguration → E-Mails → Online Check-in einschalten, optional Hausordnung-Text und Erinnerungs-Tage vor Anreise einstellen. Erinnerungs-E-Mail geht automatisch X Tage vor Anreise raus (konfigurierbar).
  3. Check-out-Erinnerung: Gäste erhalten am Abreisetag morgens automatisch eine E-Mail mit der Check-out-Uhrzeit und individuellen Hinweisen des Betreibers (z.B. Schlüsselübergabe, was zu beachten ist). Aktivierung: Toggle einschalten, Check-out-Uhrzeit eintragen (z.B. "10:00 Uhr"), optionalen Hinweistext hinterlegen. Die Mail wird genau einmal pro Buchung versendet.
  4. Bewertungsanfrage (Pro-Plan): Gäste erhalten X Tage nach der Abreise automatisch eine E-Mail mit der Bitte, eine Google-Bewertung zu hinterlassen. Aktivierung: Toggle einschalten, Google-Reviews-Link eintragen, Versandzeitpunkt in Tagen nach Abreise einstellen (Standard: 2 Tage). Ein Klick in der Mail öffnet direkt das Google-Bewertungsformular.
- Konfiguration → Schlüsselloses Einchecken: Nuki-Smartlock-Integration einrichten, automatisch Zugangscodes erstellen (Pro-Plan).
- Konfiguration → Beds24: Verbindung zu Beds24 herstellen, Verfügbarkeiten mit Booking.com, Airbnb etc. synchronisieren (Pro-Plan).

KONTO:
- Konto → Abonnement: Aktuellen Plan sehen, upgraden, Zahlungsmethode verwalten, Rechnungen herunterladen.
- Konto → Handbuch: Vollständige Dokumentation zu allen Funktionen.

APARTMENT-EBENE vs HOTEL-EBENE:
Einige Einstellungen gelten für das gesamte Hotel (Hotel-Ebene), andere für jedes Apartment separat (Apartment-Ebene). Weise darauf hin, wenn ein Nutzer fragt wo er etwas konfiguriert — auch wenn er gerade auf der Widget & Design Seite oder einer anderen Seite ist.

Hotel-Ebene (einmalig für das gesamte Hotel / Buchungswidget):
- Konfiguration → Widget & Design: Farben, Schriftart, Rechtliches, Zahlungsarten, Einbindungscode
- Konfiguration → E-Mails: E-Mail-Vorlagen, Online Check-in, Check-out-Erinnerung, Bewertungsanfrage
- Konfiguration → Gäste-Lounge: Kontakt, Hausinfos/Gästemappe, Umgebungstipps
- Verwaltung → Preisanpassungen: Saisonale Auf-/Abschläge (hotelweit)
- Verwaltung → Zusatzleistungen: Extras wie Frühstück, Parkplatz (hotelweit)
- Verwaltung → Sperrzeiten: Sperrbereiche für alle oder einzelne Apartments
- Konfiguration → Schlüsselloses Einchecken (Nuki): Globale API-Verbindung
- Konfiguration → Beds24: Kanal-Synchronisation

Apartment-Ebene (je Apartment separat unter Verwaltung → Apartments → Apartment bearbeiten):
- Name, Beschreibung, Ausstattung, Basispreis, Fotos
- Kapazität (max. Erwachsene, Kinder, Babys)
- iCal-Feeds für dieses Apartment (Sync mit Booking.com, Airbnb etc.)
- Nuki-Schloss diesem Apartment zuordnen
- Check-in-Fotos (Anreisebeschreibung mit Bildern, z.B. Schlüsselbox-Standort)`;

// ─── System prompt builder ────────────────────────────────────────────────────
function buildSystemPrompt(): string {
  return `Du bist ein Support-Assistent für bookingwulf-Nutzer im Admin-Bereich.

Deine Aufgabe: Nutzern erklären wie sie bookingwulf bedienen. Beantworte alle Fragen — auch kurze und kontextbezogene wie "Was mache ich hier?" oder "Wofür ist das?".

WICHTIG zur aktuellen Seite: Wenn eine aktuelle Seite angegeben ist, nutze sie NUR als Kontext bei unklaren Fragen ohne konkretes Thema. Fragt der Nutzer explizit nach einem anderen Bereich (z.B. "Kalender", "Apartments", "Preise"), beantworte GENAU das — ignoriere dann die aktuelle Seite vollständig.

${STATIC_NAV_DESCRIPTIONS}

${buildPlansSection()}

Lehne NUR ab wenn die Frage eindeutig nichts mit bookingwulf oder dem Hotelbetrieb zu tun hat. Dann: "Ich beantworte nur Fragen zur Bedienung von bookingwulf. Für andere Anliegen: support@bookingwulf.com."

Antworte auf Deutsch. Sprich den Nutzer immer mit "du" an (nie "Sie"). Kurz, klar, handlungsorientiert. KEIN Markdown: keine **Sternchen**, keine _Unterstriche_, keine Überschriften. Nur einfacher Text und Listen mit Bindestrichen.`;
}

export const BOOKINGWULF_SYSTEM_PROMPT = buildSystemPrompt();

export function classifyQuestion(question: string): string {
  const q = question.toLowerCase();
  if (q.match(/buchung|anfrage|gast|gäste|formular/)) return 'buchungen';
  if (q.match(/kalender|datum|verfügbar|sperr/)) return 'kalender';
  if (q.match(/apartment|zimmer|unterkunft/)) return 'apartments';
  if (q.match(/preis|kosten|\brate\b|saison|reinigung/)) return 'preise';
  if (q.match(/widget|einbind|script|code|website|schriftart|typografie|font|design|farbe|eckenradius/)) return 'widget';
  if (q.match(/email|e-mail|benachrichtigung|vorlage/)) return 'emails';
  if (q.match(/gästeportal|gast.?portal|hausinfo|hausordnung|wlan|wifi|notfall|umgebung|things.?to.?see/)) return 'gästeportal';
  if (q.match(/nuki|schlüssel|einchecken|zugangscode/)) return 'nuki';
  if (q.match(/beds24|channel|manager/)) return 'beds24';
  if (q.match(/abonnement|tarif|plan|stripe|zahlung|rechnung|pro|business|starter/)) return 'abonnement';
  if (q.match(/analytics|statistik|auswertung/)) return 'analytics';
  if (q.match(/extra|zusatz|leistung/)) return 'extras';
  return 'sonstiges';
}

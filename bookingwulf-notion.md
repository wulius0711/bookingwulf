# 🐺 bookingwulf — Projektübersicht

> Direktbuchungssystem für Hotels & Ferienwohnungen — ohne Provision, ohne Drittplattformen
> Stand: Mai 2026

---

# 🔑 Login-Daten & Zugänge

| Service | URL | Login |
|--------|-----|-------|
| App (Live) | bookingwulf.com/admin | E-Mail + Passwort |
| Vercel | vercel.com | — |
| Railway (Datenbank) | railway.app | — |
| Stripe | dashboard.stripe.com | — |
| Resend (E-Mail) | resend.com | — |
| Sentry (Monitoring) | sentry.io | — |
| GitHub (Repo) | github.com | — |

---

# 🚀 Produkt

## Was ist bookingwulf?

Hotels und Ferienwohnungen betten ein JavaScript-Widget auf ihrer eigenen Website ein. Gäste buchen direkt — ohne Airbnb, ohne Booking.com, ohne Provision.

**Zielgruppe:** Kleinere Hotels (5–30 Zimmer), Ferienwohnungsanbieter, Pensionen — v.a. D/A/CH + Südtirol

## Pläne & Preise

| Plan | Monatlich | Jährlich | Apartments | Nutzer | Hotels |
|------|-----------|----------|------------|--------|--------|
| Starter | €59 | €54/Mo | 3 | 1 | 1 |
| Pro | €119 | €109/Mo | 15 | 3 | 1 |
| Business | €249 | €229/Mo | Unbegrenzt | Unbegrenzt | 2 |
| hotelwulf Bundle ⭐ | €179 | €164/Mo | Unbegrenzt | Unbegrenzt | 1 |

**Trial:** 14 Tage kostenlos, keine Kreditkarte nötig

> **hotelwulf Bundle** wird nicht über die Billing-Seite buchbar sein — Zuweisung erfolgt manuell durch den Superadmin. Enthält bookingwulf + hungrywulf + eventwulf.

## hotelwulf Bundle — Details

Das Bundle richtet sich an Betriebe, die mehrere wulf-Produkte kombinieren wollen (z.B. Hotel mit eigenem Restaurant und Veranstaltungsraum).

**Was ist enthalten:**

| Produkt | Funktion |
|---------|----------|
| bookingwulf | Zimmerbuchungen & Anfragen |
| hungrywulf | Tischreservierungen (Restaurant) |
| eventwulf | Retreat- & Event-Anfragen |

**Features im Bundle:**
- Alle Business-Features von bookingwulf (unbegrenzte Apartments, Nutzer, Messaging, Analytics, volles Branding)
- Einheitliches Admin-Dashboard — alle drei Produkte per Magic-Link erreichbar
- Keine Provision auf Buchungen
- Priority Support & persönlicher Ansprechpartner

**Wie wird es zugewiesen?**

1. Superadmin öffnet `/admin/hotels/[id]`
2. Abschnitt „Plan" → Dropdown → „hotelwulf Bundle" → Setzen
3. Das Hotel hat sofort Zugriff auf alle Bundle-Features
4. Auf der Billing-Seite des Kunden erscheint ein Info-Banner (kein Planwechsel möglich)
5. hungrywulf und eventwulf müssen separat aktiviert werden (gleicher Superadmin-Flow via Integrationen-Sektion)

**Stripe:** Kein automatischer Checkout-Flow — Abrechnung erfolgt manuell / direkt. In Stripe muss ein entsprechendes Produkt für den Rechnungsversand angelegt werden.

---

# ✅ Features

## Live & fertig

- [x] Buchungs-Widget (iframe, einbettbar auf jeder Website per 1 Script-Tag)
- [x] Mini-Widget (kompakte Datepicker-Bar für Landing Pages)
- [x] Multi-Apartment-Verwaltung (Bilder, Preise, Ausstattung)
- [x] Dynamische Preissaisons + Mindestaufenthalt pro Saison
- [x] Last-Minute Rabatt & Lücken-Rabatt (Pro)
- [x] Verfügbarkeits-basierter Preisaufschlag (Business)
- [x] iCal-Sync (Airbnb, Booking.com — alle 30 Min. automatisch)
- [x] Sofortbuchung & Anfragemodus (pro Widget konfigurierbar)
- [x] E-Mails automatisch dreisprachig (DE / EN / IT)
- [x] Anpassbare E-Mail-Templates mit Variablen (Pro)
- [x] Branding (Farben, Schriften, Radius, Layout)
- [x] Zusatzleistungen & Versicherungen (4 Abrechnungstypen)
  - Widget-Extras: buchbar direkt beim Buchungsvorgang
  - Mail-Only-Extras: nicht im Widget, aber in der Bestätigungs-E-Mail als Upsell angeboten (z. B. Champagner, Zimmerdekoration, privater Transfer)
  - Upsell-Block in Bestätigungs-E-Mail: zeigt ungebuchte Extras mit `showInUpsell: true` + Link ins Gästeportal
- [x] Kinderpreise nach Altersgruppen
- [x] Ortstaxe / Kurtaxe (automatisch, altersabhängig)
- [x] Nuki Smart Lock — schlüsselloses Einchecken (Pro)
- [x] Analytics-Dashboard (Business)
- [x] Mehrere Widget-Konfigurationen pro Hotel (Pro)
- [x] Team-Nutzer einladen (Pro)
- [x] Messaging mit Gästen (Business)
- [x] Zimmerplan-Kalenderansicht
- [x] DSGVO-konform (EU-Daten, Cookie-Banner, GA opt-in)
- [x] Sitemap + Google Analytics
- [x] Admin-Handbuch integriert (/admin/help)
- [x] hungrywulf-Integration (Tischreservierungen per Magic-Link, Super-Admin-Freischaltung)
- [x] DATEV / Buchhaltungsexport (CSV mit Steuerpositionen, MwSt.-Aufschlüsselung, Datumsfilter)
- [x] Zahlungsarten für Gäste: Banküberweisung (inkl. optionaler Anzahlung), PayPal (eigener Business-Account des Hotels), Kreditkarte via Stripe (eigener Stripe-Account des Hotels, inline im Widget ohne Redirect)
- [x] Check-out-Erinnerung: automatische E-Mail am Abreisetag (08:00 UTC) mit Check-out-Uhrzeit und konfigurierbaren Hinweisen des Betreibers
- [x] Bewertungsanfrage (Post-Stay): automatische E-Mail X Tage nach Abreise mit Google-Reviews-Link — Pro, Mai 2026
- [x] Gäste-Portal: persönlicher Buchungsbereich per Token-Link (kein Login) — alle Pläne, Mai 2026
  - Online Check-in (Ankunftszeit + Hausordnung bestätigen)
  - Online Check-out anfordern
  - Extras buchen & Varianten-Gruppen (exklusiv buchbare Alternativen, z. B. Hotelstorno-Varianten)
  - Hausinfos / Gästemappe (WLAN, Parkplatz, Müll, Hausordnung, Notfallnummern)
  - Umgebungstipps (Restaurants, Aktivitäten, Events — manuell + Google Places)
  - Messaging mit dem Hotel
  - Mehrsprachig: DE / EN / IT mit Sprach-Switcher im Portal (Auswahl wird in localStorage gespeichert, Default aus Buchungssprache)
- [x] Anpassbares Admin-Dashboard — Widget-System mit Toggles (Statistiken, Anfragestatus, Schnellzugriff, Nächste Anreisen, Letzte Anfragen, Mini-Zimmerplan); Sichtbarkeit pro Widget in localStorage gespeichert; Mai 2026

## Roadmap (geplant)

| Feature | Priorität | Plan | Status |
|---------|-----------|------|--------|
| Beds24 Channel Manager | Hoch | Pro | ✅ Live |
| Vorauszahlung via Stripe | Hoch | Business | ✅ Live (Hotel-eigener Stripe-Account) |
| Automatisierte Trigger-E-Mails (Upsell T-7, Anreise T-1, Bewertung T+1) | Hoch | Pro | 📋 Geplant (Bewertung T+X ✅ Live, Upsell in Bestätigungs-E-Mail ✅ Live) |
| Gutschein- & Rabattcodes | Mittel | Pro | ✅ Live (Mai 2026) — Kauf via Stripe, PDF per E-Mail, Wert- & Nächte-Gutscheine, Einlösung im Widget |
| DATEV / Buchhaltungsexport (CSV mit Steuerpositionen) | Mittel | Alle | ✅ Live |
| Verpflegungsarten (Frühstück, Halbpension) | Mittel | Pro | 📋 Geplant |
| Review-System / Bewertungen | Mittel | Pro | 💡 Idee |
| Preisvergleichs-Badge im Widget ("X% günstiger als Booking.com") | Mittel | Pro | 💡 Idee |
| Last-Minute Blind Booking — Gast bucht ohne Zimmerwahl, bekommt verfügbares Apartment zugewiesen + konfigurierbaren Rabatt (z.B. 30%). Betreiber wählt welche Apartments qualifizieren. Erscheint im Widget wenn Anreise ≤ X Tage. | Mittel | Pro + Business | 💡 Idee |
| Housekeeping-Modul (Reinigungsaufgaben per Magic-Link) | Mittel | Pro | 💡 Idee |
| **"Heute"-Dashboard-Block** — tägliche Zusammenfassung oben im Admin: Anreisen heute, offene Anfragen, nächste freie Nacht, unbeantwortete Nachrichten (wenn Messaging live). Kein KI, nur smarte Aufbereitung vorhandener Daten. | Mittel | Alle | 💡 Idee |
| **Guest Journey Add-on** — Pre-Arrival Mail + Messenger + Extras-Upsell (inspiriert von reguest.io): automatisierte Pre-Arrival-Mail T-5 mit personalisiertem Zusatzleistungs-Angebot, In-Stay-Messaging (Chat-ähnlich über Gäste-Lounge), Post-Stay-Upsell für Wiederbucher | Mittel | Add-on ~€19/Mo | 💡 Idee |
| **Website Builder** — Template-basierter Editor für Hotel-Websites direkt in bookingwulf. Onepager als Standard (Sections ein/aus: Hero, Zimmer, Galerie, Ausstattung, Lage, Buchung, Kontakt), Multipager als Upgrade (eigene Unterseiten pro Zimmer, Aktivitäten, Blog). Buchungs-Widget automatisch eingebettet. Eigene Domain. Competitor: Lodgify. Aufwand: ~6–8 Wochen (Template-Editor) oder 4–6 Monate (vollwertiger visueller Builder). Empfehlung: Onepager-Standard + Multipager als Pro-Feature. | Mittel | Business | 💡 Idee |
| Preislisten-Widget (standalone, ohne Buchungsflow) | Niedrig | Alle | 📋 Geplant |
| Verfügbarkeits-Widget (Gantt-Kalender einbettbar auf Hotel-Website) | Niedrig | Add-on €9/Mo | 💡 Idee |
| Workation-Paket — Zimmer + Arbeitsplatz kombinierbar als Zusatzleistung, Zielgruppe Remote Worker. Konfigurierbar als Extra mit eigenem Preis und Beschreibung. | Niedrig | Pro + Business | 💡 Idee |
| **Co-Host / KI-Automatisierungen** — KI-gestützte Auto-Replies auf Gästenachrichten (inspiriert von Lodgify Cohost). Gast schreibt → KI antwortet automatisch auf Basis von Hausregeln, Check-in-Infos, FAQ. Betreiber bekommt Zusammenfassung. Ergänzt die bestehende Messaging-Funktion. | Niedrig | Business | 💡 Idee |
| Google Hotels Free Booking Links (Meta-Suche) | Niedrig | Business | 💡 Idee |
| Affiliate- / Empfehlungsprogramm für Betreiber | Niedrig | — | 💡 Idee |
| SMS-Benachrichtigungen | Niedrig | Pro | 💡 Idee |
| Mehrsprachiges Admin-Panel | Niedrig | Alle | 💡 Idee |
| Weitere Widget-Sprachen (FR, HR...) | Niedrig | Alle | 💡 Idee |
| Mobile App (Admin) | Niedrig | Alle | 💡 Idee |
| Gast-Portal (Buchungsübersicht, Check-in/out, Extras, Hausinfos, Umgebung) | — | Alle | ✅ Live (Mai 2026) — offline-fähig via Service Worker |

---

# 🎨 UX / UI

## Widget — Was gut funktioniert

- Visueller Kalender-Datepicker (2-Monats-Ansicht, Drag-Range + Hover-Preview)
- Floating Labels auf allen Formularfeldern
- Smooth Animationen (Accordions via max-height-Transition, kein Flackern)
- Preistransparenz: Popover mit vollständiger Aufschlüsselung (Nächte, Saison, Reinigung, Rabatte)
- Summary-Sidebar (Preis, Extras, Kinderpreise, Ortstaxe)
- Inline-Feldvalidierung (rote Markierung direkt unter dem Feld)
- Adresse + Telefon optional/versteckt (weniger Friction)
- Mobile-optimiert (1 Monat, Touch-Gesten)

## Admin-Panel — Was gut funktioniert

- Sidebar-Navigation mit Icons
- Plan-gesperrte Bereiche mit 🔒 + Tooltip
- Onboarding-Flow für neue Nutzer
- Zimmerplan als Kalenderansicht
- Integriertes Benutzerhandbuch (/admin/help)

## Offene UX-Verbesserungen

- [ ] Dark Mode fertigstellen / prüfen
- [ ] Widget: Ladezeit optimieren (First Paint)
- [ ] Widget: Bessere Fehlerbehandlung bei Netzwerkproblemen
- [ ] Admin: Mobile-Ansicht verbessern
- [ ] Admin: Onboarding-Flow mit mehr Guidance (Tooltips, leere Zustände)
- [ ] Admin: Buchungsdetail-Seite — mehr Aktionen (Rechnung, Notizen)
- [~] Widget: Barrierefreiheit (ARIA, Keyboard-Navigation) — Großteil erledigt, Kalender-Keyboard-Drag + Settings/Apartments-Labels noch offen
- [ ] Admin: Varianten-Gruppe (Extras) — Freitext-Eingabe ist fehleranfällig; besser: Dropdown mit bestehenden Gruppen-Namen des Hotels oder direkte „Variante von…"-Verknüpfung in der Liste

## Design-Prinzipien

- Keine inline Styles — immer über CSS-Klassen
- CSS Custom Properties für Widget-Themes
- Tailwind CSS v4 im Admin-Panel
- Einfache Selektoren, keine tiefen Verschachtelungen

---

# 📣 Akquise

## Zielgruppe

| Segment | Beschreibung | Priorität |
|---------|-------------|-----------|
| Ferienwohnungen (2–10 Einheiten) | Häufig noch kein Buchungssystem | 🔴 Hoch |
| Kleinhotels (10–30 Zimmer) | Unzufrieden mit Provision | 🔴 Hoch |
| Berghotels / Pensionen (Alpen) | Starke Saisonalität, dreisprachig wichtig | 🔴 Hoch |
| Bauernhöfe mit Urlaub | Wenig Technik-Erfahrung, brauchen Einfachheit | 🟡 Mittel |
| Boutique-Hotels (30–80 Zimmer) | Mehr Ansprüche, höherer LTV | 🟡 Mittel |

## Kanäle

| Kanal | Status | Nächster Schritt |
|-------|--------|-----------------|
| Cold Outreach (E-Mail/Telefon) | 🟡 Aktiv | outreach_tracker.xlsx pflegen |
| SEO / Organisch | 🟡 Aufbau | Blogartikel: "Direktbuchung ohne Provision" |
| Google Ads | ⚪ Noch nicht | Kampagne planen |
| Social Media (Instagram/LinkedIn) | ⚪ Noch nicht | Fallstudien + Before/After posten |
| Pilotkundenreferenz (Almenparadies Gaistal) | 🟢 Aktiv | Testimonial / Case Study erstellen |
| Partnerschaft (Webagenturen) | 💡 Idee | Reseller-Modell prüfen |
| Verzeichnisse (Capterra, G2) | 💡 Idee | Profil anlegen |

## USPs gegenüber Mitbewerbern

| bookingwulf | Airbnb / Booking.com | Feratel / Lodgify |
|-------------|---------------------|-------------------|
| 0 % Provision | 15–20 % Provision | Teuer, komplex |
| 1 Script-Tag Einbindung | Eigene Plattform nötig | Aufwändige Integration |
| Dreisprachig (DE/EN/IT) | — | Teilweise |
| DSGVO-konform, EU-Daten | Drittland-Transfer | Je nach Anbieter |
| Eigene Website bleibt zentral | Gäste werden abgelenkt | — |
| Ab €49/Mo | Provisionsbasiert | Ab €100+/Mo |

## Konkurrenz-Analyse

### easy-booking.at

Österreichischer Anbieter, direkt im D/A/CH-Markt.

**Technisch:**
- jQuery-basiertes Plugin (`jquery.easybooking.pricelist.v2.js`) — Legacy-Stack
- Kein iframe — direkt in die Seite eingebettet → CSS-Konflikte mit Hotel-Website möglich
- `customerId` und `serialNo` stehen im Klartext im HTML → alle Kunden öffentlich identifizierbar (z. B. via PublicWWW-Suche nach `easy-booking.at`)

**Buchungsflow:**
- Klick auf "Buchen" / "Anfrage" leitet den Gast auf **easy-booking.at** um (`/bookingengine2/`, `/enquiryForm/`) — Gast verlässt die Hotel-Website komplett
- Pro Zimmer 4 separate Buttons (Preise anzeigen, Anfrage, Buchen, Verfügbarkeit) — fragmentiertes Erlebnis, Verfügbarkeit öffnet neuen Tab
- `serialNo` steht nicht nur im HTML, sondern auch in jeder Booking-URL → taucht in Analytics, Server-Logs und Referer-Headern auf
- `roomSorting: "random"` — Zimmerreihenfolge wird bei jedem Seitenaufruf zufällig gewürfelt, kein konsistentes Erlebnis
- bookingwulf-Vorteil: alles bleibt im iframe auf der eigenen Domain, ein durchgehender Flow

**Datenschutz / DSGVO:**
- Widget lädt JS + CSS von `www.easy-booking.at` → jeder Seitenbesuch schickt die IP des Gastes an easy-booking.at-Server (Drittland-Logging) — potenziell DSGVO-relevant
- bookingwulf-Vorteil: alle Ressourcen laufen über die eigene Vercel-Domain / CDN

**Performance:**
- Externe JS- und CSS-Datei blockiert oder verzögert das Rendering
- Polling-Mechanismus (`ebPricesLoadedCheck` mit `setTimeout 200ms`) bis jQuery geladen ist — fragil

**Preisdarstellung:**
- Preise sind als statisches HTML vorgerendert (ein Jahreszeitraum, 01.01.–31.12.) — keine dynamischen Saisonpreise im Widget sichtbar
- Verfügbarkeit ist hinter einem separaten Kalender-Link (`showavailability.php`) — nicht direkt im Widget integriert

**Feature-Lücke bookingwulf (Achtung):**
- easy-booking unterstützt **Verpflegungsarten** (Frühstück, Halbpension, ohne) pro Zimmerkategorie — bookingwulf hat das noch nicht

**Pitch-Angriffspunkte:**
- „Der Gast bucht bei easy-booking.at, nicht bei Ihnen"
- Keine Kontrolle über das Buchungserlebnis auf fremder Domain
- Visuell nicht anpassbar an das eigene Branding
- jQuery-Abhängigkeit kann mit moderner Website-Technik kollidieren
- DSGVO-Risiko durch Drittanbieter-Ressourcen auf jeder Seite

### Lodgify

Internationaler All-in-One-Anbieter, einer der bekanntesten Namen im Segment.

**Produkt:**
- **Website Builder** — ersetzt die eigene Website komplett (eigene Domain, Templates, SEO-Tools). Kernprodukt seit Jahren: lodgify.com/vacation-rental-website-builder
- **Booking Engine** — Direktbuchung integriert in die Lodgify-Website
- **Channel Manager** — Sync mit Airbnb, Booking.com, VRBO etc.
- **Lodgify Cohost (Pre-Launch)** — KI-gestützte Automatisierung: Auto-Reply auf Gästenachrichten, operative Aufgaben, tägliche Zusammenfassungen. Noch kein Preis bekannt, Warteliste.

**Preise:** ~€17–50+/Mo je nach Plan (Website Builder inklusive)

**Preisstruktur (Stand Mai 2026, EUR, jährliche Abrechnung):**
| Plan | Preis | Limit |
|------|-------|-------|
| Basic | —€/Mo (unklar) | max. 1 Property |
| Starter | —€/Mo (unklar) | max. 2 Properties |
| Professional | €96/Mo (war €120) | unlimitiert |
| Ultimate | €128/Mo (war €160) | unlimitiert |

- **Basic** (max. 1 Property): Unified Calendar (Airbnb, Vrbo, Booking.com), AI-powered Unified Inbox, Easy Self-Onboarding
- **Starter** (max. 2 Properties): + No-code Website Builder + Booking Widget, Custom Rates & Secure Payments, Personalized Onboarding mit Lodgify-Expert
- **Professional** (€96/Mo): + Automated Messages, Google Vacation Rentals, Damage Protection Pre-Authorization, Manual Payment Collection, E-Mail & Tel.-Support
- **Ultimate** (€128/Mo): + Task Management, Automated Check-in, Owner Payments/Reports, Guest Invoices & Advanced Analytics, Guest Guidebook Mobile App, Free Turno Subscription (Reinigungskoordination), Priority Support
**Über alle Pläne:** 0% Buchungsgebühren, 7 Tage Free Trial, keine Setup-Gebühren

**Features die bookingwulf (noch) nicht hat:**
- Dynamic Pricing (KI, via Beyond-Integration)
- Damage Protection / Kaution-Vorauthorisierung
- Google Vacation Rentals Integration
- Guest Registration (automatisierte Meldepflicht in 18+ Ländern)
- Gäste-Rechnungen
- White-Label

**Kernunterschied zu bookingwulf:**
Lodgify ist ein vollständiges PMS für Property Manager mit mehreren Objekten, international ausgerichtet. bookingwulf ist ein fokussiertes Direktbuchungs-Widget für kleine Betriebe im DACH-Raum. Der Preisvergleich für 1 Property klingt günstig ($25/Mo), aber für 10+ Objekte wird Lodgify teuer — und bringt Komplexität mit die eine österreichische Pension nicht braucht.

**Strategische Einschätzung:**
Der "Direct Plan" (kostenlos) ist ein Angriff auf den Entry-Level-Markt — Lodgify will früh Nutzer binden. bookingwulfs Moat: DACH-Fokus, persönlicher Support, einfacheres Setup, kein Lock-in in ein Ökosystem das man nicht vollständig nutzt.

**Pitch-Angriffspunkte:**
- „Lodgify ist für Property Manager mit 10+ Objekten gebaut — Sie haben eine Pension"
- „Bei Lodgify zahlen Sie für Dynamic Pricing, Guest Registration und White-Label — brauchen Sie das?"
- „bookingwulf ist in 5 Minuten auf Ihrer bestehenden Website — kein Replatforming"
- „Auf Deutsch, mit direktem Support — kein internationales Ticket-System"

## Messaging / Kernbotschaft

> „Deine Gäste buchen direkt bei dir — nicht bei Airbnb."

Alternativen:
- „Kein Booking.com. Keine Provision. Nur deine Gäste."
- „Buchungs-Widget für deine Website. In 5 Minuten eingebunden."

## Outreach-Vorlage (E-Mail)

**Betreff:** Direktbuchungen für [Hotelname] — ohne Provision

> Hallo [Name],
>
> ich habe [Hotelname] auf [Plattform] entdeckt und gesehen, dass ihr auch über Booking.com buchbar seid.
>
> Mit bookingwulf könnt ihr ein Buchungs-Widget direkt auf eure eigene Website einbinden — Gäste buchen dann direkt bei euch, komplett ohne Provision. Einrichtung dauert etwa 5 Minuten.
>
> 14 Tage kostenlos testen: bookingwulf.com
>
> Interesse? Ich zeige euch das System gerne kurz per Video-Call.
>
> Viele Grüße

---

# 📋 To-Dos

## 🔴 Dringend / Diese Woche

- [ ] Zahlungsarten mit echten Credentials testen: PayPal Sandbox (developer.paypal.com) + Stripe Test-Keys (pk_test_ / sk_test_ aus dashboard.stripe.com/apikeys) — alle drei Flows durchklicken: Banküberweisung, PayPal-Redirect, Stripe Inline-Zahlung
- [x] **Backup-Restore getestet** ✅ — Mai 2026. 27 Tabellen, alle Daten korrekt wiederhergestellt. Achtung: pg_dump muss Version 18 sein (Railway läuft auf PG 18.3) — GitHub Action auf `/usr/lib/postgresql/18/bin/pg_dump` umgestellt.

## 🟡 Diese Woche / Bald

- [x] Beds24 Channel Manager fertiggestellt (Mai 2026)
- [x] Beds24 Webhook: Buchungen aus Airbnb/Booking.com erscheinen jetzt im CSV-Export (Nächte, Personen, Herkunftsland) — Mai 2026
- [x] Beds24-Gäste haben Zugang zur Gäste-Lounge — Token wird automatisch generiert, Link im Admin kopierbar — Mai 2026
- [ ] Ersten Pilotkundenerfahrungsbericht (Case Study) erstellen
- [ ] Google Ads Kampagne planen

## 🔒 Launch Readiness — Infrastruktur

- [x] **Rate Limiting → Upstash Redis** — umgestellt Mai 2026. Zähler sind jetzt persistent und cross-instance korrekt (kein In-Memory-Reset mehr bei Deploy).
- [ ] **Structured Logging** — Admin-Aktionen und Integrations-Fehler strukturiert loggen (aktuell nur Sentry + console.error)
- [ ] **Session Revocation** — Admin-JWTs 24h gültig ohne Widerrufsmöglichkeit. Erst relevant bei größeren Team-Accounts.

## 🧪 Testfälle

### Anzahlung & Bankdaten
- [ ] Prozentsatz + Apartment ohne Preis → Hinweis erscheint trotzdem
- [ ] Prozentsatz + sehr günstiger Preis (€3) → Rundung ergibt 0, Hinweis erscheint trotzdem
- [ ] Fixbetrag → Hinweis erscheint unabhängig vom Gesamtpreis
- [ ] IBAN leer, Anzahlung aktiv → kein Hinweis
- [ ] Anzahlung deaktiviert, IBAN befüllt → kein Hinweis
- [ ] Buchungsbestätigungsmail: Kontoinhaber + IBAN + BIC + Verwendungszweck vorhanden

### Widget — Steps
- [ ] Alle 4 Schritte vorwärts durchklicken — Farben korrekt (erledigt = grau, aktuell = Accent, kommend = voll)
- [ ] Zurück klicken: Steps werden wieder „upcoming"

### Bundle-Plan
- [ ] Superadmin setzt bundle_all → Billing-Seite zeigt Info-Banner, alle Plan-Buttons disabled
- [ ] bundle_all nicht in der Billing-Plan-Auswahl sichtbar
- [ ] hasFullBranding, Analytics etc. mit bundle_all zugänglich

### Buchungsmail
- [ ] Sofortbuchung mit Anzahlung → Bankblock in Mail
- [ ] Sofortbuchung ohne Anzahlung → kein Bankblock
- [ ] Anfrage → kein Bankblock

### Kritische Edge Cases
- [ ] Widget mit 0 aktiven Apartments
- [ ] Anreise = Abreise (0 Nächte) → Fehlermeldung
- [ ] Mehrere Apartments, eines davon ohne Preis
- [ ] **Browser-Back nach erfolgreicher Buchung → doppelte Buchung?**

---

## 🟢 Backlog — Produkt

### Features
- [ ] Verpflegungsarten pro Apartment (Frühstück, Halbpension, ohne) — Pflicht-Selektor im Widget, Preisaufschlag pro Person/Nacht, `ApartmentBoardType`-Tabelle → Pro
- [ ] Preislisten-Widget (`public/price-widget.html`) — standalone Preistabelle ohne Buchungsflow, optionaler Datepicker berechnet Preis für gewählten Zeitraum, "Anfragen/Buchen"-Button öffnet Haupt-Widget mit vorausgefüllten Daten, 1 Script-Tag Einbindung → Alle Pläne
- [x] Zahlungsarten: Banküberweisung, PayPal, Stripe (Kreditkarte inline) — alle mit hotel-eigenem Account, live Mai 2026
- [ ] Gast-Portal (Link in Bestätigungs-E-Mail → Buchungsübersicht, Stornierung)
- [x] Check-out-Erinnerung: E-Mail am Abreisetag mit Uhrzeit + Hinweisen — live Mai 2026
- [ ] Automatische Erinnerungs-E-Mail (X Tage vor Anreise)
- [ ] Bewertungsanfrage nach Abreise (automatische E-Mail)
- [ ] Review-System / Bewertungen im Widget anzeigen
- [ ] Mehrere Hotels pro Business-Account (aktuell 2 — limit erhöhen oder dynamisch)
- [x] Gutschein- & Rabattcodes — Wert- & Nächte-Gutscheine, Kauf via Stripe, PDF-Gutschein per E-Mail, Einlösung im Widget mit automatischer Rabattberechnung, Admin-Verwaltung → Pro (live Mai 2026)
- [ ] Preisvergleichs-Badge im Widget ("X% günstiger als Booking.com") → Pro
- [ ] Mini-Widget: "ab X €/Nacht" Preisanzeige — Mindestpreis aus Apartment-Einstellungen automatisch anzeigen, wartungsfrei, kein manueller Eintrag nötig
- [ ] Housekeeping-Modul: Reinigungsaufgaben nach Abreise, Status offen/fertig, Zugang per Magic-Link ohne Login → Pro
- [x] DATEV / Buchhaltungsexport: CSV mit Buchungen und Steuerpositionen — fertig (Mai 2026)
- [ ] Gästemeldeexport: Gastdaten (Name, Geburtsdatum, Nationalität, Reisepassnummer, Anreise/Abreise, Unterkunft) als CSV exportieren — Betrieb lädt selbst im Landesportal hoch, kein Direktanschluss ans Meldesystem → Pro
- [ ] Google Hotels Free Booking Links (Meta-Suche-Integration via Datenfeed) → Business
- [ ] Affiliate- / Empfehlungsprogramm: Betreiber empfehlen bookingwulf, Provision auf erste Zahlungen
- [ ] SMS-Benachrichtigungen (Check-in Codes, Erinnerungen)
- [ ] Weitere Widget-Sprachen (FR, HR, NL...)
- [ ] Mehrsprachiges Admin-Panel (EN)

### UX / UI
- [ ] Dark Mode im Admin fertigstellen
- [ ] Widget: Skeleton-Loading statt leerem Zustand
- [ ] Admin: Leere-Zustände mit Guidance ("Noch kein Apartment — jetzt anlegen")
- [ ] Admin: Buchungsdetail-Seite ausbauen (PDF-Rechnung, Notizfeld)

### Barrierefreiheit (ARIA / Keyboard) — Backlog

- [x] Admin: Formular-Labels verknüpfen (CalendarGrid-Modale, Gantt-Modale) — `id` + `htmlFor`
- [ ] Admin: Formular-Labels — Apartment-Formular + Einstellungen-Seite noch ausstehend
- [ ] Admin: Kalender-Tageszellen — Keyboard-Alternative zur Maus-Drag-Auswahl (komplex, separat besprechen)
- [x] Admin: Gantt-Apartment-Labels und Balken — `role="button"` + `tabIndex` + `onKeyDown`
- [x] Admin: Erfolgsmeldungen ("✓ Gespeichert") — `role="status"`
- [x] Admin: Skip Link "Zum Inhalt springen" im Admin-Layout
- [x] Widget: Mini-Widget Labels `<span>` → `<label for="…">`, Fehlerbox `role="alert"`
- [x] Widget: Register-Formular — `id` + `htmlFor` auf allen Feldern
- [x] Widget: Skip Link im Widget-HTML
- [x] Widget: View-Toggle + Layout-Toggle — `aria-label` ergänzt

### Technik
- [ ] Automatische Tests (E2E für Buchungsflow)
- [ ] Widget Performance (Bundle-Größe, First Paint)
- [ ] Rate Limiting auf Admin-API-Routen prüfen
- [ ] Stripe Webhook Retry-Handling prüfen

## 🟢 Backlog — Marketing & Akquise

- [ ] Testimonial / Case Study mit Almenparadies Gaistal
- [ ] Landing Page: SEO-Artikel "Direktbuchungen ohne Provision"
- [ ] Capterra / G2 Profil anlegen
- [ ] Reseller-Modell für Webagenturen prüfen
- [ ] Social Media Präsenz aufbauen (Instagram: Before/After Widget-Demo)
- [ ] Preisvergleichsseite (bookingwulf vs. Lodgify vs. Feratel)

---

# 📊 Kennzahlen

## Business-Metriken (monatlich tracken)

| Metrik | Aktuell | Ziel (3 Mo) | Ziel (12 Mo) |
|--------|---------|-------------|--------------|
| MRR (€) | | | |
| Aktive zahlende Kunden | | | |
| Trial-Starts / Monat | | | |
| Trial → Paid Conversion (%) | | | |
| Churn Rate (%) | | | |
| Ø Revenue per Customer (€) | | | |
| Plan-Mix (Starter / Pro / Business) | | | |

## Produkt-Metriken (monatlich tracken)

| Metrik | Aktuell | Ziel |
|--------|---------|------|
| Buchungsanfragen über Widget / Monat | | |
| Sofortbuchungen / Monat | | |
| Aktive iCal-Feeds | | |
| Ø Apartments pro Kunde | | |
| Widget-Ladezeit (P95 ms) | | |

## Formeln

- **MRR** = Σ monatliche Abonnementbeträge aller aktiven Kunden
- **Churn Rate** = gekündigte Kunden / Kunden zu Monatsanfang × 100
- **Trial → Paid** = zahlende Neukunden / Trial-Starts im gleichen Monat × 100
- **LTV** = Ø Revenue / Monat × Ø Kundenlaufzeit in Monaten

---

# 🔒 Security

## Status: Solide

| Bereich | Status | Detail |
|---------|--------|--------|
| Auth / Sessions | ✅ | JWT (jose, HS256), httpOnly Cookie, 24h TTL, auf allen Admin-Routen |
| Passwort-Hashing | ✅ | scrypt + 16-Byte-Salt + timingSafeEqual |
| Stripe Webhook | ✅ | Signatur-Verifikation via stripe.webhooks.constructEvent |
| SQL Injection | ✅ | Prisma ORM durchgehend, keine unsicheren Raw Queries |
| Eingabe-Validierung | ✅ | Zod-Schemas auf allen schreibenden Endpunkten |
| Security Headers | ✅ | HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy |
| Rate Limiting | ✅ | Upstash Redis (HTTP-basiert, EU-central-1) — persistent, cross-instance korrekt, Free Tier ($0/Mo) |
| Beds24 Webhook | ✅ | timingSafeEqual Token-Vergleich; erstellt BlockedRange + Request-Datensatz (CSV-Export) + checkinToken für Gäste-Lounge |
| CORS | ⚠️ | `*` auf Widget-APIs — gewollt, aber keine zentrale Kontrolle |
| ADMIN_SESSION_SECRET | ✅ | Starker Random-Secret gesetzt (Mai 2026) — war zuvor Placeholder |
| CRON_SECRET | ✅ | Starker Random-Secret gesetzt (Mai 2026) — war zuvor Placeholder |

## Rate Limits (öffentliche APIs)

| Route | Limit |
|-------|-------|
| POST /api/request | 10/15 Min. per IP + 3/5 Min. per E-Mail |
| GET /api/availability-quick | 60/Min. per IP |
| GET /api/availability-widget | 30/Min. per IP |
| GET /api/hotel-settings | 60/Min. per IP |
| GET /api/pricing | 120/Min. per IP |

## Bekannte Limitierungen (kein sofortiger Handlungsbedarf)

| Thema | Status | Wann angehen |
|-------|--------|--------------|
| Rate Limiting in-memory | ⚠️ | Wenn ernsthafter Traffic; dann Redis (Upstash) davor schalten |
| Session Revocation fehlt | ⚠️ | Admin-JWTs sind 24h gültig ohne Widerrufsmöglichkeit; erst bei echten Team-Kunden relevant |
| Kein MFA für Admins | ℹ️ | Nice-to-have; kein kritisches Risiko bei kleinen Teams |
| Backup-Restore getestet | ✅ | Mai 2026 — 27 Tabellen, alle Daten OK. pg_dump 18 erforderlich (Railway PG 18.3) |

---

# 💾 Backup & Datensicherung

| Ebene | Methode | Status |
|-------|---------|--------|
| Code | GitHub — jeder Commit wiederherstellbar | ✅ Aktiv |
| Deployments | Vercel — jedes Deploy bleibt gespeichert, 1-Klick-Rollback | ✅ Aktiv |
| Buchungsdaten | Wöchentliches CSV per Cron (So 03:00 UTC) → support@bookingwulf.com | ✅ Aktiv seit Mai 2026 |
| DB-Volldump | Tägliches JSON-Backup aller Tabellen → Vercel Blob (backups/YYYY-MM-DD.json), 30 Tage Retention | ✅ Aktiv seit Mai 2026 |
| pg_dump | GitHub Actions täglich 03:00 UTC → `.sql.gz` als Artifact, 30 Tage Retention. Restore: `gunzip -c backup-YYYY-MM-DD.sql.gz \| psql "$DATABASE_URL_RAILWAY"` | ✅ Aktiv seit Mai 2026 |
| Datenbank | Railway PostgreSQL (Amsterdam/EU) — Hobby $5/Mo, kein Sleeping, always-on | ✅ Aktiv seit Mai 2026 |

---

# 🚦 Launch Readiness (Stand Mai 2026)

> Vollständige Security & Infrastruktur-Analyse — Basis für Pitch und ersten Launch

## Gesamtstatus: ~80 % bereit

Für **Pitch + erste Pilotkunden**: bereit (nach erledigten Fixes).
Für **öffentlichen Launch**: noch offene Punkte bei Logging und Backup-Restore-Test.

## Erledigte Fixes (Mai 2026)

| Fix | Details |
|-----|---------|
| ✅ `ADMIN_SESSION_SECRET` | War Placeholder-String — jetzt starker 48-Byte-Secret in Vercel Production + `.env.local` |
| ✅ `CRON_SECRET` | War Placeholder-String — jetzt starker 32-Byte-Hex-Secret in Vercel Production + `.env.local` |
| ✅ `.env` Dev-Template | `ADMIN_SESSION_SECRET` auf generischen Placeholder (kein „supersecret123" mehr) |

## Offene Punkte (priorisiert)

### Vor erstem Beta-Kunden
- [x] **Backup-Restore getestet** ✅ — Mai 2026. Railway Test-Environment erstellt, Artifact eingespielt, 27 Tabellen + alle Daten vorhanden.
- [ ] **PayPal-Zahlungsflow vollständig testen** — alle 3 Zahlungsarten (Banküberweisung, PayPal-Redirect, Stripe Inline) mit echten Sandbox-Credentials durchklicken

### Vor öffentlichem Launch (wenn Traffic wächst)
- [ ] **Structured Logging** — Sentry ist drin, aber API-Calls und Admin-Aktionen werden nicht strukturiert geloggt. Wichtig für Debugging bei echten Kunden.
- [x] **Rate Limiting → Upstash Redis** ✅ — umgestellt Mai 2026. `@upstash/redis`, INCR+EXPIRE, fails open bei Redis-Ausfall.
- [ ] **Session Revocation** — Admin-JWTs sind 24h gültig ohne Widerrufsmöglichkeit. Erst relevant wenn Team-Accounts größerer Hotels genutzt werden.

### Nicht nötig (bewusst zurückgestellt)
- Multi-Factor Authentication für Admins — Nice-to-have, kein kritisches Risiko
- WAF / DDoS-Protection — Vercel deckt Basics ab
- OpenAPI-Dokumentation — kein Investor erwartet das beim ersten Pitch
- Redis sofort — erst wenn Traffic es rechtfertigt

## Infrastruktur-Übersicht (Pitch-tauglich)

| Schicht | Lösung | Status |
|---------|--------|--------|
| Hosting | Vercel (Serverless, auto-scaling) | ✅ Live |
| Datenbank | Railway PostgreSQL, Amsterdam/EU | ✅ Live |
| CDN | Vercel Edge Network | ✅ Automatisch |
| Code-Backup | GitHub (jeder Commit) | ✅ |
| DB-Backup täglich | JSON-Dump → Vercel Blob, 30 Tage | ✅ |
| DB-Backup täglich | pg_dump → GitHub Actions Artifact, 30 Tage | ✅ |
| Buchungsdaten-Backup | CSV wöchentlich → E-Mail | ✅ |
| Error Tracking | Sentry (10% Sampling) | ✅ |
| Rate Limiting | Upstash Redis (EU-central-1, Free Tier) | ✅ |
| E-Mail | Resend | ✅ |
| DSGVO | EU-Daten, Cookie-Banner, opt-in GA | ✅ |

---

# 🏗️ Tech-Stack (Referenz)

| Bereich | Technologie | Version |
|---------|-------------|---------|
| Framework | Next.js (App Router) | 16.2.2 |
| UI | React + Tailwind CSS v4 | 19.2.4 |
| Datenbank | PostgreSQL via Railway (Amsterdam/EU) | — |
| ORM | Prisma | 7.7.0 |
| Auth | JWT (jose + Node.js crypto) | — |
| Zahlung | Stripe SDK | 22.0.2 |
| E-Mail | Resend | 6.10.0 |
| Uploads | Vercel Blob | 2.3.3 |
| iCal | ical.js | 2.2.1 |
| Monitoring | Sentry | 10.49.0 |
| Deployment | Vercel | — |

---

# 🗒️ Entscheidungen & Notizen

> Wichtige Produkt- und Business-Entscheidungen hier festhalten

- **Mai 2026 — Prio gering: E-Mail-Provider Wechsel (Resend → Brevo)** — Brevo ist EU-Unternehmen (Paris), DSGVO-konformer als Resend (US). Brevo Free: 9.000 E-Mails/Mo (vs. Resend 3.000), Paid: €25/Mo → 20k (Resend $20 → 50k). Kein nativer React-Email-Support, aber React Email rendert zu HTML → kein echter Verlust. Wechselaufwand: ~3–4h (SDK tauschen, `resend.emails.send()` → Brevo API, API-Key). Empfehlung: erst wechseln wenn Kunde aktiv nach EU-only fragt oder Volumen stark steigt.
- **Mai 2026:** Custom-Feature-Service — Hotels können hotel-spezifische Features gegen Einmalzahlung (€250–800 je Komplexität) beauftragen. Technisch sauber hinter Feature-Flag gebaut, landet auf der Roadmap und wird bei Nachfrage in einen Plan integriert (Pilot-Kunde bekommt es gratis weiter). Kommunikation: persönlich im Onboarding oder per CTA in der Trial-Bestätigungsmail — nicht öffentlich, um unrealistische Anfragen zu vermeiden. USP: direkter Kontakt zum Entwickler, kein Ticket-System, Kunde gestaltet die Plattform mit. Pricing-Argument: nicht nach Stunden, sondern nach Wert für den Kunden.
- **April 2026:** Pricing-Strategie Add-ons vs. Pläne: Features grundsätzlich in Pläne integrieren, Add-ons nur für echte Spalter-Features (manche wollen es unbedingt, andere nie). Vorauszahlung → Business (kein eigener Add-on), um den USP "0% Provision / keine Gebühren" zu schützen. Keine eigene Transaktionsgebühr — Stripe-Fees laufen direkt über den Kunden-Account. Trigger-E-Mails → Pro.
- **April 2026:** Almenparadies Gaistal als erster Pilot-Kunde live
- **April 2026:** Google Analytics + Cookie-Banner live (DSGVO-konform, opt-in)
- **April 2026:** hungrywulf-Integration — Tischreservierungs-App per Magic-Link für bookingwulf-Kunden; Superadmin schaltet pro Hotel frei, Provisionierung automatisch, kein separates Login für den Kunden nötig
- **Design-Entscheid:** Keine inline Styles — immer CSS-Klassen (verhindert Theme-Konflikte)
- **Architektur-Entscheid:** Multi-Tenancy via hotelId (kein Schema-Splitting), Daten physisch in Frankfurt
- **Auth-Entscheid:** Kein Auth.js / NextAuth — eigene JWT-Implementierung für volle Kontrolle
- **Mai 2026 — Idee: Operative Automatisierungen ("Weniger Routinearbeit")** — Inspiriert von Lodgify Cohost. Kein KI nötig — einfache "wenn X dann Y" Trigger lösen 90% der Fälle:
  1. **Reinigungs-Trigger** — nach Check-out automatisch E-Mail/SMS an konfigurierte Reinigungs-Kontakte. Schon als "Housekeeping-Modul" in Roadmap. Erweiterung: Betreiber legt im Admin eine "Reinigungskontakt"-E-Mail an, bekommt nach jedem Check-out automatisch eine Benachrichtigung mit Apartment-Name, Check-out-Zeit, nächster Anreise.
  2. **Check-in Koordination (T-1 Mail)** — automatische Mail an Gast einen Tag vor Anreise: Anreise-Infos, Türcode/Schlüsselanweisung, Check-in-Zeit, Kontakt bei Problemen. Teil des Guest Journey Add-ons.
  3. **Late Check-out / Early Check-in Anfragen** — Gast kann direkt über Gäste-Lounge anfragen, Betreiber bestätigt mit einem Klick im Admin. Kein E-Mail-Ping-Pong.
  4. **Stornierungskoordination** — bei Stornierung automatisch Reinigungsteam abbestellen (E-Mail) + optionale Benachrichtigung an den Betreiber.
  - **Positionierung:** "Ihr Ablauf läuft — auch wenn Sie nicht am Handy sind." Kein KI-Versprechen, aber konkret und vertrauenswürdig für kleine Betriebe.

- **Mai 2026 — Idee: Tägliche Zusammenfassung als Benachrichtigung** — Dieselben Daten wie der "Heute"-Dashboard-Block, aber als Push/Nachricht: "2 Anreisen heute · 1 offene Anfrage · Nächste freie Nacht: 14. Juni." Betreiber muss nicht einloggen. Optionen nach Aufwand:
  1. **E-Mail (empfohlen, Prio 1)** — Cron-Job täglich 07:00, Resend bereits vorhanden, Opt-in im Admin. ~1 Tag Aufwand.
  2. **PWA Web Push (Prio 2)** — Service Worker bereits vorhanden, kostenlos, kein Drittanbieter. Einschränkung: iOS erst ab 16.4 + PWA muss installiert sein.
  3. **Telegram Bot (Prio 3)** — kostenlos, keine Meta-Verifizierung, Betreiber verbindet Account einmalig im Admin. Nische, aber schnell umsetzbar.
  4. **WhatsApp Business API (später)** — mächtigste Reichweite, aber Meta-Verifizierung + approved Templates + Kosten (~€0.05–0.10/Msg). Erst bei skalierterer Nutzerbasis sinnvoll.

- **Mai 2026 — Idee: "Heute"-Dashboard-Block** — Inspiriert von Lodgify Cohost ("Wenn etwas Aufmerksamkeit braucht, erfahren Sie es sofort"). Kleiner Block oben im Admin-Dashboard mit täglicher Handlungsübersicht: "2 Gäste reisen heute an · 1 unbeantwortete Anfrage · Nächste freie Nacht: 14. Juni". Keine KI nötig — nur smarte Aggregation vorhandener DB-Daten (Buchungen, Anfragen, Nachrichten, Kalender). LP-Argument: "Behalten Sie den Überblick — ohne täglich reinzuschauen." Technisch: Server Component im Dashboard, ~1 Tag Aufwand.

- **Mai 2026 — Idee: Guest Journey Add-on** (inspiriert von reguest.io): Optionales Add-on (~€19/Mo) das den Buchungsflow nach der Bestätigung verlängert und aktiv Mehrwert + Umsatz generiert. Drei Säulen:
  1. **Pre-Arrival Mail (T-5)** — Automatische personalisierte E-Mail 5 Tage vor Anreise. Inhalt: Willkommenstext, Anreise-Infos (Anfahrt, Parkplatz, Check-in-Zeit), ausgewählte Extras aus dem Katalog mit 1-Klick-Buchung (Link in Gäste-Lounge), optionaler Upgrade-Angebot (z.B. größeres Zimmer). Hotel konfiguriert Vorlage im Admin, Platzhalter werden automatisch befüllt.
  2. **In-Stay Messenger** — Einfacher Chat-Kanal über die Gäste-Lounge. Gast schreibt, Betreiber antwortet im Admin (Push-Notification oder Mail-Fallback). Kein WhatsApp-Ersatz, aber Low-Friction-Kanal für "Handtücher fehlen", "Was empfehlen Sie zum Abendessen?" etc. Differenziert vs. reguest.io: kein separates Tool, direkt in der Gäste-Lounge.
  3. **Post-Stay Upsell** — E-Mail T+3 nach Abreise: Wiederbucher-Rabatt-Code (z.B. 10% auf nächsten Aufenthalt), Link zum Widget mit vorausgefüllten Daten, optionale Review-Anfrage (Google / eigenes System). Ziel: Stammgäste direkt binden, Provision für Folgebuchungen eliminieren.
  - **Positionierung vs. reguest.io:** reguest.io kostet je nach Paket €50–200+/Mo und ist ein eigenständiges Tool mit PMS-Integration. bookingwulf-Variante ist leichtgewichtig, direkt im bestehenden Buchungsflow integriert, kein separates Dashboard für den Gast. USP: "Alles in einem" — keine zweite App, keine zweite Anmeldung.
  - **Technisch:** Pre-Arrival Mail = neuer Trigger-Typ im bestehenden E-Mail-System (Resend). Messenger = einfache message-Tabelle in DB, Admin-View mit Unread-Badge. Post-Stay = bestehender Bewertungs-Trigger erweitern.
  - **Pricing-Überlegung:** Add-on weil nicht alle Betreiber aktive Kommunikation wollen (Ferienwohnungen ohne Personal). Pro-Plan-Betreiber als Zielgruppe. Eventuell in künftigem "Business+" Plan inklusive.
  - **Extras-Katalog (Ideen für Pre-Arrival Upsell):**
    - *Essen & Trinken:* Frühstück dazubuchen · Halbpension / Abendessen · Willkommenskorb (Wein, Brot, lokale Produkte) · Frühstück aufs Zimmer am ersten Morgen
    - *Anreise & Komfort:* Früherer Check-in (z.B. ab 12 statt 15 Uhr) · Später Check-out (z.B. bis 13 statt 11 Uhr) · Parkplatz reservieren · Transfer vom Bahnhof/Flughafen
    - *Besondere Anlässe:* Blumen / Dekoration aufs Zimmer · Flasche Sekt oder Wein · Geburtstagstorte · Romantik-Paket (Kerzen, Rosenblätter)
    - *Haustier:* Hund mitbringen (Aufpreis pro Nacht) · Hundebett / -napf bereitstellen
    - *Während des Aufenthalts:* Massagen / Wellness-Anwendungen · Leihfahrräder / E-Bikes · Skiverleih-Kooperation (in Bergregionen besonders relevant) · Ausflugstipps mit Buchung (geführte Wanderung etc.) · Wäscheservice

- **Mai 2026:** Beds24-Gäste erhalten Zugang zur Gäste-Lounge — beim Beds24-Webhook wird beim Erstellen einer Buchung automatisch ein `checkinToken` generiert. Im Admin-Buchungsdetail gibt es eine „Gäste-Lounge"-Zeile mit „Link öffnen" und „Link kopieren". Kein automatischer E-Mail-Versand — Hotel schickt den Link selbst über den jeweiligen Kanal (Airbnb-Chat, WhatsApp etc.).

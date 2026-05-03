# 🐺 bookingwulf — Projektübersicht

> Direktbuchungssystem für Hotels & Ferienwohnungen — ohne Provision, ohne Drittplattformen
> Stand: April 2026

---

# 🔑 Login-Daten & Zugänge

| Service | URL | Login |
|--------|-----|-------|
| App (Live) | bookingwulf.com/admin | E-Mail + Passwort |
| Vercel | vercel.com | — |
| Neon (Datenbank) | console.neon.tech | — |
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

| Plan | Monatlich | Jährlich | Apartments | Nutzer |
|------|-----------|----------|------------|--------|
| Starter | €55 | €49/Mo | 5 | 1 |
| Pro | €109 | €99/Mo | 20 | 3 |
| Business | €217 | €199/Mo | Unbegrenzt | Unbegrenzt |

**Trial:** 14 Tage kostenlos, keine Kreditkarte nötig

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
- [x] Sofortbuchung & Anfragemodus (pro Widget konfigurierbar) — Sofortbuchung setzt Status automatisch auf "gebucht", kein manueller Schritt nötig
- [x] Online Check-in — Gast füllt Meldezettel-Daten (Geburtsdatum, Staatsangehörigkeit, Ausweisnummer) + Ankunftszeit vorab aus; Hotel bekommt Benachrichtigung per E-Mail
- [x] Anzahlung & Bankdaten — konfigurierbarer Anzahlungsbetrag (Prozentsatz oder Fixbetrag), Zahlungsfrist, IBAN/BIC werden im Widget und in der Bestätigungsmail angezeigt
- [x] E-Mails automatisch dreisprachig (DE / EN / IT)
- [x] Anpassbare E-Mail-Templates mit Variablen (Pro)
- [x] Branding (Farben, Schriften, Radius, Layout)
- [x] Zusatzleistungen & Versicherungen (4 Abrechnungstypen)
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

## Roadmap (geplant)

| Feature | Priorität | Plan | Status |
|---------|-----------|------|--------|
| Beds24 Channel Manager | Hoch | Pro | ✅ Live |
| Verpflegungsarten (Frühstück, Halbpension) | Mittel | Pro | 📋 Geplant |
| Preislisten-Widget (standalone, ohne Buchungsflow) | Niedrig | Alle | 📋 Geplant |
| Vorauszahlung via Stripe | Hoch | Business | 📋 Geplant |
| Automatisierte Trigger-E-Mails (Upsell T-7, Anreise T-1, Bewertung T+1) | Hoch | Pro | 📋 Geplant |
| Gast-Portal (Buchungsübersicht) | Mittel | Alle | 📋 Geplant |
| Verfügbarkeits-Widget (Gantt-Kalender einbettbar auf Hotel-Website) | Niedrig | Add-on €9/Mo | 💡 Idee |
| Review-System / Bewertungen | Mittel | Pro | 💡 Idee |
| Gutschein- & Rabattcodes | Mittel | Pro | 💡 Idee |
| Preisvergleichs-Badge im Widget ("X% günstiger als Booking.com") | Mittel | Pro | 💡 Idee |
| Housekeeping-Modul (Reinigungsaufgaben per Magic-Link) | Mittel | Pro | 💡 Idee |
| DATEV / Buchhaltungsexport (CSV mit Steuerpositionen) | Mittel | Business | 💡 Idee |
| Google Hotels Free Booking Links (Meta-Suche) | Niedrig | Business | 💡 Idee |
| Affiliate- / Empfehlungsprogramm für Betreiber | Niedrig | — | 💡 Idee |
| SMS-Benachrichtigungen | Niedrig | Pro | 💡 Idee |
| Mehrsprachiges Admin-Panel | Niedrig | Alle | 💡 Idee |
| Weitere Widget-Sprachen (FR, HR...) | Niedrig | Alle | 💡 Idee |
| Mobile App (Admin) | Niedrig | Alle | 💡 Idee |

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

- [ ] ...

## 🟡 Diese Woche / Bald

- [x] Beds24 Channel Manager fertiggestellt (Mai 2026)
- [ ] Ersten Pilotkundenerfahrungsbericht (Case Study) erstellen
- [ ] Google Ads Kampagne planen

## 🟢 Backlog — Produkt

### Features
- [ ] Verpflegungsarten pro Apartment (Frühstück, Halbpension, ohne) — Pflicht-Selektor im Widget, Preisaufschlag pro Person/Nacht, `ApartmentBoardType`-Tabelle → Pro
- [ ] Preislisten-Widget (`public/price-widget.html`) — standalone Preistabelle ohne Buchungsflow, optionaler Datepicker berechnet Preis für gewählten Zeitraum, "Anfragen/Buchen"-Button öffnet Haupt-Widget mit vorausgefüllten Daten, 1 Script-Tag Einbindung → Alle Pläne
- [ ] Vorauszahlung via Stripe (Online-Kartenzahlung bei Sofortbuchung — Banküberweisung bereits live)
- [ ] Gast-Portal (Link in Bestätigungs-E-Mail → Buchungsübersicht, Stornierung)
- [ ] Automatische Erinnerungs-E-Mail (X Tage vor Anreise)
- [ ] Bewertungsanfrage nach Abreise (automatische E-Mail)
- [ ] Review-System / Bewertungen im Widget anzeigen
- [ ] Mehrere Hotels pro Business-Account (aktuell 2 — limit erhöhen oder dynamisch)
- [ ] Gutschein- & Rabattcodes (prozentual / absolut, zeitlich begrenzt, pro Apartment) → Pro
- [ ] Preisvergleichs-Badge im Widget ("X% günstiger als Booking.com") → Pro
- [ ] Mini-Widget: "ab X €/Nacht" Preisanzeige — Mindestpreis aus Apartment-Einstellungen automatisch anzeigen, wartungsfrei, kein manueller Eintrag nötig
- [ ] Housekeeping-Modul: Reinigungsaufgaben nach Abreise, Status offen/fertig, Zugang per Magic-Link ohne Login → Pro
- [ ] DATEV / Buchhaltungsexport: CSV mit Buchungen und Steuerpositionen → Business
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
| Rate Limiting | ✅ | Alle öffentlichen APIs abgesichert (30–120 req/Min. per IP) |
| Beds24 Webhook | ✅ | timingSafeEqual Token-Vergleich |
| CORS | ⚠️ | `*` auf Widget-APIs — gewollt, aber keine zentrale Kontrolle |

## Rate Limits (öffentliche APIs)

| Route | Limit |
|-------|-------|
| POST /api/request | 10/15 Min. per IP + 3/5 Min. per E-Mail |
| GET /api/availability-quick | 60/Min. per IP |
| GET /api/availability-widget | 30/Min. per IP |
| GET /api/hotel-settings | 60/Min. per IP |
| GET /api/pricing | 120/Min. per IP |

---

# 🏗️ Tech-Stack (Referenz)

| Bereich | Technologie | Version |
|---------|-------------|---------|
| Framework | Next.js (App Router) | 16.2.2 |
| UI | React + Tailwind CSS v4 | 19.2.4 |
| Datenbank | PostgreSQL via Neon (Frankfurt) | — |
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

- **April 2026:** Pricing-Strategie Add-ons vs. Pläne: Features grundsätzlich in Pläne integrieren, Add-ons nur für echte Spalter-Features (manche wollen es unbedingt, andere nie). Vorauszahlung → Business (kein eigener Add-on), um den USP "0% Provision / keine Gebühren" zu schützen. Keine eigene Transaktionsgebühr — Stripe-Fees laufen direkt über den Kunden-Account. Trigger-E-Mails → Pro.
- **April 2026:** Almenparadies Gaistal als erster Pilot-Kunde live
- **April 2026:** Google Analytics + Cookie-Banner live (DSGVO-konform, opt-in)
- **April 2026:** hungrywulf-Integration — Tischreservierungs-App per Magic-Link für bookingwulf-Kunden; Superadmin schaltet pro Hotel frei, Provisionierung automatisch, kein separates Login für den Kunden nötig
- **Design-Entscheid:** Keine inline Styles — immer CSS-Klassen (verhindert Theme-Konflikte)
- **Architektur-Entscheid:** Multi-Tenancy via hotelId (kein Schema-Splitting), Daten physisch in Frankfurt
- **Auth-Entscheid:** Kein Auth.js / NextAuth — eigene JWT-Implementierung für volle Kontrolle

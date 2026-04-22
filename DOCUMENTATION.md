# bookingwulf — Interne Dokumentation

> Stand: April 2026  
> Stack: Next.js 16 · React 19 · PostgreSQL (Neon/Frankfurt) · Stripe · Resend · Vercel

---

## Inhaltsverzeichnis

1. [Produktübersicht](#1-produktübersicht)
2. [Architektur](#2-architektur)
3. [Tech-Stack](#3-tech-stack)
4. [Datenbankschema](#4-datenbankschema)
5. [Authentifizierung & Sessions](#5-authentifizierung--sessions)
6. [Pläne & Feature-Gates](#6-pläne--feature-gates)
7. [Buchungsablauf](#7-buchungsablauf)
8. [Widget-System](#8-widget-system)
9. [E-Mail-System](#9-e-mail-system)
10. [iCal-Sync](#10-ical-sync)
11. [Stripe-Integration](#11-stripe-integration)
12. [Admin-Bereich](#12-admin-bereich)
13. [API-Routen](#13-api-routen)
14. [Umgebungsvariablen](#14-umgebungsvariablen)
15. [Deployment](#15-deployment)
16. [Schlüsselloses Einchecken (Nuki)](#16-schlüsselloses-einchecken-nuki-pro)
17. [Beds24 Channel Manager](#17-beds24-channel-manager-pro-in-vorbereitung)
18. [Datenschutz & DSGVO](#18-datenschutz--dsgvo)

---

## 1. Produktübersicht

bookingwulf ist ein SaaS-Buchungssystem für Hotels und Ferienwohnungen. Hotelbetreiber binden ein JavaScript-Widget in ihre eigene Website ein, über das Gäste direkt Buchungsanfragen oder verbindliche Buchungen stellen können — ohne Provision und ohne Drittplattform.

**Kernfunktionen:**
- Buchungs-Widget (iframe) einbettbar auf jeder Website
- Multi-Apartment-Verwaltung mit Bildern, Preissaisons und Sperrzeiten
- Echtzeit-Verfügbarkeitsprüfung
- iCal-Sync mit Airbnb & Booking.com
- Automatische E-Mails (Gast + Hotel), dreisprachig (de/en/it)
- Anpassbares Branding (Farben, Schriften, Layout)
- Zusatzleistungen & Versicherungen
- Stripe-Abonnements (Starter / Pro / Business)
- Analytics-Dashboard (Business-Plan)

---

## 2. Architektur

```
┌─────────────────────────────────────────────────────────────┐
│                        Gast-Website                          │
│   <script src="bookingwulf.com/widget.js"                    │
│           data-hotel="hotel-slug" />                         │
│                          │                                   │
│          ┌───────────────▼──────────────┐                   │
│          │     iframe: /widget.html      │                   │
│          │  (Vanilla JS, CSS variables)  │                   │
│          └───────────────┬──────────────┘                   │
└──────────────────────────┼──────────────────────────────────┘
                           │ fetch
          ┌────────────────▼────────────────┐
          │       Next.js App (Vercel)       │
          │                                 │
          │  /api/hotel-settings  (public)  │
          │  /api/apartments      (public)  │
          │  /api/availability    (public)  │
          │  /api/request         (public)  │
          │  /api/admin/*         (auth)    │
          │  /api/stripe/*        (auth)    │
          │                                 │
          │  /admin/*  (Admin-Panel)        │
          └──────────┬──────────────────────┘
                     │ Prisma ORM
          ┌──────────▼──────────────────────┐
          │  PostgreSQL (Neon, Frankfurt)   │
          └─────────────────────────────────┘
```

**Multi-Tenancy:** Alle Daten sind über `hotelId` isoliert. Ein `Hotel`-Datensatz ist der Anker für Apartments, Buchungen, Einstellungen, Nutzer und Abonnement.

**Datenhaltung:** Datenbank physisch in Frankfurt (EU) — kein Drittlandtransfer für Kundendaten.

---

## 3. Tech-Stack

| Bereich | Technologie | Version |
|---|---|---|
| Framework | Next.js (App Router) | 16.2.2 |
| UI | React | 19.2.4 |
| Sprache | TypeScript | 5 |
| Datenbank | PostgreSQL via Neon | — |
| ORM | Prisma | 7.7.0 |
| Auth | jose (JWT) + Node.js crypto | — |
| Zahlung | Stripe SDK | 22.0.2 |
| E-Mail | Resend | 6.10.0 |
| Uploads | Vercel Blob | 2.3.3 |
| iCal | ical.js | 2.2.1 |
| Validierung | Zod | — |
| CSS | Tailwind CSS v4 | — |
| Monitoring | Sentry | 10.49.0 |
| Deployment | Vercel | — |

---

## 4. Datenbankschema

### Hotel *(Kern-Entität, Multi-Tenant-Anker)*

| Feld | Typ | Beschreibung |
|---|---|---|
| id | Int | Primary Key |
| name | String | Hotelname |
| slug | String (unique) | URL-Kennung für Widget-Einbindung |
| email | String? | Empfangs-E-Mail für Buchungen |
| plan | String | `starter` / `pro` / `business` |
| subscriptionStatus | String | `trialing` / `active` / `inactive` / `past_due` |
| trialEndsAt | DateTime? | Ende der 14-Tage-Testphase |
| stripeCustomerId | String? | Stripe-Kunden-ID |
| stripeSubscriptionId | String? | Aktive Stripe-Subscription |
| accentColor | String? | Globale Akzentfarbe (Fallback) |
| bookingTermsUrl | String? | AGB-Link im Widget |
| privacyPolicyUrl | String? | Datenschutz-Link im Widget |

### HotelSettings *(UI-Konfiguration)*

Erweiterte Einstellungen pro Hotel. Enthält:
- **Feature-Toggles:** `showPrices`, `allowMultiSelect`, `showAmenities`, `showExtrasStep`, `showPhoneField`, `showMessageField`, `enableImageSlider`, `instantBooking`, `enableInstantBooking`
- **Farben:** `accentColor`, `backgroundColor`, `cardBackground`, `textColor`, `mutedTextColor`, `borderColor`, `buttonColor`
- **Typografie:** `headlineFont`, `bodyFont`, `headlineFontSize`, `bodyFontSize`, `headlineFontWeight`, `bodyFontWeight`
- **Layout:** `cardRadius`, `buttonRadius`
- **Ortstaxe:** `ortstaxePerPersonPerNight` (Decimal?), `ortstaxeMinAge` (Int?) — Kinder unter diesem Alter sind befreit

### WidgetConfig *(Pro+: mehrere Widgets pro Hotel)*

Erlaubt es, pro Einbettungsort andere Feature-Toggles zu setzen (z.B. Widget A = Anfrage-Modus, Widget B = Sofortbuchung). Eindeutiger Schlüssel: `hotelId + slug`.

### Apartment *(Mieteinheit)*

| Feld | Typ | Beschreibung |
|---|---|---|
| name | String | Apartment-Name |
| hotelId | Int | FK → Hotel |
| basePrice | Decimal? | Grundpreis pro Nacht |
| cleaningFee | Decimal? | Einmalige Reinigungsgebühr |
| maxAdults | Int? | Maximale Erwachsene |
| maxChildren | Int? | Maximale Kinder |
| size | Int? | Größe in m² |
| bedrooms | Int? | Schlafzimmer |
| amenities | String[] | Ausstattungsmerkmale |
| isActive | Boolean | Sichtbarkeit im Widget |

Relationen: `ApartmentImage[]`, `PriceSeason[]`, `BlockedRange[]`, `IcalFeed[]`

### PriceSeason *(Dynamische Preise)*

Zeitraum mit eigenem Preis pro Nacht und optionalem Mindestaufenthalt (`minStay`). Wird bei der Preisberechnung täglich geprüft — der erste passende Season-Preis gewinnt, sonst gilt `basePrice`.

### BlockedRange *(Sperrzeiten)*

| Feld | Typ | Beschreibung |
|---|---|---|
| type | String | `ical_sync` / `booking` / manuell |
| startDate / endDate | DateTime | Gesperrter Zeitraum |
| apartmentId | Int? | Einzelnes Apartment (oder null = ganzes Hotel) |
| note | String? | Interne Notiz |

### Request *(Buchungsanfrage / Buchung)*

| Feld | Typ | Beschreibung |
|---|---|---|
| hotelId | Int | FK → Hotel |
| status | String | `new` / `confirmed` / `booked` / `cancelled` |
| arrival / departure | DateTime | Reisezeitraum |
| nights | Int | Anzahl Nächte |
| adults / children | Int | Gästezahl |
| selectedApartmentIds | String | Kommagetrennte Apartment-IDs |
| email / firstname / lastname | String | Gastdaten |
| salutation / country / message | String? | Optionale Felder |
| newsletter | Boolean | Newsletter-Einwilligung |
| language | String | `de` / `en` / `it` |
| extrasJson | Json | Gebuchte Zusatzleistungen (Zeilenpositionen) |

### HotelExtra *(Zusatzleistungen)*

| `type` | `billingType` | Berechnung |
|---|---|---|
| `extra` / `insurance` | `per_night` | Preis × Nächte |
| | `per_person_per_night` | Preis × Personen × Nächte |
| | `per_stay` | Pauschal |
| | `per_person_per_stay` | Preis × Personen |

Optionale Felder: `imageUrl` (Thumbnail im Widget), `description` (Kurztext unter dem Namen).

### ChildPriceRange *(Kinderpreise nach Altersgruppe)*

Pro Hotel definierbare Altersgruppen mit Preis pro Kind/Nacht. Felder: `minAge`, `maxAge`, `pricePerNight` (0 = Gratis), `label` (optional, z.B. "Kleinkind"), `sortOrder`. Das Widget berechnet den Kinderaufschlag aus den Geburtsdaten der Kinder (Schritt 1) und zeigt ihn im Preis-Popover und der Summary-Sidebar auf. Kinder ohne passende Altersgruppe sind kostenlos.

### AdminUser *(Login-Account)*

- Passwort: `scrypt` mit 16-Byte-Salt (nicht umkehrbar)
- Kann mehreren Hotels zugeordnet sein (via `AdminUserHotel`)
- Password-Reset via Token + Ablaufzeit (`resetToken`, `resetExpiresAt`)

### EmailTemplate *(Benutzerdefinierte E-Mails, Pro+)*

Pro Hotel und Typ (`request_guest`, `booking_guest`, `cancellation_guest`, `request_hotel`) speicherbare Vorlage mit Template-Variablen: `{{guestName}}`, `{{guestLastName}}`, `{{arrival}}`, `{{departure}}`, `{{nights}}`, `{{apartmentName}}`, `{{hotelName}}`, `{{bookingId}}`.

`cancellation_guest` wird beim Setzen des Status auf `cancelled` verwendet (Fallback auf i18n-Standard wenn nicht gesetzt).

### IcalFeed

URL-Eintrag für externen Kalender (Airbnb, Booking.com). Speichert `lastSyncAt` und `lastError`. Sync erstellt/ersetzt `BlockedRange`-Einträge vom Typ `ical_sync`.

### NukiConfig *(Pro+: Schlüsselloses Einchecken)*

Speichert den Nuki Web API-Token pro Hotel (`@unique` auf `hotelId`). Der Token wird beim Speichern gegen die Nuki API verifiziert.

Apartment bekommt `nukiSmartlockId` (optional) — verknüpft das Apartment mit einem konkreten Nuki-Schloss.

Request bekommt `nukiCode` (6-stelliger Code als String) und `nukiAuthIds` (`"smartlockId:authId"` kommagetrennt für spätere Löschung).

---

## 5. Authentifizierung & Sessions

### Registrierung

1. Formular: Hotelname, Slug (auto-generiert), E-Mail, Passwort
2. **Honeypot-Feld** (`name="website"`, visuell versteckt) — Bot-Submissions werden lautlos ignoriert
3. Server Action erstellt `Hotel` + `AdminUser`; `isEmailVerified = false`, `emailVerifyToken` (32-Byte Hex, 24h gültig) gesetzt
4. `subscriptionStatus = 'trialing'`, `trialEndsAt = jetzt + 14 Tage`
5. **Bestätigungs-E-Mail** mit Link zu `/api/auth/verify-email?token=...` wird versandt
6. Weiterleitung zu `/register/check-email` (Hinweisseite, kein Session-Cookie)

### E-Mail-Verifizierung

- Route: `GET /api/auth/verify-email?token=<token>`
- Token wird in `AdminUser.emailVerifyToken` (unique) gesucht
- Abgelaufen (`emailVerifyTokenExpiresAt < now`) → Redirect zu `/register?error=token_expired`
- Gültig → `isEmailVerified = true`, Token-Felder geleert, Session-Cookie gesetzt, Redirect zu `/admin/onboarding`
- **Bestehende Konten** (vor Einführung der Verifizierung): `emailVerifyToken = null` → Login weiterhin möglich ohne Verifizierung

### Login

1. E-Mail + Passwort → Server Action `login()`
2. Rate Limit: 5 Versuche / 15 Minuten pro E-Mail
3. `AdminUser` per E-Mail suchen, Passwort via `scrypt` + Timing-Safe-Vergleich prüfen
4. Falls `!isEmailVerified && emailVerifyToken !== null` → Fehlermeldung (Verifizierung ausstehend)
5. JWT-Cookie setzen (httpOnly, secure, sameSite=lax, 24h TTL)
6. Client-seitige Navigation zu `/admin` (verhindert Cache-Artefakte)

### Session-Payload

```typescript
{
  userId: number,
  email: string,
  role: 'hotel_admin' | 'super_admin',
  hotelId: number | null   // null = Super-Admin
}
```

### Absicherung

- `verifySession()` in allen geschützten Routen (gecacht pro Request)
- Super-Admin (`hotelId === null`) hat Zugriff auf alle Hotels
- Abo-Status wird im Layout geprüft → Weiterleitung zu `/admin/billing` bei `inactive`
- Trial-Ablauf wird serverseitig geprüft und ggf. auf `inactive` gesetzt

---

## 6. Pläne & Feature-Gates

### Preise

| Plan | Monatlich | Jährlich | Apartments | Nutzer | Hotels |
|---|---|---|---|---|---|
| **Starter** | €55 | €49 | 5 | 1 | 1 |
| **Pro** | €109 | €99 | 20 | 3 | 1 |
| **Business** | €217 | €199 | unbegrenzt | unbegrenzt | 2 |

### Feature-Gates (`src/lib/plan-gates.ts`)

Navigations-Sperren (`NAV_PLAN_GATES`):

| Route | Mindestplan |
|---|---|
| `/admin/price-seasons` | Pro |
| `/admin/extras` | Pro |
| `/admin/email-templates` | Pro |
| `/admin/users` | Pro |
| `/admin/widget-configs` | Pro |
| `/admin/analytics` | Business |

Weitere Prüfungen per `hasPlanAccess(hotelPlan, minPlan)`:
- Apartment-Limit
- Nutzer-Limit
- Branding-Features (Farben, Schriften)
- Messaging (Gast-Kommunikation)
- **Pro**: Last-Minute Rabatt, Mindestaufenthalt pro Saison (`/api/pricing` prüft Plan vor Anwendung)
- **Business**: Belegungsbasierter Preisaufschlag (`/api/pricing`)

In der Navigation werden gesperrte Einträge mit 🔒 und Tooltip angezeigt.

---

## 7. Buchungsablauf

### Verfügbarkeitsprüfung (`POST /api/availability`)

```
1. Zod-Validierung der Eingabe
2. Hotel per Slug suchen
3. Apartments nach Namen filtern (nur aktive)
4. BlockedRange-Überschneidungen prüfen
5. Bestätigte Buchungen (status='booked') auf Überschneidung prüfen
6. Preis berechnen:
   - Pro Nacht: PriceSeason suchen → pricePerNight oder basePrice
   - Reinigungsgebühr addieren
7. Antwort: { available, nights, totalPrice, apartments[] }
```

### Buchungsanfrage (`POST /api/request`)

```
1. Rate Limit: 10/IP/15min + 3/E-Mail/5min
2. Zod-Validierung
3. Hotel + Apartments laden
4. Preis berechnen (season-aware, inkl. Extras)
5. Request in DB speichern
6. Bei bookingType='booking': BlockedRange pro Apartment erstellen
7. Hotel-Benachrichtigung (Deutsch) senden
8. Gast-Bestätigung (Sprache auto-erkannt: de/en/it) senden
9. { success: true, requestId } zurückgeben
```

### Preisberechnung (Extras)

| billingType | Formel |
|---|---|
| `per_night` | Preis × Nächte |
| `per_person_per_night` | Preis × (Erwachsene + Kinder) × Nächte |
| `per_stay` | Preis × 1 |
| `per_person_per_stay` | Preis × (Erwachsene + Kinder) |

---

## 8. Widget-System

### Einbindung

```html
<script
  src="https://bookingwulf.com/widget.js"
  data-hotel="hotel-slug"
  data-config="widget-slug">
</script>
```

`widget.js` erstellt ein `<iframe>` das `/widget.html?hotel=...&config=...` lädt.

### Kommunikation iframe ↔ Elternseite

| Nachricht (iframe → parent) | Bedeutung |
|---|---|
| `{ type: 'booking-widget-resize', height: N }` | iframe passt Höhe an |
| `{ type: 'booking-widget-scroll-top' }` | Elternseite scrollt nach oben |

### Widget-HTML (`/public/widget.html`)

Reines Vanilla-JS + CSS Custom Properties. Ablauf:
1. `GET /api/hotel-settings` → Styling + Feature-Toggles laden
2. `GET /api/apartments` → Apartment-Liste laden
3. Visueller Kalender-Datepicker (Schritt 1): 2-Monats-Ansicht, Drag-Range-Auswahl mit Hover-Preview
4. `POST /api/availability` → Preis berechnen
5. Extras-Schritt (falls aktiviert)
6. Gast-Formular (Name, E-Mail Pflicht; Telefon optional; Adresse im aufklappbaren Accordion)
7. `POST /api/request` → Buchung absenden

**Kalender-Datepicker:** Ersetzt native `<input type="date">` durch einen eigenen Kalender (`.cal-picker`). Zeigt 2 Monate nebeneinander (1 auf Mobile). Erster Klick = Anreise, zweiter Klick = Abreise. Hover zeigt Range-Preview. Vergangene Tage deaktiviert. Nächte-Zahl wird live angezeigt. Die ursprünglichen Inputs bleiben als `type="hidden"` erhalten.

**Formular-Friction-Reduktion:** Telefon ist optional (kein `*`, kein required-Check). Adresse (Straße, PLZ, Ort, Land) ist in einem `.addr-accordion` „Adresse (optional)" versteckt. Inline-Feldvalidierung markiert leere Pflichtfelder (Vorname, Nachname, E-Mail) rot mit Fehlermeldung direkt unter dem Feld statt nur globaler Fehlermeldung.

**Preistransparenz:** Apartment-Karte zeigt den Gesamtpreis prominent. Klick auf „Preis Details" (`.apt-price-details-btn`) öffnet ein Popover (`.apt-price-popover`) mit vollständiger Aufschlüsselung: Anzahl Nächte + Saison, `X × €Y/Nacht`, Endreinigung, Last-Minute/Nachfrage-Label, Gesamtbetrag fett. Popover schließt sich bei Klick außerhalb. State: `state.openPricePopover` (Apartment-ID oder null). Summary-Sidebar zeigt dieselbe Aufschlüsselung nochmals als Tabelle, inkl. Kinderpreise und Ortstaxe.

**Ortstaxe:** `state.ortstaxePerPersonPerNight` + `state.ortstaxeMinAge` werden aus `/api/hotel-settings` geladen. `calcOrtstaxe(nights)` berechnet den Betrag (Adults + berechtigte Kinder × Rate × Nächte). Kinder unter `ortstaxeMinAge` sind befreit (Altersberechnung via `getChildAge()`). Ortstaxe erscheint in der Summary-Sidebar und wird in `getTotal()` addiert. Im `POST /api/request` wird Ortstaxe serverseitig neu berechnet und in die Preis-E-Mail aufgenommen.

**Floating Labels:** Alle Formularfelder im Widget verwenden das Floating-Label-Pattern (`.field-block` + `.label`): Label startet als Placeholder zentriert im Input, schwebt bei Fokus/Wert nach oben. Selects haben das Label immer in der gefloateten Position (da sie immer sichtbaren Text zeigen). Initialisierung via `initFloatingLabels(root)` mit `_floatInit`-Guard gegen doppelte Listener.

**Smooth Animationen:** Alle Accordions (Gäste Daten, Adresse, Zahlungsoptionen) verwenden `max-height` + `padding`-Transition statt `display:none/block`. „Mehr lesen" expandiert via `max-height`-Animation ohne DOM-Rebuild (`renderApartments()` wird nicht aufgerufen — nur CSS-Klasse direkt toggle). Ausstattung-Chevron ist SVG statt Unicode für pixelgenaue Ausrichtung.

### CSS-Custom-Properties

Das Widget verwendet CSS-Variablen, die von `/api/hotel-settings` befüllt werden:
`--accent`, `--bg`, `--surface-2`, `--text`, `--muted`, `--border`, `--radius`, `--btn-radius`, etc.

### Mini-Widget (`/public/mini-widget.html`)

Kompaktes Datepicker-Bar-Widget für einfache Einbindung auf Landing Pages. Zeigt nur Anreise/Abreise-Felder + Anfrage/Buchen-Buttons. Beim Klick wird auf das Haupt-Widget weitergeleitet mit vorausgefüllten Daten.

**Einbindung:**
```html
<iframe src="https://bookingwulf.com/mini-widget.html?hotel=hotel-slug&config=widget-slug"
  style="width:100%;border:none;height:120px;" scrolling="no"></iframe>
```

**URL-Parameter:** `hotel`, `config`, `target` (Ziel-URL falls vom Standard abweichend).

**Ablauf:**
1. Lädt Theme + Feature-Toggles via `/api/hotel-settings`
2. Passt Buttons an (Anfrage / Buchen / beides je nach `enableInstantBooking` + `hideRequestOption`)
3. Klick navigiert zu `/widget.html?hotel=...&arrival=...&departure=...&type=request|booking`

**Haupt-Widget URL-Parameter (neu):** `arrival`, `departure`, `type` — Pre-füllen Datepicker und springen direkt zu Schritt 2.

**postMessage an Parent:**
- `{ type: 'mini-widget-height', height: N }` — für iframe-Resize
- `{ type: 'mini-widget-navigate', url: '...' }` — Navigation-Event (Elternseite kann eigenes Routing übernehmen)

### WidgetConfig (Pro+)

Pro Einbettungsort kann ein eigenes `config`-Slug konfiguriert werden mit eigenen Feature-Toggles. Erlaubt z.B. ein Widget nur für Anfragen und ein zweites für Sofortbuchung.

### Plan-basiertes Widget-Rendering

`/api/hotel-settings` filtert Einstellungen nach Plan:
- Starter: keine Branding-Farben, keine Typografie
- Pro: Farben + Typografie, keine Business-Features
- Business: alle Einstellungen

---

## 9. E-Mail-System

### Gesendete E-Mails

| Auslöser | Empfänger | Vorlage |
|---|---|---|
| Registrierung | Hotelbetreiber | Welcome + Trial-Info |
| Buchungsanfrage | Hotel | Anfrage-Benachrichtigung (Deutsch) |
| Buchungsanfrage | Gast | Bestätigung (de/en/it, anpassbar) |
| Sofortbuchung | Hotel | Buchungs-Benachrichtigung |
| Sofortbuchung | Gast | Buchungsbestätigung |
| Abo-Abschluss | Hotelbetreiber | Plan-Bestätigung |
| Passwort-Reset | Admin-Nutzer | Reset-Link (1h gültig) |

### E-Mail-Aufbau (`src/lib/email.ts`)

```
buildEmailHtml({
  hotelName, accentColor,
  title, preheader, body, footer
})
```

Responsive HTML-Template (max. 600px), Akzentfarbe in Header und Buttons, Auto-Reply-Hinweis in Gast-Mails.

### Template-Variablen

`{{guestName}}`, `{{guestLastName}}`, `{{hotelName}}`, `{{arrival}}`, `{{departure}}`, `{{nights}}`, `{{apartmentName}}`, `{{bookingId}}`

### Mehrsprachigkeit

`src/lib/email-i18n.ts` — Übersetzungen für `de`, `en`, `it`. Sprache wird automatisch aus dem Browser-Language-Header des Gastes erkannt.

### Provider

**Resend** — API-Key via `RESEND_API_KEY`. Fehlt der Key, schlagen E-Mails still fehl (kein Absturz).

---

## 10. iCal-Sync

Importiert externe Kalender (Airbnb, Booking.com) als `BlockedRange`-Einträge.

### Ablauf

1. Für jeden `IcalFeed`-Eintrag: `.ics`-URL abrufen
2. Kalender mit `ical.js` parsen
3. Alte `BlockedRange`-Einträge vom Typ `ical_sync` für diesen Feed löschen
4. Neue Einträge für alle Events erstellen
5. `lastSyncAt` oder `lastError` aktualisieren

### Trigger

- **Automatisch:** Vercel Cron, alle 30 Minuten (`GET /api/ical-sync` mit Bearer-Token)
- **Manuell:** Admin klickt "Jetzt synchronisieren" → `POST /api/ical-sync` mit `feedId`

### Skalierung

`syncAllFeeds()` verarbeitet alle Feeds in parallelen Batches à 10 (`Promise.allSettled`). Ein fehlgeschlagener Feed unterbricht nicht die übrigen. Timeout pro Feed: 15 Sekunden.

---

## 11. Stripe-Integration

### Checkout-Flow

```
1. Admin klickt "Upgrade"
2. POST /api/stripe/checkout { plan, interval, hotelId }
3. Server: Stripe-Kunden erstellen/abrufen
4. Stripe Checkout Session erstellen
5. Weiterleitung zur Stripe-Checkout-Seite
6. Gast zahlt → Stripe sendet Webhook
7. checkout.session.completed → Hotel aktualisieren, Welcome-E-Mail senden
```

### Webhooks (`POST /api/stripe/webhook`)

| Event | Aktion |
|---|---|
| `checkout.session.completed` | Plan + Subscription speichern, Status → `active` |
| `customer.subscription.updated` | Plan aktualisieren |
| `customer.subscription.deleted` | Plan → Starter, Branding-Einstellungen löschen |
| `invoice.payment_failed` | Status → `past_due` |

Jeder Webhook wird per Stripe-Signatur verifiziert (`STRIPE_WEBHOOK_SECRET`).

### Stripe-Portal

`POST /api/stripe/portal` → Link zum Stripe Customer Portal für Planwechsel, Kündigung, Rechnungen.

### Preise

Stripe Price IDs via Umgebungsvariablen (monatlich + jährlich je Plan). Mapping in `src/lib/stripe.ts` → `getPriceId(plan, interval)`.

---

## 12. Admin-Bereich

### Seitenstruktur

| Seite | Plan | Funktion |
|---|---|---|
| `/admin` | Alle | Dashboard (offene Anfragen, nächste Ankünfte) |
| `/admin/requests` | Alle | Buchungsanfragen verwalten |
| `/admin/requests/[id]` | Alle | Detailansicht, Messaging (Business) |
| `/admin/calendar` | Alle | Monatskalender mit Sperrzeiten + Buchungen |
| `/admin/apartments` | Alle | Apartments anlegen, Bilder hochladen |
| `/admin/blocked-dates` | Alle | Manuelle Sperrzeiten |
| `/admin/price-seasons` | Pro | Saisonale Preise |
| `/admin/extras` | Pro | Zusatzleistungen & Versicherung |
| `/admin/email-templates` | Pro | E-Mail-Vorlagen anpassen |
| `/admin/users` | Pro | Team-Mitglieder einladen |
| `/admin/widget-configs` | Pro | Mehrere Widget-Konfigurationen |
| `/admin/settings` | Alle | Hotel-Info, Branding, Widget-Optionen |
| `/admin/nuki` | Pro | Nuki-Verbindung einrichten, Schlösser anzeigen |
| `/admin/analytics` | Business | Buchungsstatistiken |
| `/admin/billing` | Alle | Abonnement, Upgrade, Kündigung |
| `/admin/help` | Alle | Handbuch |

### Super-Admin-Seiten

| Seite | Funktion |
|---|---|
| `/admin/hotels` | Alle Hotels verwalten |
| `/admin/users` | Alle Nutzer verwalten |

Der Super-Admin hat `hotelId = null` in der Session und Zugriff auf alle Hotels.

### Layout

- Desktop: Feste Sidebar (220px) links, Hauptinhalt rechts
- Mobile: Sidebar ausgeblendet, Hamburger-Menü in Top-Bar
- Footer: Impressum, Datenschutz, AGB, AVV, Support

### Admin-Seiten UI

Detailseiten (Buchung `[id]`, Sperrzeit-Edit, Zimmerplan) nutzen ein einheitliches Card-Design: weißer Hintergrund, `border: 1px solid #e5e7eb`, `borderRadius: 16`, `boxShadow: 0 4px 16px rgba(15,23,42,0.06)`. Die Buchungsdetail-Seite zeigt Infos als 2-Spalten-Grid (Muted Label | Wert) mit deutschen Datumsformaten (`de-AT`) und separater Aktions-Sektion (Mail-Sprache + Status) unterhalb einer Trennlinie. Leere Felder (z. B. Land) werden ausgeblendet.

### Sidebar-Navigation

Die Nav-Items sind in Gruppen (z. B. Betrieb, Verwaltung, Einstellungen) aufgeteilt. Betrieb-Gruppe: Übersicht, Anfragen, Kalender, Zimmerplan, Analytics. Jede Gruppe ist eine eigene Card mit Akkordeon:
- Erste Gruppe standardmäßig aufgeklappt, alle anderen zu
- Mehrere Gruppen können gleichzeitig offen sein
- Items werden immer gerendert (nur per `maxHeight` versteckt), damit `data-tour`-Attribute für die Geführte Tour im DOM erreichbar bleiben
- Logout-Icon im Sidebar-Header (oben rechts)

### Kalender — Drag-to-Create

Klick-Drag über Tageszellen markiert einen Zeitraum (lila Highlight). Nach dem Loslassen öffnet sich ein modales Inline-Formular (Lightbox mit Backdrop) zum direkten Anlegen von Sperrzeiten, Preiszeiträumen oder manuellen Buchungen — ohne Seitennavigation. Datumfelder sind im Formular editierbar. Nach dem Speichern wird die Seite per `router.refresh()` aktualisiert.

Sperrzeiten werden im Kalender als roter Chip `🚫` angezeigt (neben den Buchungs-Chips).

Neue Seite: `/admin/requests/new` — manuelles Buchungsformular (auch direkt aufrufbar).

### Geführte Tour

`GuidedTour`-Komponente (`app/admin/components/GuidedTour.tsx`) — schrittweise Einführung für neue Nutzer mit `data-tour`-Attributen an Nav-Elementen. Da Items immer im DOM sind (auch bei zugeklappter Gruppe), funktioniert die Tour unabhängig vom Akkordeon-Zustand.

---

## 13. API-Routen

### Öffentliche Routen (CORS: `*`, kein Auth)

| Route | Methode | Beschreibung |
|---|---|---|
| `/api/hotel-settings` | GET | Widget-Konfiguration per Hotel-Slug |
| `/api/apartments` | GET | Apartment-Liste per Hotel-Slug |
| `/api/availability` | POST | Verfügbarkeit + Preis für Zeitraum |
| `/api/pricing` | GET | Dynamische Preisberechnung (Last-Minute, Belegung, minStay) — Pro/Business |
| `/api/request` | POST | Buchungsanfrage absenden |
| `/api/ical` | GET | iCal-Feed eines Apartments |
| `/api/booking-ical` | GET | iCal-Datei für eine Buchung (HMAC-Token) |
| `/api/blocked-dates` | GET | Sperrzeiten (öffentlich, für Widget) |

### Authentifizierte Routen (JWT-Session erforderlich)

| Route | Methode | Beschreibung |
|---|---|---|
| `/api/upload` | POST | Bild-Upload (Vercel Blob, max. 10 MB) |
| `/api/ical-sync` | POST | iCal-Feed manuell synchronisieren |
| `/api/admin/blocked-date` | POST | Sperrzeit anlegen (Kalender-Inline-Formular) |
| `/api/admin/price-season` | POST | Preiszeitraum anlegen (Kalender-Inline-Formular) |
| `/api/admin/booking` | POST | Manuelle Buchung anlegen (Kalender-Inline-Formular) |
| `/api/admin/switch-hotel` | POST | Aktives Hotel wechseln |
| `/api/admin/switch-plan` | POST | Plan wechseln (nur in Trial) |
| `/api/admin/reset-trial` | POST | Trial zurücksetzen (nur Super-Admin) |
| `/api/admin/settings-presets` | GET/POST/DELETE | Branding-Presets |
| `/api/admin/email-preview` | GET | E-Mail-Vorschau |
| `/api/admin/billing-info` | GET | Abo-Status abrufen |
| `/api/stripe/checkout` | POST | Stripe Checkout Session erstellen |
| `/api/stripe/portal` | POST | Stripe Billing Portal Link |
| `/api/stripe/webhook` | POST | Stripe-Webhooks (Signatur-Verifizierung) |
| `/api/cleanup-requests` | GET | Anfragen > 3 Jahre löschen (Cron, Bearer-Token) |
| `/api/admin/nuki` | GET/POST/DELETE | Nuki-Konfiguration verwalten |

### Sicherheitsschichten

- **Zod-Validierung** auf allen API-Routen (Typen, Längen, Format)
- **Rate Limiting** (In-Memory): Login, Buchungsformular
- **Scrypt-Passwort-Hashing** mit Timing-Safe-Vergleich
- **httpOnly JWT-Cookie** (nicht via JS auslesbar)
- **Stripe Webhook-Signatur** bei jedem Webhook-Request
- **HMAC-Token** für iCal-Buchungslinks

---

## 14. Umgebungsvariablen

### Pflicht

| Variable | Beschreibung |
|---|---|
| `DATABASE_URL` | PostgreSQL-Verbindung (Neon) |
| `ADMIN_SESSION_SECRET` | JWT-Signatur-Schlüssel (mind. 32 Zeichen) |
| `NEXT_PUBLIC_APP_URL` | Basis-URL (z.B. `https://bookingwulf.com`) |
| `STRIPE_SECRET_KEY` | Stripe API-Key (live: `sk_live_...`) |
| `STRIPE_WEBHOOK_SECRET` | Webhook-Signatur-Geheimnis |
| `STRIPE_PRICE_STARTER` | Stripe Price ID — Starter monatlich |
| `STRIPE_PRICE_PRO` | Stripe Price ID — Pro monatlich |
| `STRIPE_PRICE_BUSINESS` | Stripe Price ID — Business monatlich |
| `STRIPE_PRICE_STARTER_YEARLY` | Stripe Price ID — Starter jährlich |
| `STRIPE_PRICE_PRO_YEARLY` | Stripe Price ID — Pro jährlich |
| `STRIPE_PRICE_BUSINESS_YEARLY` | Stripe Price ID — Business jährlich |
| `RESEND_API_KEY` | Resend E-Mail-API-Key |
| `BOOKING_FROM_EMAIL` | Absender-Adresse (z.B. `"bookingwulf <noreply@bookingwulf.com>"`) |
| `CRON_SECRET` | Bearer-Token für Vercel Cron-Endpunkte |

### Optional

| Variable | Beschreibung |
|---|---|
| `BOOKING_RECEIVER_EMAIL` | Fallback-E-Mail wenn Hotel keine E-Mail hinterlegt hat |
| `SENTRY_DSN` | Sentry-Fehlerverfolgung |
| `VERCEL_URL` | Automatisch von Vercel gesetzt |

---

## 15. Deployment

### Vercel

Deployment via GitHub-Integration. Jeder Push auf `main` löst ein Deployment aus.

**Cron Jobs (`vercel.json`):**

| Route | Intervall | Zweck |
|---|---|---|
| `/api/ical-sync` | alle 30 Min | Externe Kalender synchronisieren |
| `/api/cleanup-requests` | 1. des Monats, 3:00 Uhr | Anfragen > 3 Jahre löschen |

### Rate Limits (öffentliche Endpunkte)

| Endpunkt | Limit |
|---|---|
| `POST /api/request` | 10/IP/15min + 3/E-Mail/5min |
| `GET /api/apartments` | 60/IP/min |
| `GET /api/availability` | — |
| `GET /api/blocked-dates` | 30/IP/min |
| `GET /api/ical` | 20/IP/min |

Rate Limiting ist in-memory (`src/lib/rate-limit.ts`) — resettet bei Serverrestart. Für Multi-Instance-Deployments wäre Redis nötig.

### Datenbank

Neon PostgreSQL (Serverless). Migrationen via:
```bash
npx prisma migrate deploy
```

### Build

```bash
npm run build      # prisma generate + next build
npm run dev        # Lokale Entwicklung
npx prisma studio  # Datenbank-Browser
```

### Sentry

Fehler werden automatisch an Sentry gemeldet, wenn `SENTRY_DSN` gesetzt ist. Konfiguration in `instrumentation.ts` und `sentry.*.config.ts`.

---

## 16. Schlüsselloses Einchecken (Nuki, Pro+)

### Übersicht

Gäste erhalten nach einer Sofortbuchung automatisch einen 6-stelligen Zugangscode per E-Mail. Der Code ist zeitlich begrenzt (Anreise bis Abreise) und öffnet die konfigurierten Nuki-Schlösser direkt vor Ort.

### Einrichtung (Admin)

1. `/admin/nuki` → Nuki Web API-Token eingeben (aus [web.nuki.io → Account → API](https://web.nuki.io/#/account))
2. Token wird gegen Nuki API geprüft — bei Erfolg werden verfügbare Schlösser angezeigt
3. Pro Apartment in `/admin/apartments/[id]` → Schloss zuweisen

### Buchungsablauf

```
Sofortbuchung (bookingType='booking')
  → prisma.request.create()
  → für jedes Apartment mit nukiSmartlockId:
      → createNukiCode(apiToken, smartlockId, guestName, arrival, departure, code)
      → authId speichern (für spätere Löschung)
  → nukiCode + nukiAuthIds in Request speichern
  → Code in Gast-E-Mail einbetten (grüne Box)
```

### Nuki Web API (`src/lib/nuki.ts`)

| Funktion | Endpoint | Beschreibung |
|---|---|---|
| `getNukiLocks(token)` | `GET /smartlock` | Alle Schlösser des Kontos |
| `createNukiCode(...)` | `POST /smartlock/{id}/auth` | Zeitlich begrenzten Code erstellen (type 13) |
| `deleteNukiCode(...)` | `DELETE /smartlock/{id}/auth/{authId}` | Code deaktivieren |

**Hinweis:** Codes werden bei Buchung erstellt. Automatische Löschung nach Abreise ist noch nicht implementiert (manuell via Nuki-App oder als zukünftiger Cron).

### Plan-Gate

`/admin/nuki` ist Pro+ (NAV_PLAN_GATES). Die Code-Generierung in `/api/request` prüft zusätzlich `hasPlanAccess(hotel.plan, 'pro')`. Starter-Hotels generieren keine Codes, auch wenn Schlösser konfiguriert wären.

---

## 17. Beds24 Channel Manager (Pro+, In Vorbereitung)

### Übersicht

Beds24 ist ein zertifizierter Channel Manager mit direkter API-Anbindung an Airbnb und Booking.com. bookingwulf dockt an Beds24 an, statt selbst Plattform-Zertifizierungen zu durchlaufen. Beds24 kostet ~€9/Monat pro Property beim Hotelier.

### Architektur

```
Airbnb ←→ Beds24 ←→ bookingwulf ←→ DB
Booking.com ←→ Beds24 ↗
```

- **Inbound (Echtzeit):** Beds24 → Webhook → `/api/beds24-webhook` → `BlockedRange` anlegen
- **Outbound (sofort):** Buchung in bookingwulf → `pushBooking()` → Beds24 → Airbnb/Booking.com sperren

### Datenbankmodelle

- `Beds24Config` — Credentials (`propKey`, `accountKey`) + `isEnabled`-Kill-Switch pro Hotel
- `Beds24ApartmentMapping` — verknüpft lokale `Apartment.id` mit `beds24RoomId`

### Implementierungsstand

| Komponente | Status |
|---|---|
| DB-Schema + Prisma-Client | ✅ fertig |
| `src/lib/beds24.ts` — `testConnection()` | ✅ implementiert |
| `src/lib/beds24.ts` — `pushBooking()`, `setAvailability()` etc. | 🔲 Stub (wirft `NotImplemented`) |
| `/api/admin/beds24` — Credentials-CRUD + Toggle | ✅ fertig |
| `/api/admin/beds24-mappings` — Room-Mapping-CRUD | ✅ fertig |
| `/api/beds24-webhook` — Inbound, Token-Auth, loggt Payload | ✅ Stub (noch kein BlockedRange-Write) |
| Admin UI `/admin/beds24` | ✅ fertig |
| Outbound Sync-Hook in `/api/request` | ✅ Stub (non-blocking, loggt) |

### Aktivierung

1. `BEDS24_WEBHOOK_SECRET` als Umgebungsvariable in Vercel setzen
2. Webhook-URL in Beds24 eintragen: `https://domain/api/beds24-webhook?token=<SECRET>`
3. `pushBooking()` in `src/lib/beds24.ts` implementieren
4. Stub-Hook in `/api/request/route.ts` entkommentieren

### Sync-Frequenz

Airbnb verarbeitet eingehende Sperrzeiten mit ~1–5 Min. Eigendelay. End-to-End circa 1–2 Minuten (vs. 30 Minuten via iCal). Doppelbuchungsrisiko nahezu null.

---

## 18. Datenschutz & DSGVO

### Datenspeicherung

- **Datenbank:** Neon PostgreSQL, Region AWS Europe Central 1 (Frankfurt, EU)
- **Uploads:** Vercel Blob (global CDN)
- **E-Mails:** Resend Inc. (USA) — SCCs vorhanden
- **Zahlungen:** Stripe Inc. (USA) — EU-US Data Privacy Framework
- **Hosting:** Vercel Inc. (USA) — SCCs vorhanden
- **Fehler-Monitoring:** Sentry Inc. (USA)

### Aufbewahrungsfristen

| Datentyp | Frist | Mechanismus |
|---|---|---|
| Buchungsanfragen | 3 Jahre | Automatisch (Cron, 1. des Monats) |
| Session-Cookies | 24 Stunden | Automatisch (JWT TTL) |
| Passwort-Reset-Tokens | 1 Stunde | Automatisch (Ablaufzeit) |
| Nutzerkonten | Bei Kündigung | Manuell auf Anfrage |

### Löschung

Buchungsanfragen können nur durch den Betreiber (support@bookingwulf.com) gelöscht werden. Hotelbetreiber selbst haben keinen eigenständigen Löschzugriff. Anfragen auf Auskunft oder Löschung werden innerhalb von 30 Tagen bearbeitet.

### Keine Tracking-Cookies

bookingwulf verwendet ausschließlich einen technisch notwendigen Session-Cookie (`admin_session`) — kein Google Analytics, kein Tracking, kein Cookie-Banner notwendig.

### Rechtliche Dokumente

Alle unter `/datenschutz`, `/impressum`, `/agb`, `/avv` erreichbar und im Admin-Footer verlinkt.

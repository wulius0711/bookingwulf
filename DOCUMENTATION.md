# bookingwulf — Interne Dokumentation

> Stand: Mai 2026  
> Stack: Next.js 16 · React 19 · PostgreSQL (Neon/Frankfurt) · Stripe · Resend · Vercel

---

## Inhaltsverzeichnis

> Navigation in Notion: Outline-Sidebar rechts einblenden (oder `/table of contents` Block einfügen).

1. Produktübersicht
2. Architektur
3. Tech-Stack
4. Datenbankschema
5. Authentifizierung & Sessions
6. Pläne & Feature-Gates
7. Buchungsablauf
8. Widget-System
9. E-Mail-System
10. iCal-Sync
11. Stripe-Integration
12. Admin-Bereich
13. API-Routen
14. Umgebungsvariablen
15. Deployment
16. Schlüsselloses Einchecken (Nuki)
17. Beds24 Channel Manager
18. Datenschutz & DSGVO

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
| plan | String | `starter` / `pro` / `business` / `bundle_all` |
| subscriptionStatus | String | `trialing` / `active` / `inactive` / `past_due` |
| trialEndsAt | DateTime? | Ende der 14-Tage-Testphase |
| stripeCustomerId | String? | Stripe-Kunden-ID |
| stripeSubscriptionId | String? | Aktive Stripe-Subscription |
| accentColor | String? | Globale Akzentfarbe (Fallback) |
| bookingTermsUrl | String? | AGB-Link im Widget |
| privacyPolicyUrl | String? | Datenschutz-Link im Widget |
| hungrywulfEnabled | Boolean | hungrywulf-Tischreservierung freigeschaltet (Super-Admin) |
| hungrywulfRestaurantId | String? | CUID des Restaurant-Accounts in hungrywulf |
| hungrywulfSecret | String? | HMAC-Shared-Secret für Magic-Link-Auth (= bookingAppKey in hungrywulf) |

### HotelSettings *(UI-Konfiguration)*

Erweiterte Einstellungen pro Hotel. Enthält:
- **Feature-Toggles:** `showPrices`, `allowMultiSelect`, `showAmenities`, `showExtrasStep`, `showPhoneField`, `showMessageField`, `enableImageSlider`, `instantBooking`, `enableInstantBooking`
- **Farben:** `accentColor`, `backgroundColor`, `cardBackground`, `textColor`, `mutedTextColor`, `borderColor`, `buttonColor`
- **Typografie:** `headlineFont`, `bodyFont`, `headlineFontSize`, `bodyFontSize`, `headlineFontWeight`, `bodyFontWeight`, `headlineFontUrl`, `bodyFontUrl` (eigene Schriften via Vercel Blob, Business)
- **Layout:** `cardRadius`, `buttonRadius`
- **Zahlungsarten (Gast-Zahlungen):** Alle `@default(false)` — standardmäßig keine Zahlungsart aktiv.
  - `bankTransferEnabled Boolean` — Banküberweisung
  - `bankAccountHolder String?`, `bankIban String?`, `bankBic String?` — Kontodaten (in Gast-Mail nach Buchung angezeigt)
  - `depositEnabled Boolean`, `depositType String` (`"percent"` | `"fixed"`), `depositValue Float`, `depositDueDays Int` — optionale Anzahlung (nur bei Banküberweisung)
  - `paypalEnabled Boolean`, `paypalClientId String?`, `paypalClientSecret String?` — PayPal Business App-Credentials (developer.paypal.com)
  - `stripeEnabled Boolean`, `stripePublishableKey String?`, `stripeSecretKey String?` — Hotel-eigener Stripe-Account (dashboard.stripe.com/apikeys)
  - **Sicherheit:** `paypalClientSecret` und `stripeSecretKey` werden in `/api/hotel-settings` (public) vor der Antwort entfernt — nur das Widget erhält Publishable Key.
- **Ortstaxe:** `ortstaxeMode` (String, default `"off"`) — `"off"` | `"wien"` | `"custom"`. Bei `"wien"` werden die datumsbezogenen Wiener Sätze automatisch angewendet (2,5237 % / 4,3478 % / 6,7797 % vom Zimmerpreis je nach Anreisedatum). Bei `"custom"`: `ortstaxePerPersonPerNight` (Decimal?) × Personen × Nächte. `ortstaxeMinAge` (Int?) — Kinder unter diesem Alter sind befreit (nur Custom-Modus).
- **Steuer/Buchhaltung:** `taxRateRoom` (Decimal?) — MwSt.-Satz für Zimmerpreis in % (z.B. 10,00 für AT). `taxRateCleaning` (Decimal?) — MwSt.-Satz für Reinigungsgebühr in % (z.B. 20,00 für AT). Werden im CSV-Buchhaltungsexport für die Netto/Brutto-Aufschlüsselung verwendet.

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
| status | String | `new` / `confirmed` / `booked` / `cancelled` / `pending_paypal` / `pending_stripe` |
| arrival / departure | DateTime | Reisezeitraum |
| nights | Int | Anzahl Nächte |
| adults / children | Int | Gästezahl |
| selectedApartmentIds | String | Kommagetrennte Apartment-IDs |
| email / firstname / lastname | String | Gastdaten |
| salutation / country / message | String? | Optionale Felder |
| newsletter | Boolean | Newsletter-Einwilligung |
| language | String | `de` / `en` / `it` |
| extrasJson | Json | Gebuchte Zusatzleistungen (Zeilenpositionen mit key, name, type, subtotal) |
| pricingJson | Json? | Vollständiger Preis-Snapshot bei Buchungserstellung: `{ apartments: [{name, total, cleaning}], extrasTotal, ortstaxeTotal, total }` |

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

| Plan | Monatlich | Jährlich | Apartments | Nutzer | Hotels | Besonderheit |
|---|---|---|---|---|---|---|
| **Starter** | €59 | €54 | 3 | 1 | 1 | — |
| **Pro** | €119 | €109 | 15 | 3 | 1 | — |
| **Business** | €249 | €229 | unbegrenzt | unbegrenzt | 2 | — |
| **hotelwulf Bundle** | €179 | €164 | unbegrenzt | unbegrenzt | 1 | Nur per Superadmin zuweisbar |

### Plan-Hierarchie (`src/lib/plan-gates.ts`)

```typescript
const PLAN_LEVEL = { starter: 0, pro: 1, business: 2, bundle_all: 3 };
```

`bundle_all` ist kein Upgrade-Pfad für Kunden — er wird ausschließlich vom Superadmin über `/admin/hotels/[id]` → Plan-Sektion zugewiesen. Auf der Billing-Seite (`/admin/billing`) ist `bundle_all` aus dem Plan-Grid ausgeblendet; stattdessen erscheint ein blauer Info-Banner wenn das Hotel auf diesem Plan ist.

### Feature-Gates

Navigations-Sperren (`NAV_PLAN_GATES`):

| Route | Mindestplan |
|---|---|
| `/admin/price-seasons` | Pro |
| `/admin/email-templates` | Pro |
| `/admin/nuki` | Pro |
| `/admin/analytics` | Business |

Weitere Prüfungen per `hasPlanAccess(hotelPlan, minPlan)`:
- Apartment-Limit (`canAddApartment`)
- Nutzer-Limit (`canAddUser`)
- Branding-Features: `hasFullBranding` → Pro, Business, bundle_all; `hasAdvancedTypography` → Business, bundle_all
- Messaging (Gast-Kommunikation) → `FEATURE_PLAN_GATES.messages = 'business'`
- **Pro**: Last-Minute Rabatt, Mindestaufenthalt pro Saison (`/api/pricing`)
- **Business**: Belegungsbasierter Preisaufschlag (`/api/pricing`), eigene Schrift-Uploads (`headlineFontUrl`, `bodyFontUrl` via Vercel Blob — `POST/DELETE /api/admin/font-upload`)
- **bundle_all**: `isBundlePlan(plan)` → gibt true zurück; alle Business-Features + hungrywulf + eventwulf freigeschaltet

In der Navigation werden gesperrte Einträge mit 🔒 und Tooltip angezeigt.

### Superadmin: Plan setzen (`POST /api/admin/set-hotel-plan`)

Ermöglicht dem Superadmin, jeden Plan (inkl. `bundle_all`) direkt ohne Stripe-Checkout oder Trial-Prüfung zuzuweisen. Validierung per Zod: `hotelId` (positive Int), `plan` (muss in `PLANS` vorhanden sein). Erfordert `session.role === 'super_admin'`.

UI: `/admin/hotels/[id]` → Karte „Plan" → `PlanSelector`-Client-Komponente (`app/admin/hotels/[id]/PlanSelector.tsx`). Zeigt aktuellen Plan + Dropdown mit allen Plänen + „Setzen"-Button. Reload nach Erfolg.

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
   - Anfrage (bookingType='request')     → status='new'
   - Sofortbuchung (Banküberweisung)     → status='booked'
   - Sofortbuchung via PayPal            → status='pending_paypal'
   - Sofortbuchung via Stripe            → status='pending_stripe'
6. Bei bookingType='booking' (außer PayPal/Stripe): BlockedRange pro Apartment erstellen
7. Hotel-Benachrichtigung (Deutsch) senden
8. Gast-Bestätigung (Sprache auto-erkannt: de/en/it) senden
9a. Banküberweisung/Anfrage: { success: true, requestId }
9b. PayPal-Buchung: { success: true, paypalOrderId, approveUrl } → Widget leitet weiter
9c. Stripe-Buchung: { success: true, clientSecret, requestId } → Widget bestätigt inline
```

### PayPal-Flow (Gast-Zahlung)

```
Widget → POST /api/request (payment_method='paypal') → { approveUrl }
         ↓ Weiterleitung zu PayPal
PayPal → POST /api/paypal/capture { requestId, orderId }
         → PayPal Order capturen
         → status → 'booked', BlockedRanges anlegen
         → Hotel- + Gast-E-Mail senden
```

### Stripe-Flow (Gast-Zahlung, inline)

```
Widget → POST /api/request (payment_method='stripe') → { clientSecret, requestId }
         ↓ stripe.confirmCardPayment(clientSecret, { payment_method: { card } })
         ↓ POST /api/stripe/confirm { requestId, paymentIntentId }
           → PaymentIntent status='succeeded' prüfen
           → status → 'booked', BlockedRanges anlegen
           → Hotel- + Gast-E-Mail senden
```

**Wichtig:** `/api/stripe/confirm` und `/api/paypal/capture` sind die einzigen Endpunkte, die den Request auf `'booked'` setzen und Dates sperren — `/api/request` macht das bei PayPal/Stripe nicht sofort.

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
  data-config="widget-slug"
  data-lang="de">
</script>
```

`widget.js` erstellt ein `<iframe>` das `/widget.html?hotel=...&config=...&lang=...` lädt.

**`data-lang`** — Sprache der Widget-Oberfläche. Unterstützte Werte: `de` (Standard), `en`. Beeinflusst alle Labels, Monatsnamen, Wochentage, Datumsformate und Validierungsmeldungen im Widget. Standardmäßig `de` wenn nicht gesetzt.

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

**Preistransparenz:** Apartment-Karte zeigt den Gesamtpreis prominent. Klick auf „Preis Details" (`.apt-price-details-btn`) öffnet ein Popover (`.apt-price-popover`) mit vollständiger Aufschlüsselung: Anzahl Nächte + Saison, `X × €Y/Nacht`, Endreinigung, Last-Minute/Nachfrage-Label, Gesamtbetrag fett. Popover schließt sich bei Klick außerhalb. State: `state.openPricePopover` (Apartment-ID oder null). Summary-Sidebar zeigt dieselbe Aufschlüsselung nochmals als Tabelle, inkl. Kinderpreise und Ortstaxe. Alle angezeigten Preise sind Bruttopreise — „inkl. MwSt." wird an der Apartment-Karte, im Preis-Popover, in der Summary-Sidebar und in Bestätigungs-E-Mails angezeigt. Englische Version: „incl. VAT".

**Ortstaxe:** `state.ortstaxeMode`, `state.ortstaxePerPersonPerNight` und `state.ortstaxeMinAge` werden aus `/api/hotel-settings` geladen. Drei Modi: `"off"` (keine Ortstaxe), `"wien"` (automatisch nach WKO-Schlüsselzahlen + Anreisedatum: bis 30.6.2026 → 2,5237 %, ab 1.7.2026 → 4,3478 %, ab 1.7.2027 → 6,7797 % vom Zimmerpreis), `"custom"` (€/Person/Nacht × Personen × Nächte). Berechnung serverseitig via `src/lib/ortstaxe.ts → calculateOrtstaxe()`. Ortstaxe erscheint als eigene Zeile in der Summary-Sidebar, in Preis-E-Mails und Buchungsdetails.

**Floating Labels:** Alle Formularfelder im Widget verwenden das Floating-Label-Pattern (`.field-block` + `.label`): Label startet als Placeholder zentriert im Input, schwebt bei Fokus/Wert nach oben. Selects haben das Label immer in der gefloateten Position (da sie immer sichtbaren Text zeigen). Initialisierung via `initFloatingLabels(root)` mit `_floatInit`-Guard gegen doppelte Listener.

**Smooth Animationen:** Alle Accordions (Gäste Daten, Adresse, Zahlungsoptionen) verwenden `max-height` + `padding`-Transition statt `display:none/block`. „Mehr lesen" expandiert via `max-height`-Animation ohne DOM-Rebuild (`renderApartments()` wird nicht aufgerufen — nur CSS-Klasse direkt toggle). Ausstattung-Chevron ist SVG statt Unicode für pixelgenaue Ausrichtung.

### CSS-Custom-Properties

Das Widget verwendet CSS-Variablen, die von `/api/hotel-settings` befüllt werden:
`--accent`, `--bg`, `--surface-2`, `--text`, `--muted`, `--border`, `--radius`, `--btn-radius`, etc.

### Mini-Widget (`/public/mini-widget.html` + `mini-widget.js`)

Kompakter Datepicker für Landing Pages / Homepages. Zeigt Anreise, Abreise, Gästezahl (+/−) und Verfügbarkeits-Feedback. Beim Klick wird auf das Haupt-Widget weitergeleitet mit vorausgefüllten Daten.

**Einbindung via Script-Tag (empfohlen):**
```html
<!-- Deutsch -->
<script src="https://bookingwulf.com/mini-widget.js" data-hotel="hotel-slug" data-target="https://hotel.at/buchen"></script>
<!-- Englisch -->
<script src="https://bookingwulf.com/mini-widget.js" data-hotel="hotel-slug" data-lang="en" data-target="https://hotel.at/buchen"></script>
```

**Script-Attribute:** `data-hotel` (Pflicht), `data-config`, `data-target` (Ziel-URL; Anker-Links möglich), `data-lang` (`en`).

**mini-widget.html URL-Parameter:** `hotel`, `config`, `target`, `lang`.

**Ablauf:**
1. `mini-widget.js` erstellt einen `<iframe>` für `mini-widget.html`
2. `mini-widget.html` lädt Theme + Feature-Toggles via `GET /api/hotel-settings`
3. Prüft Verfügbarkeit via `GET /api/availability-quick` sobald beide Daten gewählt
4. Klick auf Button → postMessage `bw-mini-navigate` an Parent (`mini-widget.js`)
5. `mini-widget.js` schreibt Buchungsdaten in Hotel-Domain-`localStorage` (`bw_booking`, 10 min TTL) → navigiert via `window.top.location.href`
6. Auf Zielseite liest `widget.js` URL-Params und als Fallback Hotel-`localStorage` → übergibt an `widget.html`-iframe
7. `widget.html` liest `arrival`, `departure`, `adults`, `type` aus URL-Params → Pre-füllt Schritt 1 + Adults-Selector

**Verfügbarkeits-Feedback:** `GET /api/availability-quick?hotel=&arrival=&departure=` → `{ available, availableCount, total }`. Prüft alle aktiven Apartments ohne Apartment-Namen. Kein Auth erforderlich.

**postMessage-Events (mini-widget.html → mini-widget.js):**
- `{ type: 'mini-widget-height', height: N }` — iframe-Resize
- `{ type: 'bw-mini-navigate', href: '...', booking: { arrival, departure, adults, type } }` — Navigation + Datenweitergabe

**Admin-Einstellung:** `miniWidgetTarget` in `HotelSettings` — Ziel-URL, wenn nicht per `data-target` überschrieben. Einstellbar in Admin → Widget & Design → Mini-Widget (aufklappbar).

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

> **Zwei unabhängige Stripe-Kontexte:**
> 1. **bookingwulf-eigener Stripe** (`STRIPE_SECRET_KEY`) — für Abonnements (SaaS-Billing), Webhooks, Checkout-Sessions
> 2. **Hotel-eigener Stripe** (`HotelSettings.stripeSecretKey`) — für direkte Kartenzahlungen der Gäste; Geld geht direkt auf das Stripe-Konto des Hoteliers

### Abonnement-Checkout-Flow (bookingwulf-eigener Stripe)

```
1. Admin klickt "Upgrade"
2. POST /api/stripe/checkout { plan, interval, hotelId }
3. Server: Stripe-Kunden erstellen/abrufen
4. Stripe Checkout Session erstellen
5. Weiterleitung zur Stripe-Checkout-Seite
6. Gast zahlt → Stripe sendet Webhook
7. checkout.session.completed → Hotel aktualisieren, Welcome-E-Mail senden
```

### Abonnement-Webhooks (`POST /api/stripe/webhook`)

| Event | Aktion |
|---|---|
| `checkout.session.completed` | Plan + Subscription speichern, Status → `active` |
| `customer.subscription.updated` | Plan aktualisieren |
| `customer.subscription.deleted` | Plan → Starter, Branding-Einstellungen löschen |
| `invoice.payment_failed` | Status → `past_due` |

Jeder Webhook wird per Stripe-Signatur verifiziert (`STRIPE_WEBHOOK_SECRET`).

### Stripe-Portal

`POST /api/stripe/portal` → Link zum Stripe Customer Portal für Planwechsel, Kündigung, Rechnungen.

### Hotel-eigene Stripe-Zahlung (Gast → Hotel)

Eingerichtet vom Hotelier in `Konfiguration → Widget & Design → Zahlungsarten`. Verwendet `HotelSettings.stripePublishableKey` (im Widget) und `HotelSettings.stripeSecretKey` (serverseitig).

**PaymentIntent-Erstellung** (`src/lib/stripe-server.ts → createPaymentIntent()`):
- `automatic_payment_methods: { enabled: true, allow_redirects: 'never' }` — kein Redirect, Zahlung bleibt inline im Widget
- Gibt `clientSecret` zurück → Widget ruft `stripe.confirmCardPayment()` auf

**Confirm-Endpunkt** (`POST /api/stripe/confirm`):
- Verifiziert `PaymentIntent.status === 'succeeded'`
- Setzt Request-Status auf `'booked'`, legt BlockedRanges an, sendet E-Mails

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
| `/admin/price-seasons` | Pro | Saisonale Preise, Last-Minute Rabatt, Lücken-Rabatt, Verfügbarkeits-Hinweise, Ortstaxe/Kurtaxe, Steuereinstellungen (MwSt.-Sätze für CSV-Export) |
| `/admin/extras` | Pro | Zusatzleistungen & Versicherung |
| `/admin/email-templates` | Pro | E-Mail-Vorlagen anpassen |
| `/admin/users` | Pro | Team-Mitglieder einladen |
| `/admin/widget-configs` | Pro | Mehrere Widget-Konfigurationen |
| `/admin/settings` | Alle | Hotel-Info, Branding, Widget-Optionen |
| `/admin/nuki` | Pro | Nuki-Verbindung einrichten, Schlösser anzeigen |
| `/admin/hungrywulf` | — (Super-Admin-Freischaltung) | Redirect → automatischer Magic-Link-Login in hungrywulf |
| `/admin/analytics` | Business | Buchungsstatistiken |
| `/admin/billing` | Alle | Abonnement, Upgrade, Kündigung |
| `/admin/help` | Alle | Handbuch |

### Super-Admin-Seiten

| Seite | Funktion |
|---|---|
| `/admin/hotels` | Alle Hotels verwalten |
| `/admin/users` | Alle Nutzer verwalten |
| `/admin/feedback` | Eingegangene Feedback-Meldungen löschen |
| `/admin/outreach` | Outreach-CRM — Leads verwalten, E-Mails versenden |
| `/admin/hotels/[id]` → Plan-Sektion | Plan direkt zuweisen (inkl. bundle_all) via `PlanSelector` |
| `/admin/hotels/[id]` → hungrywulf-Sektion | hungrywulf per Hotel aktivieren/deaktivieren (provisioniert automatisch) |
| `/admin/hotels/[id]` → eventwulf-Sektion | eventwulf per Hotel aktivieren/deaktivieren (provisioniert automatisch) |

### Feedback-System

Admins können über den **Megaphone-Button** (oben rechts, fixiert) jederzeit Feedback senden. Ein Modal öffnet sich mit Texteingabe, Screenshot-Upload (Datei oder Strg+V aus Zwischenablage) und Seiten-URL. Daten landen in `AdminFeedback` (Prisma). Super-Admins sehen alle Einträge unter `/admin/feedback` und können sie löschen. API: `POST/DELETE /api/admin/feedback`.

### Eigene Schriften (Business)

Im Admin unter **Widget & Design → Typografie** können Business-Kunden eigene Schriftdateien (woff, woff2, ttf, otf, max. 5 MB) für Headline und Fließtext hochladen. Upload via `POST /api/admin/font-upload` → Vercel Blob (`booking-app-blob`). Die Blob-URL wird in `HotelSettings.headlineFontUrl` / `bodyFontUrl` gespeichert. Das Widget lädt die Schrift via `@font-face` unter dem internen Familiennamen `CustomHeadlineFont` / `CustomBodyFont`. Löschen via `DELETE /api/admin/font-upload` (entfernt Blob + DB-Eintrag). Env-Variable: `BLOB_READ_WRITE_TOKEN`.

Der Super-Admin hat `hotelId = null` in der Session und Zugriff auf alle Hotels.

### Outreach-System (Super-Admin)

**Seite:** `/admin/outreach`

Internes CRM-Tool zur Akquisition von Neukunden. Nur für Super-Admins sichtbar.

**Funktionen:**
- Tabelle aller Leads mit Status-Filter (Neu / Gesendet / Follow-up / Geantwortet / Demo / Kein Interesse / Abgeschlossen)
- E-Mail-Versand einzeln oder als Bulk (alle Leads mit Status „Neu")
- Inline-Bearbeitung von Betrieb, Inhaber, E-Mail
- Lead anlegen / löschen
- Status-Änderung direkt per Dropdown in der Tabelle

**E-Mail-Versand:** Zoho SMTP (`smtp.zoho.eu:465`) via nodemailer. Template in `src/lib/outreach-mailer.ts` — personalisiert mit Inhabername und Betriebsname.

**Datenmodell:** `OutreachLead` (Prisma) — Felder: `betrieb`, `inhaber`, `email`, `region`, `website`, `status`, `sentAt`, `followUpAt`, `notes`, `nextStep`

**Seed-Script:** `scripts/seed-outreach.ts` — initialer Import der 37 Leads aus Bookmark-Recherche.

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
- Gesperrte Nav-Items (Plan-Gates) werden als `<button aria-disabled="true">` gerendert (nicht als `<span>`) für Tastaturzugänglichkeit; Akkordeon-Buttons tragen `aria-expanded`; Hotel-Select ist über `<label htmlFor>` beschriftet

### Pre-Arrival / Online Check-in

**HotelSettings Felder:** `preArrivalEnabled`, `preArrivalHouseRules String?`, `preArrivalReminderDays Int @default(3)`

**Request Felder:** `checkinToken String? @unique`, `checkinCompletedAt DateTime?`, `checkinArrivalTime String?`, `checkinNotes String?`, `checkinReminderSentAt DateTime?`

**Flow:**
1. Betreiber aktiviert Feature in Einstellungen (optional: Hausordnung-Text, Reminder-Tage)
2. Bei Status → `booked`: `crypto.randomUUID()` generiert Token, wird in `Request.checkinToken` gespeichert
3. Bestätigungsmail enthält zusätzlichen „Jetzt einchecken →"-Button mit Link `/checkin/[token]`
4. Gast öffnet `/checkin/[token]` (öffentliche Seite, kein Login): Ankunftszeit wählen, Notizen, Hausordnung akzeptieren → speichert `checkinCompletedAt`, `checkinArrivalTime`, `checkinNotes`
5. Cron `/api/cron/pre-arrival-reminder` läuft täglich 09:00 UTC und prüft, ob heute = Anreisetag − X Tage ist. Jeder Gast erhält genau eine Erinnerungsmail (Guard: `checkinReminderSentAt IS NULL`), danach wird `checkinReminderSentAt` gesetzt
6. Buchungsdetailseite zeigt Check-in Status (✓ Ausgefüllt / ⏳ Ausstehend) mit Ankunftszeit und Notizen

### Gap-Night-Preise

**Plan-Gate: Pro.** Felder in HotelSettings: `gapNightDiscount Int?` (Rabatt in %) und `gapNightMaxLength Int?` (max. Lückenlänge in Nächten). Beide `null` = Feature deaktiviert.

**Erkennung in `/api/availability`:**
- Feature aktiv wenn beide Felder gesetzt und `nights <= gapNightMaxLength`
- Prüft ob eine bestätigte (`status: 'booked'`) Buchung für das Apartment exakt am Anreisetag endet (`departure = arrival`)
- Prüft ob eine bestätigte Buchung exakt am Abreisetag beginnt (`arrival = departure`)
- Wenn beides zutrifft: Rabatt auf Nächtepreis (nicht Endreinigung), `isGapNight: true`, `gapDiscount: N` in Response
- Widget zeigt „-N% Sonderpreis"-Badge und Popover-Zeile „Lücken-Rabatt"

### Urgency-Signale

Feature-Toggle `showUrgencySignals` + `urgencyThreshold Int @default(40)` (HotelSettings). Wenn aktiviert:
- Widget ruft beim Rendern des Kalenders `/api/urgency?hotel=slug&year=Y&month=M` (0-basiert) auf
- Response: `{ freeNights, totalNights, bookedNights }` — zählt bestätigte/ausstehende Buchungen + Sperrzeiten im Monat
- Bei < `urgencyThreshold` % freier Nächte erscheint ein Hinweis-Banner unterhalb des Kalenders (🔥)
- Schwellenwert ≤ 15 %: genaue Nachtanzahl (`„Nur noch X Nächte frei im Monat"`); 15–40 %: generisch (`„Wenige freie Nächte"`)
- Urgency-Daten werden pro Monat gecacht (`state.urgency`) — kein doppelter Fetch beim Monatswechsel

### Barrierefreiheit

- **Admin:** Footer-Links (`#6b7280` statt `#9ca3af`) — WCAG AA (4.8:1 auf Weiß)
- **ContrastChecker:** Bei Fail wird die nächstähnliche barrierefreie Farbe per Binary-Search auf HSL-Lightness berechnet und als klickbarer Vorschlag angezeigt. Klick setzt den Wert direkt ins Formular-Input und feuert `settings-color-changed` CustomEvent.

#### Widget-Barrierefreiheit (`public/widget.html`, `public/mini-widget.html`)

- **Icon-Buttons:** `×` (Lightbox-Schließen), `‹›` (Navigation, Kalender-Monatsnavigation, Bild-Slider) haben alle `aria-label`
- **Kalender-Tageszellen:** `<button role="gridcell">` mit `aria-label` (Datum ausgeschrieben), `aria-selected`, `aria-current="date"` für heute; Tastatur-Navigation via Pfeil-, PgUp/Down-, Home/End-Tasten; Roving-Tabindex
- **Schritt-Indikatoren:** `aria-current="step"` auf dem aktiven Schritt
- **Formularvalidierung:** Fehlermeldungen mit `role="alert"` und `aria-live`; Felder mit `aria-describedby` verknüpft; `aria-invalid` bei Fehler
- **Ladezustand:** `aria-busy="true"` auf dem Apartment-Container während des Ladens
- **Toggle-Buttons:** `aria-expanded` auf "Mehr lesen" (apt-more) und Ausstattungs-Toggle (apt-amenities-toggle); wird bei State-Änderung aktualisiert
- **Fokus-Indikatoren:** `:focus-visible` mit `outline: 2px solid var(--accent)` auf allen Buttons, Links und `[tabindex="0"]`-Elementen; Kalender-Tageszellen ebenfalls
- **iframe:** `title="Buchungsformular"` auf dem `<iframe>`-Element in `IframeWrapper.tsx`
- **Skip Link:** `<a href="#booking-main">` am Anfang von `<body>`; `id="booking-main"` auf `.booking-shell`; visuell versteckt, bei Fokus sichtbar (position absolute, top: 0 on `:focus`)
- **View-/Layout-Toggle:** `aria-label` auf alle vier Toggle-Buttons (`viewTop`, `viewSidebar`, `layoutList`, `layoutMasonry`) — ergänzt das bestehende `title`-Attribut
- **Mini-Widget Labels:** `<span class="field-label">` → `<label for="miniArrival/miniDeparture" class="field-label">` — CSS Adjacent-Sibling-Selektor (`input + .field-label`) bleibt funktional
- **Mini-Widget Fehlerbox:** `role="alert" aria-live="assertive"` auf `#miniError`
- **Lightbox-Hinweis:** Die Lightbox (`role="dialog" aria-modal="true"`) ist aktuell deaktiviert (`openLightbox()` ist ein No-op) — Bilder werden ausschließlich über den Inline-Slider angezeigt

#### Modal / Dialog-Zugänglichkeit

**Hook:** `app/admin/hooks/useFocusTrap.ts`

```ts
useFocusTrap(enabled: boolean, onClose: () => void): RefObject<HTMLDivElement>
```

- Solange `enabled = true`: fängt Tab/Shift+Tab innerhalb des Dialog-Containers ab, Escape ruft `onClose()` auf
- Beim Aktivieren: Fokus springt zum ersten focusbaren Element im Dialog
- Beim Deaktivieren (Schließen): Fokus kehrt zum auslösenden Element zurück (`document.activeElement` beim Aktivieren)

**Implementiert in:**

| Komponente | Modals | ARIA-Attribute |
|---|---|---|
| `CalendarGrid.tsx` | Erstellen (`selLo/selHi`) + Bearbeiten (`selectedItem`) | `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, Backdrop `aria-hidden="true"`, `×`-Buttons `aria-label="Schließen"`, Fehler `role="alert"`, Erfolg `role="status"`, alle Formularfelder mit `id`+`htmlFor` |
| `GanttView.tsx` | Drag-Erstellen (`selection`) + Balken-Detail (`selectedItem`) + `ApartmentCalendar` | wie oben; Gantt-Apt-Labels und Blocked-Bars: `role="button"`, `tabIndex={0}`, `onKeyDown` (Enter/Space) |
| `AdminChatWidget.tsx` | Chat-Panel | `role="dialog"`, `aria-label`, `aria-modal="false"` (nicht-blockierend); Trigger-Button: `aria-expanded`, `aria-controls`; Escape schließt; Input bekommt Fokus beim Öffnen |

**Skip Link (Admin):** `.skip-link` in `app/globals.css`, eingebaut in `app/admin/layout.tsx` (`<a href="#admin-content">`); `<main id="admin-content">`. Visuell versteckt (`top: -100%`), erscheint bei Fokus.

**Formular-Labels (Register):** `app/register/RegisterForm.tsx` — alle vier Felder (`reg-hotel-name`, `reg-email`, `reg-password`, `reg-confirm`) mit `id`+`htmlFor`.

**Gesperrte Nav-Items (Sidebar):** `<button aria-disabled="true">` — bewusste Entscheidung: Button bleibt focusbar, Shake-Animation und Tooltip bleiben funktionsfähig. Das ist valides ARIA-Pattern für Buttons mit Seiteneffekten trotz "Disabled"-Zustand.

### Kalender — Drag-to-Create

Klick-Drag über Tageszellen markiert einen Zeitraum (lila Highlight). Nach dem Loslassen öffnet sich ein modales Inline-Formular (Lightbox mit Backdrop) zum direkten Anlegen von Sperrzeiten, Preiszeiträumen oder manuellen Buchungen — ohne Seitennavigation. Datumfelder sind im Formular editierbar. Nach dem Speichern wird die Seite per `router.refresh()` aktualisiert.

Sperrzeiten werden im Kalender als roter Chip `🚫` angezeigt (neben den Buchungs-Chips). iCal-synchronisierte Sperrzeiten (`type: 'ical_sync'`) zeigen zusätzlich einen farbigen Platform-Badge (Airbnb rot, Booking.com blau) — erkannt durch `[Platform] Titel`-Format im `note`-Feld. Klick auf solche Chips öffnet ein read-only Detail-Panel.

Neue Seite: `/admin/requests/new` — manuelles Buchungsformular (auch direkt aufrufbar).

### Zimmerplan — Belegungsplan & Tagesansicht

`/admin/zimmerplan` hat zwei Ansichten, umschaltbar per Toggle (oben rechts):

**Belegungsplan (Standard):** Monats-Gantt-Diagramm. Jedes Apartment ist eine Zeile, jeder Tag eine Spalte (36 px). Buchungen erscheinen als grüne Balken (klickbar → Anfrage), Sperrzeiten als plattformfarbige Balken (Airbnb rot, Booking.com blau, sonstige amber). iCal-Blöcke zeigen Platform-Badge + read-only Detail beim Klick; manuelle Sperrzeiten sind editier- und löschbar.

**Drag-to-Create im Gantt:** Klick-Drag horizontal innerhalb einer Apartment-Zeile markiert einen Zeitraum (lila Highlight). Nach dem Loslassen öffnet sich ein dunkles Popup mit Apartment-Name und Datumsbereich — Tabs: Sperrzeit, Preiszeitraum (Pro), Buchung. Nach dem Speichern wird der Gantt automatisch neu geladen (lokaler State, kein `router.refresh()`).

API-Endpunkt: `GET /api/admin/belegungsplan?from=YYYY-MM-DD&to=YYYY-MM-DD` — liefert `{ apartments: [{ id, name, bookings, blocks }] }`. Implementierung: `app/admin/zimmerplan/GanttView.tsx` (Client Component), `app/api/admin/belegungsplan/route.ts`.

**Tagesansicht:** Karten-Grid mit Farbstatus (Grün/Rot/Gelb) für einen bestimmten Tag. Zeigt Gastname, verbleibende Tage, Check-out-Badge, Platform-Badges für iCal-Sperrzeiten.

### Geführte Tour

`GuidedTour`-Komponente (`app/admin/components/GuidedTour.tsx`) — schrittweise Einführung für neue Nutzer mit `data-tour`-Attributen an Nav-Elementen. Da Items immer im DOM sind (auch bei zugeklappter Gruppe), funktioniert die Tour unabhängig vom Akkordeon-Zustand.

### KI-Assistent (Pro+)

**Komponente:** `app/admin/components/AdminChatWidget.tsx` — Client-Komponente, im Admin-Layout eingebunden.  
**API-Route:** `app/api/admin/help-chat/route.ts`  
**KI-Service:** Google Gemini 2.5 Flash via `@google/genai` SDK (`src/lib/gemini.ts`)

**Funktionsweise:**
- Floating Chat-Button (unten rechts), Farbe folgt dem Admin-Theme (`var(--accent)`)
- Nutzer stellt Frage → API sendet System-Prompt + aktuelle Seite + Frage an Gemini
- Antwort wird im Chat angezeigt, Verlauf in `localStorage` gespeichert (`bw_chat_messages`)
- Verlauf bleibt über Seitenwechsel hinweg erhalten; manuell löschbar via Papierkorb-Icon

**Plan-Gate:** Nur für Pro- und Business-Nutzer sichtbar (geprüft in `admin/layout.tsx`). API-Route (`/api/admin/help-chat`) prüft zusätzlich `subscriptionStatus === 'active' | 'trialing'`. Super-Admin immer erlaubt.

**System-Prompt (`BOOKINGWULF_SYSTEM_PROMPT`):**
- Vollständige Navigationsstruktur mit allen Admin-Bereichen und deren Inhalten
- Antwortet auf Deutsch, immer „du", kein Markdown
- Page-Context wird nur bei unklaren Fragen verwendet; explizite Themen werden direkt beantwortet

**Logging:** Jede Frage + Antwort wird in `SupportChatLog` (Prisma) gespeichert mit `hotelId`, `category` (klassifiziert via `classifyQuestion()`), `isSuperAdmin`.

**Chat-Analytics:** `/admin/chat-analytics` — Super-Admin-only Dashboard mit Fragen, Kategorien und Toggle für Test-Einträge (Super-Admin-Anfragen).

**Umgebungsvariable:** `GEMINI_API_KEY` (Pflicht für KI-Assistent)

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
| `/api/paypal/capture` | POST | PayPal-Zahlung des Gastes abschließen (Order capturen → Request auf `booked` setzen) |
| `/api/stripe/confirm` | POST | Stripe-Kartenzahlung des Gastes bestätigen (PaymentIntent prüfen → Request auf `booked` setzen) |

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
| `/api/admin/set-hotel-plan` | POST | Plan direkt setzen — inkl. `bundle_all` (nur Super-Admin, kein Stripe/Trial-Check) |
| `/api/admin/settings-presets` | GET/POST/DELETE | Branding-Presets |
| `/api/admin/email-preview` | GET | E-Mail-Vorschau |
| `/api/admin/billing-info` | GET | Abo-Status abrufen |
| `/api/admin/export` | GET | Buchhaltungsexport als CSV (Parameter: `from`, `to` YYYY-MM-DD, optional `cancelled=1`) |
| `/api/stripe/checkout` | POST | Stripe Checkout Session erstellen |
| `/api/stripe/portal` | POST | Stripe Billing Portal Link |
| `/api/stripe/webhook` | POST | Stripe-Webhooks (Signatur-Verifizierung) |
| `/api/cleanup-requests` | GET | Anfragen > 3 Jahre löschen (Cron, Bearer-Token) |
| `/api/admin/nuki` | GET/POST/DELETE | Nuki-Konfiguration verwalten |
| `/api/admin/outreach` | GET/POST | Outreach-Leads auflisten / anlegen (Super-Admin) |
| `/api/admin/outreach/[id]` | PATCH/DELETE | Lead bearbeiten / löschen (Super-Admin) |
| `/api/admin/outreach/[id]/send` | POST | Outreach-E-Mail via Zoho SMTP senden (Super-Admin) |
| `/api/admin/help-chat` | POST | KI-Assistent Frage stellen (Pro+) |
| `/api/admin/hotel-color` | GET | Accent-Farbe des Hotels abrufen |
| `/api/admin/hungrywulf` | POST / DELETE | hungrywulf für Hotel aktivieren (inkl. Provisionierung) / deaktivieren (Super-Admin) |
| `/api/admin/hungrywulf-link` | GET | Signierten Magic-Link für hungrywulf-Login generieren (60 s TTL) |

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
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob Token (Store: `booking-app-blob`, FRA1) — für eigene Schrift-Uploads |
| `SENTRY_DSN` | Sentry-Fehlerverfolgung |
| `VERCEL_URL` | Automatisch von Vercel gesetzt |
| `ZOHO_SMTP_USER` | Zoho-Absenderadresse für Outreach-Mails (z.B. `support@bookingwulf.com`) |
| `ZOHO_SMTP_PASS` | Zoho App-Passwort (Zoho → Einstellungen → Sicherheit → App-Passwörter) |
| `HUNGRYWULF_URL` | Basis-URL der hungrywulf-App (z.B. `https://hungrywulf.com`) |
| `HUNGRYWULF_PROVISIONING_SECRET` | Gemeinsames Secret für automatische Account-Erstellung in hungrywulf |

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

## 17. Beds24 Channel Manager (Pro)

### Übersicht

Beds24 ist ein zertifizierter Channel Manager mit direkter API-Anbindung an Airbnb und Booking.com. bookingwulf dockt an Beds24 an, statt selbst Plattform-Zertifizierungen zu durchlaufen. Beds24 kostet ~€9/Monat pro Property beim Hotelier.

### Architektur

```
Airbnb ←→ Beds24 ←→ bookingwulf ←→ DB
Booking.com ←→ Beds24 ↗
```

- **Inbound (Echtzeit):** Beds24 → Webhook → `/api/beds24-webhook` → `BlockedRange` anlegen
- **Outbound (sofort):** Buchung in bookingwulf → `pushBooking()` → Beds24 → Airbnb/Booking.com sperren

### Authentifizierung (Beds24 API v2)

Beds24 API v2 verwendet ein Invite-Code-basiertes Token-Flow:

1. **Setup (einmalig):** `GET /authentication/setup` mit Header `code: <invite_code>` → liefert `refreshToken` + `token`
2. **Token-Refresh:** `GET /authentication/token` mit Header `token: <refresh_token>` → liefert neuen `token`
3. Alle API-Calls nutzen den kurzlebigen `token` als Header

Invite Codes werden in Beds24 unter Einstellungen → Marketplace → API → Einladungscode erstellen generiert. Sie sind **Einmalcodes** — nach Verwendung ungültig.

### Datenbankmodelle

- `Beds24Config` — `refreshToken` (v2 API) + `isEnabled`-Kill-Switch pro Hotel
- `Beds24ApartmentMapping` — verknüpft lokale `Apartment.id` mit `beds24RoomId`

### Implementierungsstand

| Komponente | Status |
|---|---|
| DB-Schema + Prisma-Client | ✅ fertig |
| `src/lib/beds24.ts` — `setupWithInviteCode()` | ✅ implementiert |
| `src/lib/beds24.ts` — `pushBooking()` | ✅ implementiert |
| `/api/admin/beds24` — Invite-Code-Setup, Toggle, Delete | ✅ fertig |
| `/api/admin/beds24-mappings` — Room-Mapping-CRUD | ✅ fertig |
| `/api/beds24-webhook` — Inbound, Token-Auth, BlockedRange-Write | ✅ fertig |
| Admin UI `/admin/beds24` | ✅ fertig |
| Outbound Sync in `/api/request` | ✅ fertig (non-blocking) |

### Aktivierung (Ersteinrichtung)

1. Beds24-Account anlegen unter beds24.com
2. In Beds24: Airbnb/Booking.com unter Channel Manager verbinden
3. `BEDS24_WEBHOOK_SECRET` als Umgebungsvariable in Vercel setzen
4. In bookingwulf Admin → Beds24: Invite Code eingeben → Verbinden
5. Zimmer-IDs pro Apartment zuordnen, Sync aktiv einschalten
6. Webhook-URL in Beds24 unter Unterkünfte → Zugang eintragen: `https://domain/api/beds24-webhook?token=<SECRET>`, Webhook Version 2

### Sync-Frequenz

Airbnb verarbeitet eingehende Sperrzeiten mit ~1–5 Min. Eigendelay. End-to-End circa 1–2 Minuten (vs. 30 Minuten via iCal). Doppelbuchungsrisiko nahezu null.

---

## 19. hungrywulf-Integration (Tischreservierungen)

hungrywulf ist eine separate Next.js-App für Tischreservierungen in Restaurants. bookingwulf-Kunden können hungrywulf über den Superadmin freigeschaltet bekommen und werden dann per Magic-Link automatisch eingeloggt.

### Aktivierung (Superadmin)

1. `/admin/hotels/[id]` → Abschnitt „hungrywulf" → Button „Aktivieren"
2. bookingwulf ruft `POST HUNGRYWULF_URL/api/provision` auf (Bearer: `HUNGRYWULF_PROVISIONING_SECRET`)
3. hungrywulf erstellt Restaurant-Account (idempotent: bestehendes wird zurückgegeben) und liefert `{ restaurantId, bookingAppKey }`
4. bookingwulf speichert `hungrywulfRestaurantId` + `hungrywulfSecret` (= bookingAppKey) am Hotel
5. Feld `hungrywulfEnabled = true` → Nav-Eintrag „Tischreservierungen" erscheint im Kunden-Admin

### Magic-Link-Login

Der Kunde klickt im bookingwulf-Admin auf „Tischreservierungen" → `/admin/hungrywulf`:

1. Server generiert `ts = Date.now()`
2. `sig = HMAC-SHA256(hungrywulfSecret, "autologin:<restaurantId>:<ts>")` (hex)
3. Redirect zu `HUNGRYWULF_URL/api/autologin?rid=<id>&ts=<ts>&sig=<sig>`
4. hungrywulf prüft: Restaurant existiert, HMAC korrekt, Token ≤ 60 s alt → setzt JWT-Session-Cookie, Redirect zu `/admin`

Timing-Safe-Vergleich via `crypto.timingSafeEqual`. Token-TTL: 60 Sekunden.

### Deaktivierung

Super-Admin → Button „Deaktivieren" → `DELETE /api/admin/hungrywulf` → `hungrywulfEnabled = false`. Restaurant-Account in hungrywulf bleibt erhalten (Daten gehen nicht verloren).

### Datenbankfelder (Hotel)

| Feld | Typ | Beschreibung |
|---|---|---|
| `hungrywulfEnabled` | Boolean | Feature sichtbar für Kunden |
| `hungrywulfRestaurantId` | String? | CUID des Restaurant-Datensatzes in hungrywulf |
| `hungrywulfSecret` | String? | Shared-Secret für HMAC (= `bookingAppKey` in hungrywulf) |

### Umgebungsvariablen

| Variable | Wo | Beschreibung |
|---|---|---|
| `HUNGRYWULF_URL` | bookingwulf | Basis-URL der hungrywulf-App |
| `HUNGRYWULF_PROVISIONING_SECRET` | bookingwulf | Bearer-Token für Provision-Endpoint |
| `PROVISIONING_SECRET` | hungrywulf | Muss mit bookingwulf-Seite übereinstimmen |

### API-Routen

| Route | App | Beschreibung |
|---|---|---|
| `POST /api/admin/hungrywulf` | bookingwulf | Aktivieren + Provisionieren (Super-Admin) |
| `DELETE /api/admin/hungrywulf` | bookingwulf | Deaktivieren (Super-Admin) |
| `GET /api/admin/hungrywulf-link` | bookingwulf | Magic-Link generieren |
| `POST /api/provision` | hungrywulf | Restaurant-Account anlegen (Bearer-Auth) |
| `GET /api/autologin` | hungrywulf | Magic-Link prüfen + Session setzen |

---

## 20. eventwulf-Integration (Eventbuchungen)

eventwulf ist eine separate Next.js-App für Retreat- und Event-Anfragen (z. B. Yoga-Retreats, Seminare). bookingwulf-Kunden können eventwulf über den Superadmin freischalten und werden dann per Magic-Link automatisch eingeloggt.

### Aktivierung (Superadmin)

1. `/admin/hotels/[id]` → Abschnitt „eventwulf" → Button „Aktivieren"
2. bookingwulf ruft `POST EVENTWULF_URL/api/provision` auf (Bearer: `EVENTWULF_PROVISIONING_SECRET`)
3. eventwulf erstellt Organisation-Account (idempotent: bestehender wird zurückgegeben; falls `bookingAppKey` fehlt, wird er nachgeneriert) und liefert `{ orgId, bookingAppKey }`
4. bookingwulf speichert `eventwulfOrgId` + `eventwulfSecret` (= bookingAppKey) am Hotel; `eventwulfEnabled = true`
5. Nav-Eintrag „Eventbuchungen" erscheint im Kunden-Admin

**Provisioning-E-Mail:** Immer `hotel-{id}@bookingwulf.com` — nie die echte Hotel-E-Mail, um Kollisionen mit eventwulf-Superadmin zu vermeiden.

### Magic-Link-Login

Kunde klickt „Eventbuchungen öffnen" → `/admin/eventwulf`:

1. Server generiert `ts = Date.now()`
2. `sig = HMAC-SHA256(eventwulfSecret, "autologin:<orgId>:<ts>")` (hex)
3. Redirect zu `EVENTWULF_URL/api/autologin?orgId=<id>&ts=<ts>&sig=<sig>`
4. eventwulf prüft: Org existiert, HMAC korrekt, Token ≤ 60 s alt → setzt JWT-Session-Cookie (`yoga_admin_token`), Redirect zu `/admin`

Timing-Safe-Vergleich via `crypto.timingSafeEqual`. Token-TTL: 60 Sekunden.

### Zurück zu bookingwulf

eventwulf-Admin zeigt oben links den Link „← bookingwulf", wenn `org.bookingAppUrl` gesetzt ist. Superadmin sieht den Link nicht (wird über `clientSlug === SUPERADMIN_SLUG` erkannt).

### Deaktivierung

Super-Admin → Button „Deaktivieren" → `DELETE /api/admin/eventwulf` → `eventwulfEnabled = false`. Org-Account in eventwulf bleibt erhalten.

### Datenbankfelder (Hotel)

| Feld | Typ | Beschreibung |
|---|---|---|
| `eventwulfEnabled` | Boolean | Feature sichtbar für Kunden |
| `eventwulfOrgId` | String? | ID der Organization in eventwulf |
| `eventwulfSecret` | String? | Shared-Secret für HMAC (= `bookingAppKey` in eventwulf) |

### Umgebungsvariablen

| Variable | Wo | Beschreibung |
|---|---|---|
| `EVENTWULF_URL` | bookingwulf | Basis-URL der eventwulf-App |
| `EVENTWULF_PROVISIONING_SECRET` | bookingwulf | Bearer-Token für Provision-Endpoint |
| `PROVISIONING_SECRET` | eventwulf | Muss mit bookingwulf-Seite übereinstimmen |

### API-Routen

| Route | App | Beschreibung |
|---|---|---|
| `POST /api/admin/eventwulf` | bookingwulf | Aktivieren + Provisionieren (Super-Admin) |
| `DELETE /api/admin/eventwulf` | bookingwulf | Deaktivieren (Super-Admin) |
| `GET /api/admin/eventwulf-link` | bookingwulf | Magic-Link generieren |
| `GET /admin/eventwulf` | bookingwulf | Server-Redirect zum Magic-Link |
| `POST /api/provision` | eventwulf | Org-Account anlegen (Bearer-Auth) |
| `GET /api/autologin` | eventwulf | Magic-Link prüfen + Session setzen |

---

## 18. Datenschutz & DSGVO

### Datenspeicherung

- **Datenbank:** Neon PostgreSQL, Region AWS Europe Central 1 (Frankfurt, EU)
- **Uploads:** Vercel Blob (global CDN)
- **E-Mails (transaktional):** Resend Inc. (USA) — SCCs vorhanden
- **E-Mails (Outreach):** Zoho Corporation — Versand über `smtp.zoho.eu`
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

### Outreach-Daten (Interessenten)

Kontaktdaten potenzieller Kunden (Name, E-Mail, Betrieb) werden intern in der `OutreachLead`-Tabelle gespeichert. Rechtsgrundlage: berechtigtes Interesse (Art. 6 Abs. 1 lit. f DSGVO). Quellen: öffentlich zugängliche Unternehmenswebsites. Löschung auf Anfrage über support@bookingwulf.com. Datenschutzerklärung (Abschnitt 4.3) informiert darüber.

### Keine Tracking-Cookies

bookingwulf verwendet ausschließlich einen technisch notwendigen Session-Cookie (`admin_session`) — kein Google Analytics, kein Tracking, kein Cookie-Banner notwendig.

### Rechtliche Dokumente

Alle unter `/datenschutz`, `/impressum`, `/agb`, `/avv` erreichbar und im Admin-Footer verlinkt.

---

## 21. Security

### HTTP Security Headers

Konfiguriert in `next.config.ts` und auf alle Next.js-Routen angewendet:

| Header | Wert |
|--------|------|
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` |
| `X-Frame-Options` | `SAMEORIGIN` |
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` |

Hinweis: Static Files aus `/public` (Widget-HTMLs) werden von diesen Headers nicht erfasst — sie sind als Cross-Origin-Embeds konzipiert.

### Authentifizierung

- JWT-Sessions mit `jose` (HS256), signiert mit `ADMIN_SESSION_SECRET`
- Cookie-Flags: `httpOnly`, `secure` (Produktion), `sameSite: lax`
- Session-TTL: 24 Stunden
- `verifySession()` auf allen Admin-Routen und Admin-API-Endpunkten

### Passwörter

- Hashing via Node.js `crypto.scrypt` mit 16-Byte-Random-Salt
- Vergleich via `timingSafeEqual` (kein Timing-Angriff möglich)

### Rate Limiting

In-Memory-Rate-Limiter (`src/lib/rate-limit.ts`), angewendet auf:

| Route | Limit |
|-------|-------|
| `POST /api/request` | 10 req/15 Min. per IP + 3 req/5 Min. per E-Mail |
| `GET /api/availability-quick` | 60 req/Min. per IP |
| `GET /api/availability-widget` | 30 req/Min. per IP |
| `GET /api/hotel-settings` | 60 req/Min. per IP |
| `GET /api/pricing` | 120 req/Min. per IP |

### Eingabe-Validierung

Zod-Schemas auf allen schreibenden Endpunkten (`/api/request`, `/api/checkout`, `/api/admin/*`). Feldlängen begrenzt (z.B. Name max. 100 Zeichen, Nachricht max. 3.000 Zeichen).

### Datenbankzugriff

Prisma ORM mit parametrisierten Queries durchgehend — kein SQL-Injection-Risiko. Einzige Raw-Query: Health-Check via Template-Literal (sicher).

### Stripe Webhook

Signatur-Verifikation via `stripe.webhooks.constructEvent()` — unsignierte Requests werden mit 400 abgewiesen.

### Beds24 Webhook

Token-Vergleich via `crypto.timingSafeEqual` (Timing-Angriffe ausgeschlossen).

### CORS

Widget-APIs (`/api/hotel-settings`, `/api/availability-quick`, `/api/availability-widget`, `/api/request`, `/api/pricing`) erlauben `Access-Control-Allow-Origin: *` — notwendig für Cross-Origin-Einbettung. Alle Schreibzugriffe erfordern zusätzlich eine gültige Admin-Session.

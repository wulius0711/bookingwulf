# bookingwulf — Technisches Audit

**Stack:** Next.js App Router, Prisma, Resend, Stripe, Upstash Redis (Rate-Limiting), Custom JWT Sessions

---

## Phasen-Übersicht

| Phase | Bereich | Status | Datum |
|-------|---------|--------|-------|
| 1 | Registration & Onboarding | ✅ Abgeschlossen | 2026-05-19 |
| 2 | Buchungs-Flow (Anfrage → Buchung → Bestätigung) | 🔲 Ausstehend | — |
| 3 | Payment-Flow (Stripe, PayPal, Anzahlung, Refund) | 🔲 Ausstehend | — |
| 4 | Gäste-Portal & Online Check-in | 🔲 Ausstehend | — |
| 5 | Benachrichtigungen & Cron-Jobs | 🔲 Ausstehend | — |

---

## Phase 1 — Registration & Onboarding

**Datum:** 2026-05-19

---

## 1. Registrierungsformular

**Vorhandene Felder:**
- `hotelName` ✅
- `email` (type="email") ✅
- `password` + `confirm` ✅
- AGB-Checkbox ✅
- Verstecktes `slug`-Feld (client-seitig aus Hotelname generiert) ⚠️
- Verstecktes `plan`-Feld (hardcoded `"starter"`) ✅

**Fehlende Felder (laut Audit-Scope):**
- ❌ Kein **Unterkunftstyp**-Feld (Hotel/Pension/Apartment) — weder im Formular noch im Schema
- ❌ Kein **Name**-Feld für den Admin-User (kein Vor-/Nachname wird gespeichert)

**Passwort-Validierung:**
- ⚠️ Server-seitig: nur `password.length < 8` — keine Komplexitätsanforderung (Großbuchstabe, Zahl, Sonderzeichen)
- ✅ Passwort-Bestätigung wird server-seitig geprüft
- ❌ Kein Maximal-Längen-Check — ein 10-MB-Passwort würde akzeptiert und an `scryptAsync` übergeben, was CPU-intensiv ist. DoS-Vektor auf dem `/register`-Endpunkt.

**E-Mail-Eindeutigkeit:**
- ✅ Geprüft via `prisma.adminUser.findUnique({ where: { email } })` vor dem Create
- ⚠️ Siehe §2 für Race Condition

**Slug:**
- Client-seitig durch `generateSlug()` generiert, als verstecktes `<input name="slug">`-Feld übermittelt
- Server-seitige Bereinigung minimal: nur `.toLowerCase().replace(/\s+/g, '-')`
- ❌ Keine Slug-Format-Validierung (nur alphanumerisch + Bindestriche erlaubt). Ein manipuliertes Feld könnte `slug=../admin` oder `slug=%00test` liefern.

**Fehleranzeige:** ✅ `state.error` wird korrekt oberhalb des Formulars gerendert. Nur eine globale Fehlermeldung; keine Inline-Fehler pro Feld.

**Honeypot:** ✅ `<input name="website">` ignoriert Bots lautlos.

**Rate-Limiting bei Registrierung:** ❌ Nicht vorhanden. Login hat Upstash-Rate-Limiting (5 Req/15 Min). Die Registrierungs-Server-Action hat kein Rate-Limit — automatisierte Skripte können tausende Accounts in Sekunden anlegen.

---

## 2. Account-Erstellung (Datenbank)

**Transaktionssicherheit:**
- ✅ `prisma.hotel.create({ data: { adminUsers: { create: {...} } } })` — Prismas Nested Write ist intern atomar. Wenn der User-Create fehlschlägt, wird das Hotel zurückgerollt. Keine verwaisten Datensätze bei Halbfehlern.

**Race Condition (nicht transaktional):**
```typescript
// Zwei separate DB-Roundtrips, keine serializable Transaction:
const emailConflict = await prisma.adminUser.findUnique({ where: { email } });
if (emailConflict) return { error: '...' };
// ← hier kann eine zweite Anfrage mit gleicher E-Mail durchschlüpfen ←
await prisma.hotel.create({ data: { adminUsers: { create: {...} } } });
```
- ⚠️ Bei gleichzeitigen Anfragen mit derselben E-Mail bestehen beide den Eindeutigkeits-Check; der zweite `create` wirft einen unbehandelten Prisma P2002-Fehler (unique constraint). Next.js zeigt eine Error-Boundary statt der benutzerfreundlichen Fehlermeldung.
- 💡 `prisma.$transaction()` mit serialisierbarer Isolation verwenden oder den P2002-Code abfangen und `{ error: '...' }` zurückgeben.

**User-Datensatz-Felder:**
- `email` ✅, `passwordHash` (scrypt) ✅, `role: 'hotel_admin'` ✅
- `isActive: true` ✅, `isEmailVerified: false` ✅
- `emailVerifyToken` (32 zufällige Bytes als Hex) ✅
- `emailVerifyTokenExpiresAt` (jetzt + 24h) ✅

**Hotel-Datensatz-Felder:**
- `plan: 'starter'`, `subscriptionStatus: 'trialing'` ✅
- `trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)` — UTC-basiert, Anzeige mit `toLocaleDateString('de-AT')` → ✅ Timezone-Handling akzeptabel

**`AdminUserHotel`-Join-Tabelle wird NICHT befüllt:**
- Das Schema hat zwei parallele Strukturen: Legacy-FK `AdminUser.hotelId` und die `AdminUserHotel`-Join-Tabelle.
- Registrierung setzt `AdminUser.hotelId` korrekt ✅
- ❌ Kein `AdminUserHotel`-Eintrag wird erstellt. Der Hotel-Switcher in der Sidebar (`admin/layout.tsx`) liest **nur** aus `AdminUserHotel`, nie aus dem Legacy-FK:
  ```typescript
  await prisma.adminUserHotel.findMany({ where: { userId: session.userId }, ... })
  ```
- Ergebnis: Neu registrierte Hotels zeigen **null Hotels im Hotel-Switcher**, obwohl Session und Datenzugriff korrekt funktionieren (via `user.hotelId`-Fallback).

**`HotelSettings` wird bei Registrierung nicht erstellt:**
- ❌ Kein `HotelSettings`-Datensatz wird angelegt. Beim ersten Aufruf von Widget & Design-Einstellungen gibt es entweder Defaults oder Fehler, je nachdem ob die Einstellungsseite auto-erstellt.
- 💡 Einen Standard-`HotelSettings`-Datensatz im selben Nested Write erstellen.

**Verstecktes `plan`-Feld manipulierbar:**
- Das Formular hardcoded `<input type="hidden" name="plan" value="starter">`.
- Server validiert: `if (!(plan in PLANS)) return { error: '...' }`
- ⚠️ `"business"` und `"bundle_all"` sind valide `PLANS`-Keys. Wer das Hidden-Field vor dem Submit ändert, registriert sich mit `plan: 'business'` und bekommt Business-Tier-Features für die gesamte 14-tägige Trial ohne Zahlung.

---

## 3. E-Mail-Flow

**Bestätigungs-E-Mail bei Registrierung:** ✅ (E-Mail-Verifikationsmodell, keine klassische Welcome-E-Mail)

**E-Mail-Template:** Inline-HTML, keine externe Template-Datei. Variable `${verifyUrl}` wird immer vor dem Send berechnet. ✅ Kein Missing-Variable-Risiko.

**Resend-Fehlerbehandlung:**
```typescript
try {
  const resend = getResend();
  if (resend) { await resend.emails.send({...}); }
} catch (e) {
  console.error('Verification mail error:', e);
}
redirect('/register/check-email');
```
- ❌ **Stille Fehlerbehandlung** — wenn Resend wirft (Netzwerkfehler, Rate Limit, falscher API-Key), wird der Fehler verschluckt. Das User-Konto ist vollständig in der DB erstellt, aber die Bestätigungs-E-Mail wurde nie versandt.
- Der User wird zu `/register/check-email` weitergeleitet und soll "seinen Posteingang prüfen" — es gibt aber nichts dort. Er ist **dauerhaft ausgesperrt**, ohne Möglichkeit zur Selbsthilfe. E-Mail und Slug sind für immer belegt.
- 💡 Fehler erkennen und `{ error: 'E-Mail konnte nicht gesendet werden...' }` zurückgeben, Account löschen oder "Bestätigungs-E-Mail erneut senden"-Endpunkt implementieren.

**`RESEND_API_KEY` fehlt:** `getResend()` gibt `null` zurück, der `if (resend)`-Block wird übersprungen. Gleicher stiller Fehler wie oben. ✅ App crasht nicht, ❌ User bleibt lautlos hängen.

**Klassische Welcome-E-Mail mit Trial-Enddatum, Login-Link etc.:**
- ❌ Existiert nicht. Die Bestätigungs-E-Mail enthält nur den Verify-Link. Nach Verifizierung sieht der User den Onboarding-Wizard — keine E-Mail mit Zusammenfassung der Trial-Periode.

**Abonnement-Bestätigungs-E-Mail:** ✅ Wird vom Stripe-Webhook `checkout.session.completed` gesendet wenn `subscription.status === 'active'`. Enthält Plan-Name, Preis, Feature-Liste.

**E-Mail bei Zahlungsfehlschlag:** ❌ Der `invoice.payment_failed`-Webhook setzt `subscriptionStatus: 'past_due'` in der DB, sendet aber keine E-Mail an den Hotel-Admin.

---

## 4. Trial-Logik

**Aktive Trial (Tage 1–13):** ✅ `subscriptionStatus: 'trialing'`, Admin zugänglich, Billing-Seite zeigt Enddatum.

**Trial läuft bald ab (Tage 12–14):**
- ❌ Kein Warn-Banner oder Indikator. Die Billing-Seite zeigt das Enddatum in neutralem Stil. Keine Dringlichkeits-Signalisierung für die letzten 48 Stunden.

**Trial-Ablauf-Erkennung:**
```typescript
// admin/layout.tsx — läuft bei JEDEM Admin-Seitenaufruf
if (status === 'trialing' && hotel?.trialEndsAt && new Date() > hotel.trialEndsAt) {
  await prisma.hotel.update({ where: { id: session.hotelId }, data: { subscriptionStatus: 'inactive' } })
  status = 'inactive'
}
```
- ⚠️ Lazy Expiry: Der DB-Status bleibt `trialing` bis jemand nach Ablauf eine Admin-Seite besucht. Externe Queries sehen veralteten Status.
- ⚠️ DB-Write beim Rendern als Seiteneffekt — bei parallelen Requests werden mehrere unnötige Updates ausgeführt (idempotentes Ergebnis, aber unnötige Last).

**Abgelaufene Trial (ab Tag 15):**
- ✅ Admin wird zu `/admin/billing` weitergeleitet für alle nicht-ausgenommenen Pfade
- ✅ Billing-Seite zeigt "Testphase abgelaufen — bitte Plan aktivieren."
- ✅ Upgrade-Pfad über Stripe Checkout funktioniert

**Trial → Paid Konversion:**
- ✅ Während Trial: "Auswählen" → `switch-plan` (Plan-Label in DB geändert, keine Zahlung)
- ✅ Während Trial: "Jetzt kaufen" → Stripe Checkout Session (sofortige Zahlung)
- ✅ Nach Trial: nur Stripe Checkout verfügbar

**Account löschen während Trial:** ❌ Keine "Account löschen"-Funktion vorhanden.

**Gleiche Unterkunft von zwei verschiedenen Usern registriert:**
- Slug hat `@unique` → gleicher Name → gleicher Slug → zweite Registrierung gibt benutzerfreundliche Fehlermeldung ✅
- E-Mail ist pro User eindeutig → Duplikat blockiert ✅

---

## 5. Pläne / Pakete

**Starter (€59) / Pro (€119) / Business (€249):** ✅ Korrekt in `plans.ts` definiert.

**Feature-Flags nach Upgrade:**
- Plan-Feld via Stripe-Webhook aktualisiert ✅
- Feature-Zugriff live aus `plan`-Feld berechnet via `plan-gates.ts` (keine separaten Boolean-Flags) ✅

**UI spiegelt Plan-Limits wider:**
- Nav-Items via `NAV_PLAN_GATES` + `hasPlanAccess()` im Layout gesperrt ✅
- Lock-Indikator mit `upgradeLabel` angezeigt ✅
- ⚠️ Gesperrte Nav-Items sind als `<a href>`-Links gerendert (nur visuell gesperrt). Ob die tatsächlichen Seitenrouten server-seitig Plan-Gates durchsetzen, ist nicht für alle Seiten verifiziert.

**Beds24 fehlt in `NAV_PLAN_GATES`:**
- ❌ `/admin/beds24` ist in der Sidebar, aber **nicht** in `NAV_PLAN_GATES`. Laut `plans.ts` ist es ein Pro-Feature — derzeit für alle Pläne zugänglich.
- ⚠️ Zusätzlich: `OnboardingSteps.tsx` sagt Beds24 benötigt "Business-Plan", aber `plans.ts` listet es als Pro-Feature. Widerspruch im User-Facing-Text.

**Downgrade-Pfad:**
- ⚠️ Beim Downgrade auf Starter via `switch-plan` werden Branding-Settings gelöscht. Apartments über dem neuen Plan-Limit werden aber **nicht entfernt oder geblockt** — `canAddApartment` verhindert nur neue Apartments. Bestehende Überschüsse bleiben aktiv.
- 💡 Warn-Hinweis auf der Billing-Seite: "Du hast X Apartments, Starter erlaubt nur 3."

**Rechnungen/Billing-Einträge:** ❌ Kein `Invoice`- oder `BillingRecord`-Modell im Prisma-Schema. Die gesamte Rechnungshistorie lebt nur in Stripe.

**Zahlungsfehlschlag:** ✅ `invoice.payment_failed` setzt `past_due`. ❌ Keine E-Mail-Benachrichtigung an den Hotel-Admin.

**`bundle_all` via Stripe Checkout:**
- `getPriceId('bundle_all', 'month')` gibt `''` zurück (kein `STRIPE_PRICE_BUNDLE_ALL` Env-Var).
- ⚠️ Direkter API-Call mit `plan=bundle_all` würde fehlschlagen. Billing-UI filtert `bundle_all` korrekt aus dem Plan-Grid heraus.

---

## 6. Berechtigungen & Zugriffskontrolle

**Kein `middleware.ts`:**
- ❌ Es gibt **keine Next.js Middleware**. Auth wird nur geprüft in:
  - Layout-Ebene (`admin/layout.tsx`) — für alle `/admin/*`-Seiten
  - `verifySession()` — in API-Routen

**Das kritische Problem — Layout-Fallthrough:**
```typescript
// admin/layout.tsx
const session = await decrypt(token)
if (!session) return <>{children}</>  // ← rendert Seiteninhalte OHNE Auth-Redirect
```
Wenn kein gültiger Session-Cookie vorhanden ist, rendert das Layout die `children` **direkt** — ohne Redirect zu Login. Jede individuelle Admin-Seite muss sich selbst schützen.
- ✅ `onboarding/page.tsx` hat eigene Auth-Prüfung
- ✅ Alle API-Routen nutzen `verifySession()` (leitet zu Login weiter)
- ⚠️ Alle anderen Admin-Seiten nicht vollständig geprüft — jede RSC die sensitive Daten lädt ohne eigene Auth-Prüfung würde diese für unauthentifizierte User exponieren.
- 💡 Korrekte Lösung: `middleware.ts` der alle `/admin/*`-Routen auf Edge-Ebene schützt, bevor irgendetwas gerendert wird.

**Rate-Limiting:**
- ✅ Login: 5 Versuche / 15 Min via Upstash
- ❌ Registrierung: kein Rate-Limit
- ❌ E-Mail-Verifizierungs-Endpunkt: kein Rate-Limit (Token-Enumeration möglich, obwohl Tokens 256-bit zufällig sind)

**Abgelaufene Trial-Sperre:**
- ✅ Weiterleitung zu `/admin/billing` (kein roher 403)
- ✅ Billing-Seite zeigt klare Meldung mit Upgrade-CTA

**Session-Sicherheit:**
- `httpOnly: true` ✅, `secure: true` (Produktion) ✅, `sameSite: 'lax'` ✅
- JWT signiert mit `ADMIN_SESSION_SECRET` (HS256) ✅
- `sessionVersion` DB-Validierung bei jedem `verifySession()`-Aufruf ✅

**`ADMIN_SESSION_SECRET` fehlt:** `getSecret()` wirft → `encrypt()` wirft → Login crasht mit 500. `decrypt()` fängt den Fehler ab und gibt `null` zurück → Layout rendert `children` ohne Sidebar (Layout-Fallthrough-Problem von oben).

**Logout:**
- ✅ Löscht `admin_session`-Cookie
- ❌ Inkrementiert `sessionVersion` **nicht**. Ein User der auf zwei Geräten eingeloggt ist: Logout auf Gerät A invalidiert Gerät B's Session nicht. Sessions bleiben bis zu 24h nach Logout gültig.

---

## 7. Onboarding-Status

**Onboarding-Wizard:** ✅ Vorhanden unter `/admin/onboarding`. 5-Schritte-Tour (Willkommen → Betrieb → Verwaltung → Konfiguration → Paket wählen).

**Completion in DB gespeichert:** ❌ Nein. Wizard-Schritt ist `useState` — rein client-seitig. Kein `onboardingCompletedAt`-Feld in `Hotel` oder `AdminUser`.

**Wiederkehrende User:** Jeder Besuch von `/admin/onboarding` startet bei Schritt 0. Ein User der es bereits abgeschlossen hat, sieht es beim nächsten Besuch wieder von vorne.

**Überspringen:** ✅ "Onboarding überspringen" Link → `/admin/billing`

**Neu vs. wiederkehrende User:** ❌ Kein Unterschied. Nach E-Mail-Verifikation immer Redirect zu `/admin/onboarding`, aber kein Mechanismus um zu erkennen ob der User es bereits gesehen hat.

---

## 8. Session & Auth

**Session nach Registrierung:** ⚠️ Session wird **nicht** sofort nach Registrierung erstellt. Der User muss:
1. Formular absenden → Account erstellt, Redirect zu `/register/check-email`
2. Auf Bestätigungs-Link klicken → `GET /api/auth/verify-email?token=...` → Session erstellt → Redirect zu `/admin/onboarding`

Wenn die E-Mail nie ankommt (Resend-Fehler), ist der User dauerhaft ausgesperrt.

**Verify-Email hardcoded `sessionVersion: 0`:**
```typescript
await createSession({ ..., sessionVersion: 0 });  // ← hardcoded
```
Login liest `user.sessionVersion` aus der DB. Für neue User (Default 0) stimmt das überein ✅. Wenn jemand `sessionVersion` manuell inkrementiert, würde die neu erstellte Session sofort bei `verifySession()` fehlschlagen.

**Session-Ablauf:** 24h fest. Kein Sliding Expiry, kein "Angemeldet bleiben". ⚠️ Ein Hotelier der den ganzen Tag arbeitet, wird nach 24h lautlos ausgeloggt.

**Session nach Token-Ablauf während Onboarding:** Client-seitiger State geht verloren. User wird bei nächstem Server-Request zu Login weitergeleitet. Keine Warnung.

**"Angemeldet bleiben":** ❌ Nicht implementiert.

---

## Edge Cases

| # | Edge Case | Status |
|---|-----------|--------|
| 1 | Netzwerkunterbrechung während Form-Submit | ✅ Prisma Nested Write atomar; keine halbfertigen Datensätze |
| 2 | Gleichzeitige Registrierungen mit gleicher E-Mail | ✅ P2002 abgefangen (behoben 2026-05-19) |
| 3 | Ungültiger Plan via API-Bypass | ✅ `plan` server-seitig gegen `PLANS`-Keys validiert |
| 4 | Trial-Datum-Manipulation via Request-Params | ✅ Server-seitig berechnet, nicht vom User geliefert |
| 5 | `RESEND_API_KEY` fehlt | ✅ Fehlermeldung im Formular, kein DB-Write (behoben 2026-05-19) |
| 6 | `DATABASE_URL` fehlt | ❌ App crasht mit Prisma-Verbindungsfehler (erwartet) |
| 7 | `ADMIN_SESSION_SECRET` fehlt | ❌ Login 500, alle Sessions ungültig, Layout-Fallthrough |
| 8 | Langer Input (500-Zeichen-Hotelname) | ⚠️ Kein server-seitiges Max-Length auf hotelName oder E-Mail |
| 9 | Sehr langes Passwort | ❌ Kein Max-Length → scrypt DoS-Vektor |
| 10 | SQL-Injection via Namensfelder | ✅ Prisma parameterisierte Queries |
| 11 | User registriert, bestätigt E-Mail nie | ✅ Zombie-Cleanup bei Neuregistrierung (behoben 2026-05-19) |

---

## Priorisierte Mängelliste

### P0 — Blockiert Registrierung komplett
*Keiner gefunden.*

### P1 — Defekter Flow / Datenintegrität

| ID | Problem | Datei | Status |
|----|---------|-------|--------|
| P1-1 | **Stiller Resend-Fehler** — Account erstellt, Bestätigungs-E-Mail nie versandt, User dauerhaft ausgesperrt ohne Self-Service-Recovery | `app/register/register-hotel.ts` | ✅ Behoben 2026-05-19 |
| P1-2 | **Kein Rate-Limit bei Registrierung** — unbegrenzte Account-Erstellung möglich | `app/register/register-hotel.ts` | ✅ Behoben 2026-05-19 |
| P1-3 | **Race Condition** — unbehandelter P2002-Fehler bei gleichzeitiger Registrierung mit gleicher E-Mail | `app/register/register-hotel.ts` | ✅ Behoben 2026-05-19 |
| P1-4 | **Admin-Layout rendert Children ohne Session** — kein Edge-Level Auth-Guard | `proxy.ts` | ✅ War bereits implementiert (`proxy.ts`) — im Audit übersehen |
| P1-5 | **Unverifizierte Accounts belegen E-Mail/Slug permanent** — kein Cleanup nach 24h Token-Ablauf | `app/register/register-hotel.ts` | ✅ Behoben 2026-05-19 |
| P1-6 | **Logout invalidiert andere Sessions nicht** — `sessionVersion` wird bei Logout nicht inkrementiert | `app/admin/login/actions.ts` | ✅ Behoben 2026-05-19 |

### P2 — UX-Problem / Nicht behandelte Edge Cases

| ID | Problem | Datei | Status |
|----|---------|-------|--------|
| P2-1 | Kein Trial-Ablauf-Warn-Banner für Tage 12–14 | Billing-Seite | ✅ Behoben 2026-05-19 |
| P2-2 | `AdminUserHotel` nicht bei Registrierung befüllt → Hotel-Switcher zeigt leere Liste | `app/register/register-hotel.ts` | ✅ Behoben 2026-05-19 |
| P2-3 | `HotelSettings` wird bei Registrierung nicht erstellt → null-Settings bis erster Zugriff | `app/register/register-hotel.ts` | ✅ Behoben 2026-05-19 |
| P2-4 | Onboarding-Status nicht in DB persistiert → Wizard startet bei jedem Besuch bei Schritt 0 | `app/admin/onboarding/OnboardingSteps.tsx` | ⏭️ Nicht umgesetzt — Seite ist rein informativ, kein Schaden durch erneutes Aufrufen |
| P2-5 | Kein "Bestätigungs-E-Mail erneut senden"-Endpunkt | Fehlende Route | ✅ Behoben 2026-05-19 |
| P2-6 | Keine E-Mail an Hotel-Admin bei Zahlungsfehlschlag | `app/api/stripe/webhook/route.ts` | ✅ Behoben 2026-05-19 |
| P2-7 | Passwort-Max-Länge nicht geprüft → scrypt DoS-Vektor | `app/register/register-hotel.ts` | ✅ Behoben 2026-05-19 |
| P2-8 | Beds24 fehlt in `NAV_PLAN_GATES` (Pro-Feature, aber für alle Pläne zugänglich) | `src/lib/plan-gates.ts` | ✅ Behoben 2026-05-19 |
| P2-9 | Session 24h fest — kein Sliding Expiry, kein "Angemeldet bleiben" | `src/lib/session.ts` | ⏭️ Nicht umgesetzt — Aufwand/Nutzen-Verhältnis nicht gegeben |
| P2-10 | DB `subscriptionStatus` bleibt `trialing` bis zum nächsten Seitenbesuch nach Ablauf | `app/admin/layout.tsx` | ✅ Behoben 2026-05-19 |
| P2-11 | Downgrade warnt nicht bei Apartment-Überschuss über neues Plan-Limit | `app/api/admin/switch-plan/route.ts` | ✅ Behoben 2026-05-19 |
| P2-12 | Slug ohne striktes Server-Format-Validierung akzeptiert | `app/register/register-hotel.ts` | ✅ Behoben 2026-05-19 |

**Zusätzlich umgesetzt (aus P2-Diskussion):**
- ✅ **Trial-Ablauf-Sequenz:** Cron `/api/cron/expire-trials` täglich 08:00 — E-Mail 1 an Tag 3, E-Mail 2 an Tag 7 (mit Auto-Delete-Warnung), Auto-Delete an Tag 14
- ✅ **Self-Service Account-Löschung:** `/delete-account?token=...` — Bestätigungsseite mit einmaligem Token aus Ablauf-E-Mail; Cascade-Delete Hotel + AdminUser
- ✅ **Hasky KI-Assistent:** Chat-Widget (`AdminChatWidget`) und alle Referenzen von generischem "KI-Assistent" auf benannten Charakter "Hasky" umgestellt

### P3 — Nice-to-Have / Minor

| ID | Problem |
|----|---------|
| P3-1 | Kein Unterkunftstyp-Feld (Hotel/Pension/Apartment) in Formular/Schema |
| P3-2 | Kein Name (Vor-/Nachname) des Admin-Users bei Registrierung |
| P3-3 | Passwort-Stärke: nur Min-8-Zeichen, keine Komplexitätsanforderung |
| P3-4 | Keine internen Billing/Rechnungs-Einträge (nur Stripe) |
| P3-5 | `bundle_all` Stripe-Checkout würde mit leerem Price-ID fehlschlagen |
| P3-6 | `OnboardingSteps.tsx` sagt Beds24 benötigt "Business-Plan", `plans.ts` listet es als Pro-Feature |
| P3-7 | Keine "Account löschen"-Funktion |
| P3-8 | `verify-email` hardcoded `sessionVersion: 0` statt DB-Wert zu lesen |
| P3-9 | Kein Max-Length auf `hotelName` oder `email` server-seitig |

---

## Geprüfte Dateien

| Datei | Rolle |
|-------|-------|
| `app/register/RegisterForm.tsx` | Registrierungsformular UI |
| `app/register/register-hotel.ts` | Server Action — Registrierungslogik |
| `app/api/auth/verify-email/route.ts` | E-Mail-Verifikation + erste Session |
| `app/admin/login/actions.ts` | Login Server Action |
| `app/admin/layout.tsx` | Auth-Gate, Trial-Ablauf, Plan-Gates |
| `app/admin/onboarding/OnboardingSteps.tsx` | Onboarding-Wizard |
| `app/admin/billing/page.tsx` | Plan-Auswahl + Upgrade-UI |
| `app/api/admin/switch-plan/route.ts` | Trial-Plan-Wechsel |
| `app/api/stripe/checkout/route.ts` | Stripe Checkout Session |
| `app/api/stripe/webhook/route.ts` | Stripe Event Handler |
| `src/lib/plans.ts` | Plan-Definitionen + Preise |
| `src/lib/plan-gates.ts` | Feature-Zugriffskontrolle |
| `src/lib/session.ts` | Session erstellen/prüfen/löschen |
| `src/lib/session-crypto.ts` | JWT verschlüsseln/entschlüsseln |
| `src/lib/email.ts` | Resend-Client + E-Mail-Builder |
| `src/lib/password.ts` | scrypt Hash + Verify |
| `src/lib/rate-limit.ts` | Upstash Rate-Limiter |
| `prisma/schema.prisma` | Vollständiges Datenmodell |

# Marketplace-Konzept — Unterkunftsplattform (Arbeitstitel)

> **Status:** Idee — noch nicht priorisiert  
> **Voraussetzung:** ~20–30 aktive bookingwulf-Hotels bevor der Launch Sinn ergibt

---

## Grundidee

bookingwulf ist ein B2B-Tool: Hotels betten das Widget auf ihrer eigenen Website ein.

Das Marketplace-Produkt wäre das Gegenstück: eine B2C-Plattform auf der Gäste direkt suchen — über alle teilnehmenden Hotels hinweg. Separates Produkt, separater Name, separates Branding.

**Gäste suchen:** Anreise / Abreise / Personen → sehen verfügbare Apartments aller gelisteten Hotels → buchen direkt auf der Plattform.

---

## Warum als separates Produkt?

- Kein Interessenkonflikt: Hotels erscheinen nicht automatisch neben Konkurrenten auf ihrer eigenen Website
- Eigene SEO-Strategie und eigener Traffic-Aufbau
- Unterschiedliches Geschäftsmodell (Provision statt Abo)
- Hotels können aktiv opt-in wählen

---

## Geschäftsmodell

| Kanal | Modell |
|---|---|
| Marketplace-Buchung | 5–8% Provision |
| bookingwulf-Abokunden | Gratis gelistet (Anreiz für höheres Abo-Tier) |
| Nicht-bookingwulf-Hotels | Kostenpflichtiges Listing oder Provision-only |

---

## Technische Basis

Die Infrastruktur existiert bereits in bookingwulf:

- **Selbe DB (Railway)** — Hotels, Apartments, Preise, Sperrzeiten, Buchungslogik
- **Selbe `/api/request` Route** — Buchungsflow läuft durch
- **Verfügbarkeitscheck** — BlockedRanges + Request-Konflikte bereits implementiert

**Neu zu bauen:**
1. Opt-in-Flag auf Hotel (`marketplaceEnabled: Boolean @default(false)`)
2. Öffentliche Hotelprofilseiten (Beschreibung, Fotos, Karte, Amenities)
3. Suchseite mit Datums- und Gästefilter
4. Verfügbarkeits-Abfrage über alle gelisteten Hotels für einen Zeitraum
5. Separates Next.js-Projekt oder Subdomain (z.B. `entdecken.at` / `suchen.bookingwulf.com`)

Aufwand geschätzt: 3–5 Wochen für MVP.

---

## Chicken-and-Egg Problem

Das klassische Plattform-Problem: ohne Hotels kommen keine Gäste, ohne Gäste wollen keine Hotels.

**Lösungsansatz:**
- bookingwulf-Bestandskunden als erste Listings gewinnen (opt-in, kostenlos)
- SEO: Profilseiten für jedes Hotel indexierbar machen → organischer Traffic über Hotelnamen + Region
- Erst wenn ~20 Hotels gelistet sind: aktives Marketing der Suchseite

---

## Strategische Logik

```
Phase 1 (jetzt):     bookingwulf wächst auf 20–30 aktive Hotels
Phase 2 (später):    Marketplace-Produkt launcht mit Bestandskunden als erste Listings
Phase 3:             Marketplace generiert eigenen Traffic → neue Hotels wollen gelistet sein
                     → neue bookingwulf-Abo-Kunden durch Marketplace-Sichtbarkeit
```

Beide Produkte verstärken sich gegenseitig:
- bookingwulf-Kunden bekommen Marketplace-Sichtbarkeit gratis
- Marketplace-Traffic bringt neue bookingwulf-Kunden

---

## Offene Fragen

- [ ] Produktname / Domain
- [ ] Geografischer Fokus zu Start (nur Österreich? DACH?)
- [ ] Provision-Abwicklung technisch (Stripe Connect o.ä.)
- [ ] Wie viel öffentlichen Content braucht ein Hotel-Profil? (Hotels müssten Beschreibungen/Fotos nachliefern)
- [ ] Meldezettel / Gästemeldung als Pflichtfeature für AT?

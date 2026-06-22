# Language Audit — Testplan

Stand: 2026-05-31 · Commit 8eff39d

---

## Widget — Sprachauswahl

```
/widget?hotel=alpine-retreat          → Deutsch (default)
/widget?hotel=alpine-retreat&lang=en  → Englisch
/widget?hotel=alpine-retreat&lang=it  → Italienisch
/widget?hotel=alpine-retreat&lang=fr  → Fallback Deutsch
```

---

## Widget — konkret prüfen (IT + EN)

- [ ] Kalender: Monatsnamen + Wochentage übersetzt
- [ ] Preisformat: `€ 1.234,00` (DE/IT) vs `€ 1,234.00` (EN)
- [ ] Sort-Dropdown: „Prezzo crescente / decrescente" (IT) / „Price ascending / descending" (EN)
- [ ] Step-Labels: „Dati viaggio / Appartamenti / Servizi aggiuntivi" (IT)
- [ ] Fehlermeldungen beim Absenden ohne Pflichtfelder → übersetzt
- [ ] Zahlungsbereich: „Carta di credito" (IT) / „Credit card" (EN) statt „Kreditkarte"
- [ ] Apartment-Bildnavigation (Browser-Inspektor): `aria-label` auf Prev/Next-Buttons übersetzt
- [ ] Gutschein-Bereich: Labels und Fehlermeldungen übersetzt

---

## Accessibility (Browser-Inspektor → Elements)

| Element | Key | Erwartet EN |
|---|---|---|
| `ol.steps` | `aria_booking_steps` | "Booking steps" |
| `div#apartments` | `aria_apartments` | "Available apartments" |
| `button#viewTop` | `aria_view_top` | "Steps top" |
| `button#viewSidebar` | `aria_view_sidebar` | "Steps sidebar" |
| `button#lightboxClose` | `aria_lightbox_close` | "Close" |
| `button#lightboxPrev` | `aria_prev_image` | "Previous image" |
| `button#lightboxNext` | `aria_next_image` | "Next image" |
| Apt-Bildnav Prev | `aria_prev_image` | "Previous image" |
| Apt-Bildnav Next | `aria_next_image` | "Next image" |

---

## E-Mail-Sprache

- [ ] Buchung mit `lang=it` absenden → Bestätigungsmail auf Italienisch
- [ ] Buchung ohne lang-Param (Browser DE) → Mail auf Deutsch
- [ ] Buchung ohne lang-Param (Browser EN) → Mail auf Englisch

---

## Gästemappe (ThingsToSee)

Voraussetzung: Hotel hat Umgebungstipps angelegt und Admin hat gespeichert (DeepL-Übersetzung läuft beim Speichern).

- [ ] Sprach-Switcher DE/EN/IT → Titel + Beschreibung der Einträge wechselt
- [ ] Extras-Namen wechseln mit Sprache (nameEn / nameIt)

---

## Admin — Auto-Translate (DeepL)

- [ ] Neuen Umgebungstipp anlegen → `titleEn` + `titleIt` in DB gespeichert (via Prisma Studio oder psql prüfen)
- [ ] Bestehenden Tipp bearbeiten → Übersetzungen werden neu generiert
- [ ] Neue Kinderpreiskategorie mit Label anlegen → `labelEn` + `labelIt` gespeichert

---

## Noch offen / nicht getestet

- `emergencyNumbers[].label` → kein Übersetzungsfeld im Schema (JSON-Erweiterung nötig)
- Placeholder Vorname / Nachname / Tel → bewusst zurückgestellt (UX-Entscheidung)
- `aria-label="Liste"` / `aria-label="Masonry"` auf Layout-Toggle → niedrige Priorität
- `chat.js` → kein i18n, separates Ticket nach IT-Launch

## Erledigt (Audit)

- ✅ `widget.html` — 200 Keys DE/EN/IT, aria-labels, sort-dropdown
- ✅ `mini-widget.html` — IT-Block ergänzt, Whitelist-Fix (Commit 6d73018)
- ✅ `availability-widget.html` — IT-Block ergänzt, Whitelist-Fix (Commit 6d73018)
- ✅ `widget.js` — kein Fix nötig, gibt data-lang unverändert durch
- ✅ `GuestPortal.tsx` — guestportal IT-Value, checkinLink Key
- ✅ `email-i18n.ts` — vollständig, 9 Sprachen, keine Lücken

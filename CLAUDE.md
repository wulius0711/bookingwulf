@AGENTS.md

## Dokumentation aktuell halten

`DOCUMENTATION.md` ist die interne Projektdokumentation. Bei jeder Änderung die einen der folgenden Bereiche betrifft, die betroffenen Abschnitte in `DOCUMENTATION.md` mitaktualisieren:

- Datenbankschema (Prisma) → Abschnitt 4
- Auth / Sessions → Abschnitt 5
- Pläne / Feature-Gates / Preise → Abschnitt 6
- Buchungslogik / API-Routen → Abschnitte 7, 13
- Widget-System → Abschnitt 8
- E-Mail-System → Abschnitt 9
- iCal-Sync → Abschnitt 10
- Stripe / Billing → Abschnitt 11
- Admin-Seiten → Abschnitt 12
- Umgebungsvariablen → Abschnitt 14
- Deployment / Cron Jobs → Abschnitt 15
- Datenschutz / DSGVO → Abschnitt 16

## Handbuch aktuell halten

`app/admin/help/page.tsx` ist das Benutzer-Handbuch im Admin-Bereich. Bei jeder Änderung die einen der folgenden Bereiche betrifft, den entsprechenden Abschnitt im Handbuch mitaktualisieren:

- Neue Admin-Seiten oder Features → neuen Abschnitt in `sections` Array eintragen (mit `id`, `title`, `plan` falls plan-gesperrt, und `content`-Funktion)
- Bestehende Features ändern (UI, Workflow, Einstellungen) → betroffenen Abschnitt im Handbuch anpassen
- Plan-Änderungen (Feature wird pro/business) → `plan`-Feld im Handbuch-Eintrag aktualisieren
- Neue Sprachen oder E-Mail-Features → Abschnitt "E-Mail Templates" aktualisieren
- Nuki / Integrationen → Abschnitt "Schlüsselloses Einchecken" aktualisieren

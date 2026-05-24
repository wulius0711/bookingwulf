# bookingwulf Gast-Chatbot

KI-Buchungsassistent als embeddable Widget. Hotelier bindet einen einzigen `<script>`-Tag ein — fertig.

## Einbindung

```html
<script
  src="https://bookingwulf.com/chat.js"
  data-hotel="mein-hotel-slug">
</script>
```

Den Code vor dem schließenden `</body>`-Tag einfügen. Name, Farbe und Avatar werden automatisch aus den Admin-Einstellungen geladen — kein weiteres Attribut nötig.

## Setup (Admin-UI)

Unter `/admin/chatbot`:

1. **Chatbot aktivieren** — Toggle einschalten
2. **Name** — z.B. "Lisa" oder "Buchungs-Assistent"
3. **Akzentfarbe** — passt Chat-Button und Bubbles an
4. **Avatar** — optionales Profilbild hochladen (quadratisch, min. 100×100 px)
5. **Website-Kontext** — URL eingeben und "Scrapen" klicken → Bot kennt Lage, Storno, Umgebung etc.
6. **FAQ** — manuelle Q&A-Einträge für Infos die nicht auf der Website stehen

Der fertige Einbindungs-Code (mit dem korrekten Slug) wird unten auf der Admin-Seite angezeigt.

## Was der Bot kann

- Apartments beschreiben und kontextabhängig empfehlen (Familie, Paar, Haustiere, Wellness, Budget…)
- Verfügbarkeit prüfen und Preise berechnen
- Extras & Upsells vorstellen (aus HotelExtras mit `showInUpsell: true`)
- Fragen zu Check-in, Check-out, Parken, WLAN etc. beantworten
- Direkten Buchungslink generieren (vorausgefüllt mit Daten aus dem Chat) — erscheint im Chat als gepulster "Jetzt buchen →"-Button

## Was der Bot NICHT tut

- Keine Buchungen anlegen (Gast wird zum bestehenden Buchungsflow weitergeleitet)
- Keine Zahlungen verarbeiten
- Keine Gästedaten speichern (stateless, History im Browser)

## API

### GET /api/chat?hotel=SLUG

Gibt die Widget-Konfiguration zurück (wird vom Widget beim Start automatisch gefetcht).

```json
{ "name": "Lisa", "color": "#2d6a4f", "avatar": "https://..." }
```

### POST /api/chat

```json
{
  "hotelSlug": "mein-hotel-slug",
  "messages": [
    { "role": "user", "content": "Habt ihr was für 2 Erwachsene + 1 Kind?" }
  ]
}
```

Response:
```json
{
  "message": "Gerne! Für welches Datum planen Sie Ihre Reise?",
  "assistantName": "Lisa",
  "avatarUrl": "https://..."
}
```

## Tools (intern, Gemini Function Calling)

| Tool | Beschreibung |
|------|-------------|
| `check_availability` | Verfügbare Apartments + Preise für Zeitraum + Personenzahl (max. 3 Ergebnisse) |
| `get_property_info` | Extras, Policies, FAQ-Matches aus DB |
| `get_booking_url` | Vorausgefüllter Buchungslink auf Basis von `HotelSettings.miniWidgetTarget` |

## Technisches

- Widget als Shadow DOM — kein CSS-Konflikt mit der Hotel-Website
- Mobile: Bottom-Sheet (72dvh), iOS-Zoom-Fix (font-size 16px), safe-area-insets
- KI: Gemini 2.5 Flash via `@google/genai`
- Avatar-Upload: Vercel Blob unter `chatbot-avatar/{hotelId}-{filename}`
- Website-Kontext: Jina Reader (`https://r.jina.ai/{url}`), max. 8.000 Zeichen im Prompt

# bookingwulf Gast-Chatbot

KI-Buchungsassistent als embeddable Widget. Hotelier bindet einen einzigen `<script>`-Tag ein — fertig.

## Einbindung

```html
<script
  src="https://bookingwulf.com/chat.js"
  data-hotel="mein-hotel-slug"
  data-color="#2d6a4f">
</script>
```

| Attribut | Pflicht | Beschreibung |
|----------|---------|-------------|
| `data-hotel` | ✅ | Hotel-Slug (wie in der URL: `/admin`) |
| `data-color` | — | Akzentfarbe (Hex), Default `#1a1a1a` |

## Was der Bot kann

- Apartments beschreiben und kontextabhängig empfehlen (Familie, Paar, Haustiere, Wellness, Budget…)
- Verfügbarkeit prüfen und Preise berechnen
- Extras & Upsells vorstellen (Frühstück, Spa etc. aus den HotelExtras mit `showInUpsell: true`)
- Fragen zu Check-in, Check-out, Parken, WLAN etc. beantworten
- Direkten Buchungslink generieren (vorausgefüllt mit Daten aus dem Chat)

## Was der Bot NICHT tut

- Keine Buchungen anlegen (der Gast wird zum bestehenden Buchungsflow weitergeleitet)
- Keine Zahlungen verarbeiten
- Keine Gästedaten speichern (stateless, History im Browser)

## Admin-Setup

### 1. Chatbot aktivieren

In der DB das Hotel-Record updaten:
```sql
UPDATE "Hotel" SET "chatbotEnabled" = true WHERE slug = 'mein-hotel-slug';
```
→ Admin-UI kommt in einem späteren Release.

### 2. Website-Kontext scrapen (empfohlen)

Den Inhalt der Hotel-Website via Jina Reader in `chatbotContext` speichern:

```bash
curl "https://r.jina.ai/https://www.mein-hotel.at" > context.txt
```

Dann in DB:
```sql
UPDATE "Hotel"
SET "chatbotContext" = '<inhalt>', "chatbotSourceUrl" = 'https://www.mein-hotel.at', "chatbotScrapedAt" = NOW()
WHERE slug = 'mein-hotel-slug';
```

### 3. Manuelle FAQ (optional)

Für Infos die nicht auf der Website stehen:
```sql
UPDATE "Hotel"
SET "chatbotFaq" = '[{"question":"Sind Haustiere erlaubt?","answer":"Ja, kleine Hunde sind willkommen (max. 10kg). Bitte beim Buchen angeben."}]'
WHERE slug = 'mein-hotel-slug';
```

### 4. Buchungslink-Basis

Der Bot nutzt `HotelSettings.miniWidgetTarget` als Basis-URL für Buchungslinks.
Falls nicht gesetzt: `https://bookingwulf.com/widget/{slug}` (Fallback).

## API

`POST /api/chat`

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
{ "message": "Gerne! Für welches Datum planen Sie Ihre Reise?" }
```

## Tools (intern)

| Tool | Beschreibung |
|------|-------------|
| `check_availability` | Verfügbare Apartments + Preise für Zeitraum + Personenzahl |
| `get_property_info` | Extras, Policies, FAQ-Matches aus DB |
| `get_booking_url` | Vorausgefüllter Buchungslink |

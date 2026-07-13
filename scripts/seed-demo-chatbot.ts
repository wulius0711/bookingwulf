import { prisma } from '../src/lib/prisma'

const HOTEL_SLUG = 'alpine-retreat'
const CHATBOT_NAME = 'Anna'

const CONTEXT = `Alpine Retreat ist eine Boutique-Ferienwohnungsanlage auf einem Hochplateau in den Alpen, umgeben von Bergen. Drei Apartments stehen zur Verfügung:
- Studio Sunrise (32 m², bis 2 Erwachsene, Bergpanorama, ab €140/Nacht)
- Apartment Alpenglow (44 m², bis 4 Erwachsene + 2 Kinder, Tal- & Bergblick, ab €180/Nacht)
- Suite Panorama (64 m², bis 6 Erwachsene + 2 Kinder, 180°-Bergpanorama, Sauna, ab €240/Nacht)

Alle Apartments: kostenloses WLAN, voll ausgestattete Küche, Smart-TV, Fußbodenheizung, Balkon, kostenloser Parkplatz.

Buchungsbedingungen:
- Check-in: ab 15:00 Uhr
- Check-out: bis 10:00 Uhr
- Endreinigung: €85 (€70 bei Studio Sunrise)
- Ortstaxe: €3,50 pro Person/Nacht
- Haustiere: €16–18/Nacht auf Anfrage
- Kaution: 20% des Buchungswerts
- Stornierung: kostenlos bis 30 Tage vor Anreise, 50% bis 14 Tage vor Anreise, 100% innerhalb von 14 Tagen

Lage: hochalpines Plateau, umgeben von Wander- und Bike-Trails direkt vor der Tür, ideal für Outdoor-Aktivitäten in allen Jahreszeiten.`

const FAQ = [
  { question: 'Gibt es Frühstück?', answer: 'Wir bieten kein Frühstück an, da jedes Apartment eine voll ausgestattete Küche hat — im Dorf gibt es aber mehrere Frühstückscafés in wenigen Gehminuten.' },
  { question: 'Kann ich mit Hund anreisen?', answer: 'Ja, Haustiere sind gegen eine Gebühr von €16–18 pro Nacht willkommen — bitte bei der Buchung im Nachrichtenfeld angeben.' },
  { question: 'Gibt es einen Pool oder Wellnessbereich?', answer: 'Die Suite Panorama verfügt über eine eigene Sauna. Einen gemeinschaftlichen Pool gibt es aktuell nicht.' },
]

async function main() {
    console.log(`🌱 Enabling demo chatbot for ${HOTEL_SLUG}...`)

    const hotel = await prisma.hotel.findUnique({ where: { slug: HOTEL_SLUG } })
    if (!hotel) {
        throw new Error(`Hotel "${HOTEL_SLUG}" not found — run seed-demo-property.ts first.`)
    }

    await prisma.hotel.update({
        where: { id: hotel.id },
        data: {
            chatbotEnabled: true,
            chatbotName: CHATBOT_NAME,
            chatbotColor: '#2f6f4f',
            chatbotContext: CONTEXT,
            chatbotFaq: FAQ,
            chatbotSourceUrl: null,
            chatbotScrapedAt: null,
        },
    })

    console.log(`✅ Chatbot "${CHATBOT_NAME}" enabled for "${hotel.name}"`)
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e)
        process.exit(1)
    })
    .finally(() => prisma.$disconnect())

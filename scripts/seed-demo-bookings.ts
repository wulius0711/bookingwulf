import { prisma } from '../src/lib/prisma'

const HOTEL_SLUG = 'alpine-retreat'

const APARTMENTS = {
    studio: { id: 18, name: 'Studio Sunrise', basePrice: 140, cleaningFee: 70 },
    alpenglow: { id: 19, name: 'Apartment Alpenglow', basePrice: 180, cleaningFee: 85 },
    suite: { id: 20, name: 'Suite Panorama', basePrice: 240, cleaningFee: 85 },
}

function addDays(days: number): Date {
    const d = new Date()
    d.setDate(d.getDate() + days)
    d.setHours(15, 0, 0, 0)
    return d
}

const BOOKINGS = [
    // Past stays
    { apt: APARTMENTS.studio, arrivalOffset: -35, nights: 3, status: 'booked', salutation: 'Frau', firstname: 'Petra', lastname: 'Wagner', email: 'petra.wagner@example.com', country: 'DE', adults: 2, children: 0 },
    { apt: APARTMENTS.suite, arrivalOffset: -21, nights: 7, status: 'booked', salutation: 'Herr', firstname: 'Thomas', lastname: 'Gruber', email: 'thomas.gruber@example.com', country: 'AT', adults: 4, children: 2 },
    { apt: APARTMENTS.alpenglow, arrivalOffset: -10, nights: 3, status: 'booked', salutation: 'Frau', firstname: 'Nadine', lastname: 'Meier', email: 'nadine.meier@example.com', country: 'CH', adults: 2, children: 1 },
    // Active pipeline (near-term, not yet fully confirmed)
    { apt: APARTMENTS.studio, arrivalOffset: 3, nights: 2, status: 'new', salutation: 'Herr', firstname: 'Bram', lastname: 'de Vries', email: 'bram.devries@example.com', country: 'NL', adults: 2, children: 0 },
    { apt: APARTMENTS.suite, arrivalOffset: 8, nights: 4, status: 'answered', salutation: 'Frau', firstname: 'Emily', lastname: 'Clarke', email: 'emily.clarke@example.com', country: 'GB', adults: 4, children: 0 },
    // Reserved gap: today+14 .. today+21 left free for the live widget-flow recording
    // Future confirmed stays
    { apt: APARTMENTS.alpenglow, arrivalOffset: 25, nights: 4, status: 'booked', salutation: 'Herr', firstname: 'Michael', lastname: 'Schneider', email: 'michael.schneider@example.com', country: 'DE', adults: 3, children: 1 },
    { apt: APARTMENTS.studio, arrivalOffset: 33, nights: 3, status: 'booked', salutation: 'Frau', firstname: 'Julia', lastname: 'Berger', email: 'julia.berger@example.com', country: 'AT', adults: 2, children: 0 },
    { apt: APARTMENTS.suite, arrivalOffset: 45, nights: 7, status: 'booked', salutation: 'Herr', firstname: 'Stefan', lastname: 'Huber', email: 'stefan.huber@example.com', country: 'DE', adults: 5, children: 2 },
    { apt: APARTMENTS.alpenglow, arrivalOffset: 60, nights: 4, status: 'booked', salutation: 'Frau', firstname: 'Laura', lastname: 'Frei', email: 'laura.frei@example.com', country: 'CH', adults: 4, children: 0 },
]

async function main() {
    console.log(`🌱 Seeding demo bookings for ${HOTEL_SLUG}...`)

    const hotel = await prisma.hotel.findUnique({ where: { slug: HOTEL_SLUG } })
    if (!hotel) {
        throw new Error(`Hotel "${HOTEL_SLUG}" not found — run seed-demo-property.ts first.`)
    }

    const existing = await prisma.request.count({ where: { hotelId: hotel.id } })
    if (existing > 0) {
        console.log(`✅ ${existing} request(s) already exist for "${HOTEL_SLUG}". Skipping.`)
        return
    }

    for (const b of BOOKINGS) {
        const arrival = addDays(b.arrivalOffset)
        const departure = addDays(b.arrivalOffset + b.nights)
        const roomTotal = b.nights * b.apt.basePrice
        const total = roomTotal + b.apt.cleaningFee

        await prisma.request.create({
            data: {
                hotelId: hotel.id,
                arrival,
                departure,
                nights: b.nights,
                adults: b.adults,
                children: b.children,
                selectedApartmentIds: String(b.apt.id),
                salutation: b.salutation,
                firstname: b.firstname,
                lastname: b.lastname,
                email: b.email,
                country: b.country,
                paymentMethod: 'stripe',
                status: b.status,
                language: 'de',
                pricingJson: {
                    total,
                    apartments: [{ apartmentName: b.apt.name, totalPrice: total, cleaningFee: b.apt.cleaningFee }],
                },
            },
        })
    }

    console.log(`✅ Created ${BOOKINGS.length} demo bookings`)
    console.log('   → Gap left free: today+14 .. today+21 (for the live widget-flow recording)')
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e)
        process.exit(1)
    })
    .finally(() => prisma.$disconnect())

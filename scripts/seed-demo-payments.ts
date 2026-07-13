import { prisma } from '../src/lib/prisma'

const HOTEL_SLUG = 'alpine-retreat'

async function main() {
    console.log(`🌱 Enabling demo payment methods for ${HOTEL_SLUG}...`)

    const hotel = await prisma.hotel.findUnique({ where: { slug: HOTEL_SLUG } })
    if (!hotel) {
        throw new Error(`Hotel "${HOTEL_SLUG}" not found — run seed-demo-property.ts first.`)
    }

    await prisma.hotelSettings.update({
        where: { hotelId: hotel.id },
        data: {
            enableInstantBooking: true,
            paypalEnabled: true,
            paypalClientId: 'AaBbCcDdEeFfGgHhIiJj-demoPlaceholder',
            paypalClientSecret: 'demo-placeholder-secret',
            stripeEnabled: true,
            stripePublishableKey: 'pk_test_NOT_A_REAL_KEY_demo_placeholder',
            stripeSecretKey: 'sk_test_NOT_A_REAL_KEY_demo_placeholder',
        },
    })

    console.log(`✅ PayPal + Stripe (Platzhalter-Keys) aktiviert für "${hotel.name}"`)
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e)
        process.exit(1)
    })
    .finally(() => prisma.$disconnect())

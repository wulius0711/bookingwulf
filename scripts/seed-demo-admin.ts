import { prisma } from '../src/lib/prisma'
import { hashPassword } from '../src/lib/password'

const HOTEL_SLUG = 'alpine-retreat'
const EMAIL = 'demo@bookingwulf.com'
const PASSWORD = 'AlpineDemo2026!'

async function main() {
    console.log(`🌱 Seeding demo admin user for ${HOTEL_SLUG}...`)

    const hotel = await prisma.hotel.findUnique({ where: { slug: HOTEL_SLUG } })
    if (!hotel) {
        throw new Error(`Hotel "${HOTEL_SLUG}" not found — run seed-demo-property.ts first.`)
    }

    const existing = await prisma.adminUser.findUnique({ where: { email: EMAIL } })
    if (existing) {
        console.log(`✅ Admin user "${EMAIL}" already exists (id: ${existing.id}). Skipping.`)
        return
    }

    const passwordHash = await hashPassword(PASSWORD)

    const admin = await prisma.adminUser.create({
        data: {
            hotelId: hotel.id,
            email: EMAIL,
            passwordHash,
            role: 'hotel_admin',
            isActive: true,
            isEmailVerified: true,
        },
    })

    console.log(`✅ Created admin user "${admin.email}" (id: ${admin.id}) for hotel "${hotel.name}"`)
    console.log(`   → Login: ${EMAIL} / ${PASSWORD}`)
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e)
        process.exit(1)
    })
    .finally(() => prisma.$disconnect())

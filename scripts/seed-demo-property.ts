import { prisma } from '../src/lib/prisma'

const SLUG = 'alpine-retreat'

const APARTMENTS = [
    {
        name: 'Studio Sunrise',
        slug: 'studio-sunrise',
        description: 'A cozy studio apartment for two, featuring floor-to-ceiling windows with stunning mountain views. Designed with natural materials and warm tones — your perfect alpine base.',
        maxAdults: 2,
        maxChildren: 0,
        size: 32,
        bedrooms: 0,
        view: 'Mountain panorama',
        basePrice: 140,
        cleaningFee: 70,
        sortOrder: 1,
        amenities: [
            'Mountain view', 'Free WiFi', 'Fully equipped kitchen',
            'Smart TV', 'Underfloor heating', 'Balcony', 'Parking included',
        ],
        images: [
            { imageUrl: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200', altText: 'Studio Sunrise — living area' },
            { imageUrl: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1200', altText: 'Studio Sunrise — bedroom' },
        ],
    },
    {
        name: 'Apartment Alpenglow',
        slug: 'apartment-alpenglow',
        description: 'Spacious 1-bedroom apartment for up to 4 guests. Open-plan living area, a fully equipped kitchen, and a generous balcony overlooking the valley — ideal for families or two couples.',
        maxAdults: 4,
        maxChildren: 2,
        size: 44,
        bedrooms: 1,
        view: 'Valley & mountain view',
        basePrice: 180,
        cleaningFee: 85,
        sortOrder: 2,
        amenities: [
            'Mountain view', 'Free WiFi', 'Fully equipped kitchen',
            'Smart TV', 'Dishwasher', 'Washing machine', 'Balcony',
            'Underfloor heating', 'Baby cot available', 'Parking included',
        ],
        images: [
            { imageUrl: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=1200', altText: 'Apartment Alpenglow — living room' },
            { imageUrl: 'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=1200', altText: 'Apartment Alpenglow — bedroom' },
        ],
    },
    {
        name: 'Suite Panorama',
        slug: 'suite-panorama',
        description: 'Our largest unit — a 2-bedroom suite for up to 6 guests with a wrap-around balcony and 180° mountain panorama. Perfect for families or groups wanting the best of alpine living.',
        maxAdults: 6,
        maxChildren: 2,
        size: 64,
        bedrooms: 2,
        view: '180° mountain panorama',
        basePrice: 240,
        cleaningFee: 85,
        sortOrder: 3,
        amenities: [
            '180° mountain view', 'Free WiFi', 'Fully equipped kitchen',
            'Smart TV', 'Dishwasher', 'Washing machine', 'Wrap-around balcony',
            'Underfloor heating', 'Sauna', 'Parking included',
        ],
        images: [
            { imageUrl: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=1200', altText: 'Suite Panorama — living area' },
            { imageUrl: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=1200', altText: 'Suite Panorama — view from balcony' },
        ],
    },
]

async function main() {
    console.log('🌱 Seeding demo property: alpine-retreat...')

    // Idempotent — skip if already exists
    const existing = await prisma.hotel.findUnique({ where: { slug: SLUG } })
    if (existing) {
        console.log(`✅ Demo property "${SLUG}" already exists (id: ${existing.id}). Skipping.`)
        return
    }

    const hotel = await prisma.hotel.create({
        data: {
            name: 'Alpine Retreat',
            slug: SLUG,
            email: 'hello@alpine-retreat.com',
            phone: '+1 (555) 000-0000',
            plan: 'pro',
            subscriptionStatus: 'active',
            isActive: true,
            settings: {
                create: {
                    showPrices: true,
                    showAmenities: true,
                    enableImageSlider: true,
                    enableLightbox: true,
                    showExtrasStep: false,
                    showPhoneField: true,
                    showMessageField: true,
                },
            },
            apartments: {
                create: APARTMENTS.map((apt) => ({
                    name: apt.name,
                    slug: apt.slug,
                    description: apt.description,
                    maxAdults: apt.maxAdults,
                    maxChildren: apt.maxChildren,
                    size: apt.size,
                    bedrooms: apt.bedrooms,
                    view: apt.view,
                    basePrice: apt.basePrice,
                    cleaningFee: apt.cleaningFee,
                    sortOrder: apt.sortOrder,
                    amenities: apt.amenities,
                    isActive: true,
                    images: {
                        create: apt.images,
                    },
                })),
            },
        },
    })

    console.log(`✅ Created hotel "${hotel.name}" (slug: ${hotel.slug}, id: ${hotel.id})`)
    console.log(`   → ${APARTMENTS.length} apartments seeded`)
    console.log(`   → Widget URL: /widget.html?hotel=${SLUG}`)
    console.log(`   → Demo page: /v3/demo?hotel=${SLUG}`)
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e)
        process.exit(1)
    })
    .finally(() => prisma.$disconnect())

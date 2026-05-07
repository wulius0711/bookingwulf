import { prisma } from '@/src/lib/prisma';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ token: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { token } = await params;

  if (!token || token.length !== 36) {
    return NextResponse.json({ error: 'Ungültiger Token' }, { status: 400 });
  }

  const request = await prisma.request.findUnique({
    where: { checkinToken: token },
    select: {
      id: true,
      arrival: true,
      departure: true,
      nights: true,
      adults: true,
      children: true,
      salutation: true,
      firstname: true,
      lastname: true,
      status: true,
      paymentMethod: true,
      pricingJson: true,
      extrasJson: true,
      nukiCode: true,
      checkinCompletedAt: true,
      checkinArrivalTime: true,
      checkoutRequestedAt: true,
      language: true,
      selectedApartmentIds: true,
      hotelId: true,
      messages: {
        orderBy: { createdAt: 'asc' },
        select: { id: true, sender: true, body: true, createdAt: true },
      },
    },
  });

  if (!request) {
    return NextResponse.json({ error: 'Buchung nicht gefunden' }, { status: 404 });
  }

  const [hotel, apartments, extras, thingsToSee] = await Promise.all([
    prisma.hotel.findUnique({
      where: { id: request.hotelId! },
      select: {
        name: true,
        email: true,
        phone: true,
        accentColor: true,
        settings: {
          select: {
            address: true,
            whatsappNumber: true,
            checkoutTime: true,
            preArrivalEnabled: true,
            reviewRequestLink: true,
            wifiSsid: true,
            wifiPassword: true,
            parkingInfo: true,
            wasteInfo: true,
            houseRules: true,
            emergencyJson: true,
          },
        },
      },
    }),
    prisma.apartment.findMany({
      where: {
        id: { in: request.selectedApartmentIds.split(',').map(Number).filter(Boolean) },
      },
      select: {
        id: true,
        name: true,
        images: { take: 1, orderBy: { id: 'asc' }, select: { imageUrl: true, altText: true } },
      },
    }),
    prisma.hotelExtra.findMany({
      where: {
        hotelId: request.hotelId!,
        isActive: true,
        OR: [{ showInWidget: true }, { showInUpsell: true }],
      },
      select: {
        id: true,
        name: true,
        key: true,
        type: true,
        billingType: true,
        price: true,
        imageUrl: true,
        description: true,
        linkUrl: true,
        exclusiveGroup: true,
      },
      orderBy: { sortOrder: 'asc' },
    }),
    prisma.thingsToSee.findMany({
      where: { hotelId: request.hotelId!, isActive: true },
      select: { id: true, category: true, title: true, description: true, address: true, mapsUrl: true, imageUrl: true },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    }),
  ]);

  const bookedExtraKeys: string[] = Array.isArray(request.extrasJson)
    ? (request.extrasJson as { key: string }[]).map((e) => e.key)
    : [];

  return NextResponse.json({
    booking: {
      id: request.id,
      arrival: request.arrival,
      departure: request.departure,
      nights: request.nights,
      adults: request.adults,
      children: request.children,
      salutation: request.salutation,
      firstname: request.firstname,
      lastname: request.lastname,
      status: request.status,
      paymentMethod: request.paymentMethod,
      pricingJson: request.pricingJson,
      extrasJson: request.extrasJson,
      nukiCode: request.nukiCode,
      checkinCompleted: !!request.checkinCompletedAt,
      checkinArrivalTime: request.checkinArrivalTime,
      checkoutRequested: !!request.checkoutRequestedAt,
      language: request.language,
    },
    hotel: {
      name: hotel?.name ?? '',
      email: hotel?.email ?? null,
      phone: hotel?.phone ?? null,
      accentColor: hotel?.accentColor ?? '#111827',
      address: hotel?.settings?.address ?? null,
      whatsappNumber: hotel?.settings?.whatsappNumber ?? null,
      checkoutTime: hotel?.settings?.checkoutTime ?? null,
      preArrivalEnabled: hotel?.settings?.preArrivalEnabled ?? false,
      reviewRequestLink: hotel?.settings?.reviewRequestLink ?? null,
      wifiSsid: hotel?.settings?.wifiSsid ?? null,
      wifiPassword: hotel?.settings?.wifiPassword ?? null,
      parkingInfo: hotel?.settings?.parkingInfo ?? null,
      wasteInfo: hotel?.settings?.wasteInfo ?? null,
      houseRules: hotel?.settings?.houseRules ?? null,
      emergencyNumbers: Array.isArray(hotel?.settings?.emergencyJson) ? hotel.settings.emergencyJson : [],
    },
    apartments,
    allExtras: extras.map((e) => ({ ...e, price: Number(e.price) })),
    serverBookedExtraIds: extras.filter((e) => bookedExtraKeys.includes(e.key)).map((e) => e.id),
    messages: request.messages,
    thingsToSee,
    token,
  });
}

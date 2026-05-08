import { prisma } from '@/src/lib/prisma';
import { notFound } from 'next/navigation';
import GuestPortal from './GuestPortal';

type Props = { params: Promise<{ token: string }> };

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: Props) {
  const { token } = await params;
  const request = await prisma.request.findUnique({
    where: { checkinToken: token },
    select: { hotel: { select: { name: true } } },
  });
  return {
    title: request?.hotel?.name ? `Meine Buchung — ${request.hotel.name}` : 'Meine Buchung',
  };
}

export default async function GastPage({ params }: Props) {
  const { token } = await params;

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

  if (!request) notFound();

  const apartmentIds = request.selectedApartmentIds
    .split(',')
    .map(Number)
    .filter(Boolean);

  const [hotel, apartments, extras, thingsToSee, checkinImages] = await Promise.all([
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
            checkinTime: true,
            checkinInfo: true,
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
      where: { id: { in: apartmentIds } },
      select: {
        id: true,
        name: true,
        images: { take: 1, orderBy: { id: 'asc' }, select: { imageUrl: true, altText: true } },
        gpCheckinTime: true, gpCheckinInfo: true, gpCheckoutTime: true,
        gpWifiSsid: true, gpWifiPassword: true, gpParkingInfo: true,
        gpWasteInfo: true, gpHouseRules: true, gpEmergencyJson: true,
      },
    }),
    prisma.hotelExtra.findMany({
      where: { hotelId: request.hotelId!, isActive: true },
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
      where: {
        hotelId: request.hotelId!,
        isActive: true,
        OR: [
          { apartmentId: null },
          { apartmentId: { in: apartmentIds } },
        ],
      },
      select: { id: true, category: true, title: true, description: true, address: true, mapsUrl: true, imageUrl: true },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    }),
    prisma.checkinImage.findMany({
      where: {
        hotelId: request.hotelId!,
        OR: [
          { apartmentId: null },
          { apartmentId: { in: apartmentIds } },
        ],
      },
      select: { id: true, imageUrl: true, caption: true, sortOrder: true },
      orderBy: { sortOrder: 'asc' },
    }),
  ]);

  // Apartment-Overrides: erstes Apartment gewinnt (bei Mehrfachbuchung)
  const apt = apartments[0];

  const bookedExtraKeys: string[] = Array.isArray(request.extrasJson)
    ? (request.extrasJson as { key: string }[]).map((e) => e.key)
    : [];
  const allExtras = extras.map((e) => ({ ...e, price: Number(e.price) }));
  const serverBookedExtraIds = extras.filter((e) => bookedExtraKeys.includes(e.key)).map((e) => e.id);

  return (
    <GuestPortal
      token={token}
      booking={{
        id: request.id,
        arrival: request.arrival.toISOString(),
        departure: request.departure.toISOString(),
        nights: request.nights,
        adults: request.adults,
        children: request.children,
        salutation: request.salutation,
        firstname: request.firstname,
        lastname: request.lastname,
        status: request.status,
        paymentMethod: request.paymentMethod,
        pricingJson: request.pricingJson as Record<string, unknown> | null,
        extrasJson: request.extrasJson as unknown[] | null,
        nukiCode: request.nukiCode,
        checkinCompleted: !!request.checkinCompletedAt,
        checkinArrivalTime: request.checkinArrivalTime,
        checkoutRequested: !!request.checkoutRequestedAt,
        language: request.language,
      }}
      hotel={{
        name: hotel?.name ?? '',
        email: hotel?.email ?? null,
        phone: hotel?.phone ?? null,
        accentColor: hotel?.accentColor ?? '#111827',
        address: hotel?.settings?.address ?? null,
        whatsappNumber: hotel?.settings?.whatsappNumber ?? null,
        checkinTime: apt?.gpCheckinTime ?? hotel?.settings?.checkinTime ?? null,
        checkinInfo: apt?.gpCheckinInfo ?? hotel?.settings?.checkinInfo ?? null,
        checkoutTime: apt?.gpCheckoutTime ?? hotel?.settings?.checkoutTime ?? null,
        preArrivalEnabled: hotel?.settings?.preArrivalEnabled ?? false,
        reviewRequestLink: hotel?.settings?.reviewRequestLink ?? null,
        wifiSsid: apt?.gpWifiSsid ?? hotel?.settings?.wifiSsid ?? null,
        wifiPassword: apt?.gpWifiPassword ?? hotel?.settings?.wifiPassword ?? null,
        parkingInfo: apt?.gpParkingInfo ?? hotel?.settings?.parkingInfo ?? null,
        wasteInfo: apt?.gpWasteInfo ?? hotel?.settings?.wasteInfo ?? null,
        houseRules: apt?.gpHouseRules ?? hotel?.settings?.houseRules ?? null,
        emergencyNumbers: Array.isArray(apt?.gpEmergencyJson)
          ? (apt.gpEmergencyJson as {label:string;number:string}[])
          : Array.isArray(hotel?.settings?.emergencyJson)
            ? (hotel!.settings!.emergencyJson as {label:string;number:string}[])
            : [],
      }}
      apartments={apartments.map((a) => ({
        id: a.id,
        name: a.name,
        imageUrl: a.images[0]?.imageUrl ?? null,
        imageAlt: a.images[0]?.altText ?? a.name,
      }))}
      allExtras={allExtras}
      serverBookedExtraIds={serverBookedExtraIds}
      thingsToSee={thingsToSee}
      checkinImages={checkinImages}
      initialMessages={request.messages.map((m) => ({
        id: m.id,
        sender: m.sender,
        body: m.body,
        createdAt: m.createdAt.toISOString(),
      }))}
    />
  );
}

import { prisma } from '@/src/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const hotelSlug = searchParams.get('hotel');

    if (!hotelSlug) {
      return Response.json(
        { success: false, message: 'Hotel fehlt.' },
        { status: 400 },
      );
    }

    const hotel = await prisma.hotel.findUnique({
      where: { slug: hotelSlug },
      select: {
        id: true,
        name: true,
      },
    });

    if (!hotel) {
      return Response.json(
        { success: false, message: 'Hotel nicht gefunden.' },
        { status: 404 },
      );
    }

    const settings = await prisma.hotelSettings.findFirst({
      where: { hotelId: hotel.id },
    });

    return Response.json({
      success: true,
      hotel: {
        id: hotel.id,
        name: hotel.name,
      },
      settings: settings || {},
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      { success: false, message: 'Fehler beim Laden der Settings.' },
      { status: 500 },
    );
  }
}

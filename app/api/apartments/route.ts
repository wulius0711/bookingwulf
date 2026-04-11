import { prisma } from '@/src/lib/prisma';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: corsHeaders,
  });
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const hotelSlug = searchParams.get('hotel');

    if (!hotelSlug) {
      return Response.json(
        { success: false, message: 'Hotel-Slug fehlt.' },
        { status: 400, headers: corsHeaders },
      );
    }

    const hotel = await prisma.hotel.findUnique({
      where: { slug: hotelSlug },
      select: { id: true },
    });

    if (!hotel) {
      return Response.json(
        { success: false, message: 'Hotel nicht gefunden.' },
        { status: 404, headers: corsHeaders },
      );
    }

    const apartments = await prisma.apartment.findMany({
      where: {
        hotelId: hotel.id,
        isActive: true,
      },
      select: {
        id: true,
        hotelId: true,
        name: true,
        slug: true,
        description: true,
        maxAdults: true,
        maxChildren: true,
        bedrooms: true,
        size: true,
        view: true,
        amenities: true,
        basePrice: true,
        cleaningFee: true,
        images: {
          orderBy: {
            sortOrder: 'asc',
          },
          select: {
            id: true,
            imageUrl: true,
            altText: true,
            sortOrder: true,
          },
        },
      },
      orderBy: {
        sortOrder: 'asc',
      },
    });

    return Response.json(apartments, {
      headers: corsHeaders,
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      { success: false, message: 'Apartments konnten nicht geladen werden.' },
      {
        status: 500,
        headers: corsHeaders,
      },
    );
  }
}

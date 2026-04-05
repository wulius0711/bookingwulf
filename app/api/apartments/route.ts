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

export async function GET() {
  try {
    const apartments = await prisma.apartment.findMany({
      where: {
        isActive: true,
      },
      include: {
        images: {
          orderBy: {
            sortOrder: 'asc',
          },
        },
      },
      orderBy: {
        sortOrder: 'asc',
      },
    });

    const apartments = await prisma.apartment.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        maxAdults: true,
        maxChildren: true,
        bedrooms: true,
        size: true,
        view: true,
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

    return Response.json(formattedApartments, {
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

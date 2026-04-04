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

    const formattedApartments = apartments.map((apartment) => ({
      id: apartment.id,
      name: apartment.name,
      slug: apartment.slug,
      description: apartment.description,
      basePrice: apartment.basePrice,
      cleaningFee: apartment.cleaningFee,
      maxAdults: apartment.maxAdults,
      maxChildren: apartment.maxChildren,
      isActive: apartment.isActive,
      sortOrder: apartment.sortOrder,
      images: apartment.images,
    }));

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

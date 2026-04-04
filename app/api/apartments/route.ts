import { prisma } from '@/src/lib/prisma';

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
      maxAdults: apartment.maxAdults,
      maxChildren: apartment.maxChildren,
      isActive: apartment.isActive,
      sortOrder: apartment.sortOrder,
      images: apartment.images,
    }));

    return Response.json(formattedApartments);
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: 'Failed to load apartments' },
      { status: 500 },
    );
  }
}

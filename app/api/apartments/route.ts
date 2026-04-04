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

    return Response.json(apartments, {
      headers: corsHeaders,
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      { success: false, message: 'Apartments konnten nicht geladen werden.' },
      { status: 500, headers: corsHeaders },
    );
  }
}

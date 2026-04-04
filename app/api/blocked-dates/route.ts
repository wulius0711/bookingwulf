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
    const blockedRanges = await prisma.blockedRange.findMany({
      include: {
        apartment: true,
      },
      orderBy: {
        startDate: 'asc',
      },
    });

    const formatted = blockedRanges.map((item) => ({
      id: item.id,
      apartmentId: item.apartmentId,
      apartmentName: item.apartment?.name || '',
      startDate: item.startDate,
      endDate: item.endDate,
      type: item.type,
      note: item.note,
    }));

    return Response.json(formatted, {
      headers: corsHeaders,
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        success: false,
        message: 'Blocked dates konnten nicht geladen werden.',
      },
      { status: 500, headers: corsHeaders },
    );
  }
}

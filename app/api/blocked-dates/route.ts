import { prisma } from '@/src/lib/prisma';
import { rateLimit, rateLimitResponse } from '@/src/lib/rate-limit';

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
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
  if (!(await rateLimit(`blocked-dates:${ip}`, 30, 60_000)).ok) return rateLimitResponse();

  try {
    const blockedRanges = await prisma.blockedRange.findMany({
      select: {
        id: true,
        apartmentId: true,
        startDate: true,
        endDate: true,
        type: true,
        note: true,
        apartment: { select: { name: true } },
      },
      orderBy: { startDate: 'asc' },
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

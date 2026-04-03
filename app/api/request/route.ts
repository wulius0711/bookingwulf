import { prisma } from '@/src/lib/prisma';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: corsHeaders,
  });
}

export async function POST(req: Request) {
  try {
    const data = await req.json();

    const result = await prisma.request.create({
      data: {
        arrival: new Date(data.arrival),
        departure: new Date(data.departure),
        nights: Number(data.nights),
        adults: Number(data.adults),
        children: Number(data.children || 0),
        selectedApartmentIds: data.selected_apartments || '',
        salutation: data.salutation,
        lastname: data.lastname,
        email: data.email,
        country: data.country,
        message: data.message || null,
        newsletter: Boolean(data.newsletter),
      },
    });

    return Response.json(
      { success: true, result },
      {
        headers: corsHeaders,
      },
    );
  } catch (error) {
    console.error(error);

    return Response.json(
      { success: false, error: 'Server error' },
      {
        status: 500,
        headers: corsHeaders,
      },
    );
  }
}

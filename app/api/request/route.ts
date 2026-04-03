import { prisma } from '@/src/lib/prisma';

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

    return Response.json({ success: true, result });
  } catch (error) {
    console.error(error);
    return Response.json({ success: false }, { status: 500 });
  }
}

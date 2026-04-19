import { NextRequest, NextResponse } from 'next/server';
import { decrypt, createSession } from '@/src/lib/session';
import { prisma } from '@/src/lib/prisma';
import { cookies } from 'next/headers';
import { switchHotelSchema } from '@/src/lib/schemas';

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_session')?.value;
  const session = await decrypt(token);

  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const parsed = switchHotelSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: 'Invalid hotelId' }, { status: 400 });
  const { hotelId } = parsed.data;

  // Verify user has access to this hotel
  const entry = await prisma.adminUserHotel.findUnique({
    where: { userId_hotelId: { userId: session.userId, hotelId } },
  });
  if (!entry) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  await createSession({ ...session, hotelId });

  return NextResponse.json({ ok: true });
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { encrypt } from '@/src/lib/session-crypto';

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');

  if (!token) {
    return NextResponse.redirect(new URL('/register?error=invalid_token', req.url));
  }

  const user = await prisma.adminUser.findUnique({
    where: { emailVerifyToken: token },
    include: {
      userHotels: { orderBy: { hotelId: 'asc' }, take: 1 },
    },
  });

  if (!user) {
    return NextResponse.redirect(new URL('/register?error=invalid_token', req.url));
  }

  if (user.emailVerifyTokenExpiresAt && new Date() > user.emailVerifyTokenExpiresAt) {
    return NextResponse.redirect(new URL('/register?error=token_expired', req.url));
  }

  await prisma.adminUser.update({
    where: { id: user.id },
    data: {
      isEmailVerified: true,
      emailVerifyToken: null,
      emailVerifyTokenExpiresAt: null,
    },
  });

  const primaryHotelId = user.userHotels[0]?.hotelId ?? user.hotelId ?? null;
  const token = await encrypt({
    userId: user.id,
    email: user.email,
    role: user.role,
    hotelId: primaryHotelId,
    sessionVersion: user.sessionVersion,
  });

  const response = NextResponse.redirect(new URL('/admin/onboarding', req.url));
  response.cookies.set('admin_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    sameSite: 'lax',
    path: '/',
  });
  return response;
}

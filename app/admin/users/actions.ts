'use server';

import { prisma } from '@/src/lib/prisma';
import { hashPassword } from '@/src/lib/password';
import { verifySession } from '@/src/lib/session';
import { redirect } from 'next/navigation';
import { canAddUser, canAddHotelToUser } from '@/src/lib/plan-gates';

export type CreateUserState = { error?: string } | undefined;

export async function createAdminUser(
  _state: CreateUserState,
  formData: FormData,
): Promise<CreateUserState> {
  const session = await verifySession();
  if (session.role !== 'super_admin') return { error: 'Zugriff verweigert.' };

  const email = formData.get('email')?.toString().trim().toLowerCase();
  const password = formData.get('password')?.toString();
  const confirm = formData.get('confirm')?.toString();
  const role = formData.get('role')?.toString() || 'hotel_admin';
  const hotelIdRaw = formData.get('hotelId')?.toString().trim();
  const hotelId = hotelIdRaw ? Number(hotelIdRaw) : null;

  if (!email || !password || !confirm) {
    return { error: 'Alle Felder sind erforderlich.' };
  }
  if (password.length < 8) {
    return { error: 'Passwort muss mindestens 8 Zeichen lang sein.' };
  }
  if (password !== confirm) {
    return { error: 'Passwörter stimmen nicht überein.' };
  }
  if (role === 'hotel_admin' && !hotelId) {
    return { error: 'Bitte ein Hotel auswählen.' };
  }

  const existing = await prisma.adminUser.findUnique({ where: { email } });
  if (existing) {
    return { error: 'Diese E-Mail-Adresse wird bereits verwendet.' };
  }

  if (role === 'hotel_admin' && hotelId) {
    const hotel = await prisma.hotel.findUnique({
      where: { id: hotelId },
      select: { plan: true, _count: { select: { adminUsers: true } } },
    });
    if (hotel && !canAddUser(hotel.plan, hotel._count.adminUsers)) {
      return { error: `User-Limit für Plan "${hotel.plan}" erreicht. Bitte upgraden.` };
    }
  }

  const passwordHash = await hashPassword(password);

  const newUser = await prisma.adminUser.create({
    data: {
      email,
      passwordHash,
      role,
      hotelId: role === 'hotel_admin' ? hotelId : null,
    },
  });

  // Populate join table so multi-hotel switcher works
  if (role === 'hotel_admin' && hotelId) {
    await prisma.adminUserHotel.create({ data: { userId: newUser.id, hotelId } });
  }

  redirect('/admin/users');
}

export type AssignHotelState = { error?: string } | undefined;

export async function assignHotel(_state: AssignHotelState, formData: FormData): Promise<AssignHotelState> {
  const session = await verifySession();
  if (session.role !== 'super_admin') return { error: 'Zugriff verweigert.' };

  const userId = Number(formData.get('userId'));
  const hotelId = Number(formData.get('hotelId'));
  if (!userId || !hotelId) return { error: 'Ungültige Eingabe.' };

  const hotel = await prisma.hotel.findUnique({ where: { id: hotelId }, select: { plan: true } });
  if (!hotel) return { error: 'Hotel nicht gefunden.' };

  const currentCount = await prisma.adminUserHotel.count({ where: { userId } });
  if (!canAddHotelToUser(hotel.plan, currentCount)) {
    return { error: 'Hotel-Limit erreicht. Business-Plan erlaubt max. 2 Anlagen.' };
  }

  await prisma.adminUserHotel.upsert({
    where: { userId_hotelId: { userId, hotelId } },
    create: { userId, hotelId },
    update: {},
  });

  redirect(`/admin/users/${userId}`);
}

export async function unassignHotel(formData: FormData): Promise<void> {
  const session = await verifySession();
  if (session.role !== 'super_admin') return;

  const userId = Number(formData.get('userId'));
  const hotelId = Number(formData.get('hotelId'));
  if (!userId || !hotelId) return;

  await prisma.adminUserHotel.deleteMany({ where: { userId, hotelId } });

  redirect(`/admin/users/${userId}`);
}

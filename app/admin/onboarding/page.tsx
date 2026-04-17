import { cookies } from 'next/headers';
import { decrypt } from '@/src/lib/session';
import { redirect } from 'next/navigation';
import { prisma } from '@/src/lib/prisma';
import OnboardingSteps from './OnboardingSteps';

export const dynamic = 'force-dynamic';

export default async function OnboardingPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_session')?.value;
  const session = await decrypt(token);

  if (!session) redirect('/admin/login');

  const hotel = session.hotelId
    ? await prisma.hotel.findUnique({
        where: { id: session.hotelId },
        select: {
          id: true,
          name: true,
          slug: true,
          _count: { select: { apartments: true } },
        },
      })
    : null;

  const hasApartments = (hotel?._count?.apartments ?? 0) > 0;

  return (
    <OnboardingSteps
      hotelName={hotel?.name || ''}
      hotelSlug={hotel?.slug || ''}
      hasApartments={hasApartments}
    />
  );
}

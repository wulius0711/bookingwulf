import { cookies } from 'next/headers'
import { decrypt } from '@/src/lib/session'
import { redirect } from 'next/navigation'
import { prisma } from '@/src/lib/prisma'

export default async function LoginLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const token = cookieStore.get('admin_session')?.value
  const session = await decrypt(token)

  if (!session) return <>{children}</>

  // Super admins go straight to dashboard
  if (session.role === 'super_admin') redirect('/admin')

  // Check subscription status — only active subscribers reach the dashboard
  if (session.hotelId) {
    const hotel = await prisma.hotel.findUnique({
      where: { id: session.hotelId },
      select: { subscriptionStatus: true },
    })

    if (hotel?.subscriptionStatus === 'active') {
      redirect('/admin')
    }
  }

  // Trial, inactive, or no hotel → billing page
  redirect('/admin/billing')
}

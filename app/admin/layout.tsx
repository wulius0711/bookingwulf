import { cookies, headers } from 'next/headers'
import { decrypt } from '@/src/lib/session'
import { prisma } from '@/src/lib/prisma'
import { redirect } from 'next/navigation'
import { hasPlanAccess, NAV_PLAN_GATES, PLAN_LABEL } from '@/src/lib/plan-gates'
import { PlanKey } from '@/src/lib/plans'
import Sidebar from './components/Sidebar'
import GuidedTour from './components/GuidedTour'
import AdminChatWidget from './components/AdminChatWidget'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const token = cookieStore.get('admin_session')?.value
  const session = await decrypt(token)

  if (!session) return <>{children}</>

  const headerStore = await headers()
  const currentPath = headerStore.get('x-pathname') || ''

  let hotelPlan: PlanKey = 'starter'
  if (session.role !== 'super_admin' && session.hotelId) {
    const hotel = await prisma.hotel.findUnique({
      where: { id: session.hotelId },
      select: { subscriptionStatus: true, trialEndsAt: true, plan: true },
    })

    hotelPlan = (hotel?.plan as PlanKey) ?? 'starter'
    let status = hotel?.subscriptionStatus ?? 'inactive'

    if (status === 'trialing' && hotel?.trialEndsAt && new Date() > hotel.trialEndsAt) {
      await prisma.hotel.update({
        where: { id: session.hotelId },
        data: { subscriptionStatus: 'inactive' },
      })
      status = 'inactive'
    }

    const isExempt = !currentPath || currentPath.includes('/billing') || currentPath.includes('/login') || currentPath.includes('/setup')
    if (!isExempt && status !== 'active' && status !== 'trialing') {
      redirect('/admin/billing')
    }
  }

  const isSuperAdmin = session.role === 'super_admin'

  const navGroupDefs = [
    { label: 'Betrieb', items: [
      { href: '/admin', label: 'Übersicht', icon: 'overview' },
      { href: '/admin/requests', label: 'Anfragen', icon: 'requests' },
      { href: '/admin/calendar', label: 'Kalender', icon: 'calendar' },
      { href: '/admin/zimmerplan', label: 'Zimmerplan', icon: 'roomplan' },
      { href: '/admin/analytics', label: 'Analytics', icon: 'analytics' },
    ]},
    { label: 'Verwaltung', items: [
      { href: '/admin/apartments', label: 'Apartments', icon: 'apartments' },
      { href: '/admin/price-seasons', label: 'Preisanpassungen', icon: 'prices' },
      { href: '/admin/blocked-dates', label: 'Sperrzeiten', icon: 'blocked' },
      { href: '/admin/extras', label: 'Zusatzleistungen', icon: 'extras' },
    ]},
    { label: 'Konfiguration', items: [
      { href: '/admin/settings', label: 'Widget & Design', icon: 'settings' },
      { href: '/admin/email-templates', label: 'E-Mails', icon: 'emails' },
      { href: '/admin/nuki', label: 'Schlüsselloses Einchecken', icon: 'nuki' },
      { href: '/admin/beds24', label: 'Beds24 Channel Manager', icon: 'beds24' },
    ]},
    { label: 'Konto', items: [
      { href: '/admin/billing', label: 'Abonnement', icon: 'billing' },
      { href: '/admin/help', label: 'Handbuch', icon: 'help' },
      ...(isSuperAdmin ? [
        { href: '/admin/hotels', label: 'Hotels', icon: 'hotels' },
        { href: '/admin/users', label: 'Benutzer', icon: 'users' },
        { href: '/admin/outreach', label: 'Outreach', icon: 'outreach' },
        { href: '/admin/chat-analytics', label: 'Chat-Auswertung', icon: 'chat' },
      ] : []),
    ]},
  ]

  const navGroups = navGroupDefs.map(({ label, items }) => ({
    label,
    items: items.map(({ href, label, icon }) => {
      const minPlan = NAV_PLAN_GATES[href] as PlanKey | undefined
      const locked = !isSuperAdmin && !!minPlan && !hasPlanAccess(hotelPlan, minPlan)
      return { href, label, locked, upgradeLabel: minPlan ? PLAN_LABEL[minPlan] : undefined, icon }
    }),
  }))

  // Load accent color for chat widget
  let accentColor = '#111';
  if (session.hotelId) {
    const settings = await prisma.hotelSettings.findUnique({
      where: { hotelId: session.hotelId },
      select: { accentColor: true },
    });
    accentColor = settings?.accentColor || '#111';
  }

  // Load user's assigned hotels for the switcher
  const userHotels = session.role === 'super_admin'
    ? (await prisma.hotel.findMany({ select: { id: true, name: true }, orderBy: { id: 'asc' } }))
        .map((h) => ({ hotelId: h.id, hotel: { name: h.name } }))
    : await prisma.adminUserHotel.findMany({
        where: { userId: session.userId },
        select: { hotelId: true, hotel: { select: { name: true } } },
        orderBy: { hotelId: 'asc' },
      });

  return (
    <>
    <div
      className="admin-layout"
      style={{
        fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <Sidebar
        navGroups={navGroups}
        email={session.email}
        activeHotelId={session.hotelId}
        userHotels={userHotels.map((h) => ({ id: h.hotelId, name: h.hotel.name }))}
        isSuperAdmin={isSuperAdmin}
      />

      <div className="admin-main">
        <main style={{ minHeight: 'calc(100vh - 60px)' }}>{children}</main>
        <footer
          style={{
            padding: '16px 32px',
            display: 'flex',
            justifyContent: 'center',
            gap: 24,
            fontSize: 12,
            color: '#6b7280',
          }}
        >
          <a href="/impressum" target="_blank" rel="noopener noreferrer" style={{ color: '#6b7280', textDecoration: 'none' }}>Impressum</a>
          <a href="/datenschutz" target="_blank" rel="noopener noreferrer" style={{ color: '#6b7280', textDecoration: 'none' }}>Datenschutz</a>
          <a href="/agb" target="_blank" rel="noopener noreferrer" style={{ color: '#6b7280', textDecoration: 'none' }}>AGB</a>
          <a href="/avv" target="_blank" rel="noopener noreferrer" style={{ color: '#6b7280', textDecoration: 'none' }}>AVV</a>
          <a href="mailto:support@bookingwulf.com" style={{ color: '#6b7280', textDecoration: 'none' }}>Support</a>
        </footer>
      </div>

      <GuidedTour />
      <AdminChatWidget accentColor={accentColor} />
    </div>
    </>
  )
}

import { cookies, headers } from 'next/headers'
import { decrypt } from '@/src/lib/session'
import { logout } from './login/actions'
import { prisma } from '@/src/lib/prisma'
import { redirect } from 'next/navigation'
import { hasPlanAccess, NAV_PLAN_GATES, PLAN_LABEL } from '@/src/lib/plan-gates'
import { PlanKey } from '@/src/lib/plans'
import NavItem from './components/NavItem'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const token = cookieStore.get('admin_session')?.value
  const session = await decrypt(token)

  // Login- und Setup-Seiten haben kein Nav
  if (!session) return <>{children}</>

  // Get pathname (set by middleware for reliable path detection)
  const headerStore = await headers()
  const currentPath = headerStore.get('x-pathname') || ''

  // Fetch hotel for billing gate + plan gating
  let hotelPlan: PlanKey = 'starter'
  if (session.role !== 'super_admin' && session.hotelId) {
    const hotel = await prisma.hotel.findUnique({
      where: { id: session.hotelId },
      select: { subscriptionStatus: true, trialEndsAt: true, plan: true },
    })

    hotelPlan = (hotel?.plan as PlanKey) ?? 'starter'
    let status = hotel?.subscriptionStatus ?? 'inactive'

    // Auto-expire trial
    if (status === 'trialing' && hotel?.trialEndsAt && new Date() > hotel.trialEndsAt) {
      await prisma.hotel.update({
        where: { id: session.hotelId },
        data: { subscriptionStatus: 'inactive' },
      })
      status = 'inactive'
    }

    // Billing gate: redirect inactive/expired users (trial users can navigate freely)
    const isExempt = !currentPath || currentPath.includes('/billing') || currentPath.includes('/login') || currentPath.includes('/setup')
    if (!isExempt && status !== 'active' && status !== 'trialing') {
      redirect('/admin/billing')
    }
  }

  const isSuperAdmin = session.role === 'super_admin'

  const navItems = [
    { href: '/admin', label: 'Übersicht' },
    { href: '/admin/analytics', label: 'Analytics' },
    { href: '/admin/requests', label: 'Anfragen' },
    { href: '/admin/apartments', label: 'Apartments' },
    { href: '/admin/price-seasons', label: 'Preissaisons' },
    { href: '/admin/blocked-dates', label: 'Sperrzeiten' },
    { href: '/admin/extras', label: 'Zusatzleistungen' },
    { href: '/admin/settings', label: 'Einstellungen' },
    { href: '/admin/billing', label: 'Abonnement' },
    ...(isSuperAdmin
      ? [
          { href: '/admin/hotels', label: 'Hotels' },
          { href: '/admin/users', label: 'Benutzer' },
        ]
      : []),
  ]

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f5f5f7',
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      {/* Top Navigation */}
      <nav
        style={{
          background: '#ffffff',
          borderBottom: '1px solid #e5e5e5',
          padding: '0 32px',
          height: 56,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          <img src="/bookingwulf-logo.png" alt="bookingwulf" style={{ height: 22 }} />
          <div style={{ display: 'flex', gap: 4 }}>
            {navItems.map(({ href, label }) => {
              const minPlan = NAV_PLAN_GATES[href] as PlanKey | undefined
              const locked = !isSuperAdmin && !!minPlan && !hasPlanAccess(hotelPlan, minPlan)
              const active = href === '/admin'
                ? currentPath === '/admin'
                : currentPath.startsWith(href)
              return (
                <NavItem
                  key={href}
                  href={href}
                  label={label}
                  locked={locked}
                  active={active}
                  upgradeLabel={minPlan ? PLAN_LABEL[minPlan] : undefined}
                />
              )
            })}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 13, color: '#888' }}>{session.email}</span>
          <form action={logout}>
            <button
              type="submit"
              style={{
                padding: '6px 14px',
                borderRadius: 6,
                border: '1px solid #ddd',
                background: 'transparent',
                fontSize: 13,
                color: '#444',
                cursor: 'pointer',
              }}
            >
              Abmelden
            </button>
          </form>
        </div>
      </nav>

      <main>{children}</main>

      <footer
        style={{
          padding: '20px 32px',
          display: 'flex',
          justifyContent: 'center',
          gap: 24,
          fontSize: 12,
          color: '#9ca3af',
        }}
      >
        {process.env.LEGAL_IMPRINT_URL && <a href={process.env.LEGAL_IMPRINT_URL} target="_blank" rel="noopener noreferrer" style={{ color: '#9ca3af', textDecoration: 'none' }}>Impressum</a>}
        {process.env.LEGAL_PRIVACY_URL && <a href={process.env.LEGAL_PRIVACY_URL} target="_blank" rel="noopener noreferrer" style={{ color: '#9ca3af', textDecoration: 'none' }}>Datenschutz</a>}
        {process.env.LEGAL_TERMS_URL && <a href={process.env.LEGAL_TERMS_URL} target="_blank" rel="noopener noreferrer" style={{ color: '#9ca3af', textDecoration: 'none' }}>AGB</a>}
      </footer>
    </div>
  )
}

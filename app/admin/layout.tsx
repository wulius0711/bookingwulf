import { cookies } from 'next/headers'
import { decrypt } from '@/src/lib/session'
import { logout } from './login/actions'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const token = cookieStore.get('admin_session')?.value
  const session = await decrypt(token)

  // Login- und Setup-Seiten haben kein Nav
  if (!session) return <>{children}</>

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
          <span style={{ fontWeight: 700, fontSize: 15, color: '#111' }}>Admin</span>
          <div style={{ display: 'flex', gap: 4 }}>
            {[
              { href: '/admin', label: 'Übersicht' },
              { href: '/admin/requests', label: 'Anfragen' },
              { href: '/admin/apartments', label: 'Apartments' },
              { href: '/admin/price-seasons', label: 'Preissaisons' },
              { href: '/admin/blocked-dates', label: 'Sperrzeiten' },
              { href: '/admin/settings', label: 'Einstellungen' },
              ...(session.role === 'super_admin'
                ? [{ href: '/admin/users', label: 'Benutzer' }]
                : []),
            ].map(({ href, label }) => (
              <a
                key={href}
                href={href}
                style={{
                  padding: '6px 12px',
                  borderRadius: 6,
                  fontSize: 13,
                  fontWeight: 500,
                  color: '#444',
                  textDecoration: 'none',
                }}
              >
                {label}
              </a>
            ))}
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
    </div>
  )
}

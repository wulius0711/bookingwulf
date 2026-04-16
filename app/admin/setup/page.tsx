import { redirect } from 'next/navigation'
import { prisma } from '@/src/lib/prisma'
import SetupForm from './setup-form'

export const dynamic = 'force-dynamic'

export default async function SetupPage() {
  const count = await prisma.adminUser.count()
  if (count > 0) redirect('/admin/login')

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f5f5f7',
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: 16,
          padding: '40px 48px',
          width: '100%',
          maxWidth: 420,
          boxShadow: '0 2px 24px rgba(0,0,0,0.08)',
        }}
      >
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8, color: '#111' }}>
          Ersteinrichtung
        </h1>
        <p style={{ fontSize: 14, color: '#666', marginBottom: 28 }}>
          Erstelle deinen ersten Admin-Account. Diese Seite ist danach nicht mehr zugänglich.
        </p>
        <SetupForm />
      </div>
    </div>
  )
}

import { prisma } from '@/src/lib/prisma';
import { deleteAccount } from './actions';

export const metadata = { title: 'Konto löschen — bookingwulf' };

export default async function DeleteAccountPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; deleted?: string; error?: string }>;
}) {
  const { token, deleted, error } = await searchParams;

  if (deleted === '1') {
    return <Layout><SuccessCard /></Layout>;
  }

  if (error === 'invalid' || !token) {
    return <Layout><ErrorCard /></Layout>;
  }

  const hotel = await prisma.hotel.findFirst({
    where: {
      deletionToken: token,
      deletionTokenExpiresAt: { gt: new Date() },
      subscriptionStatus: 'inactive',
    },
    select: { name: true },
  });

  if (!hotel) {
    return <Layout><ErrorCard /></Layout>;
  }

  return (
    <Layout>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🗑️</div>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 8px', color: '#111' }}>Konto löschen</h1>
        <p style={{ fontSize: 15, color: '#6b7280', margin: 0, lineHeight: 1.6 }}>
          Du bist dabei, das Konto für <strong style={{ color: '#111' }}>{hotel.name}</strong> und alle
          damit verbundenen Daten unwiderruflich zu löschen.
        </p>
      </div>

      <div style={{ padding: '14px 18px', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 10, marginBottom: 24, fontSize: 14, color: '#9a3412', lineHeight: 1.6 }}>
        ⚠️ Diese Aktion kann nicht rückgängig gemacht werden. Alle Buchungen, Apartments, Einstellungen und Nutzerdaten werden gelöscht.
      </div>

      <form action={deleteAccount} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <input type="hidden" name="token" value={token} />
        <button
          type="submit"
          style={{
            padding: '13px 24px', background: '#dc2626', color: '#fff',
            border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 600,
            cursor: 'pointer', width: '100%',
          }}
        >
          Ja, Konto und alle Daten löschen
        </button>
        <a
          href="/admin/login"
          style={{
            padding: '13px 24px', background: '#f9fafb', color: '#374151',
            border: '1px solid #e5e7eb', borderRadius: 10, fontSize: 15, fontWeight: 500,
            textDecoration: 'none', textAlign: 'center', display: 'block',
          }}
        >
          Abbrechen — lieber einloggen
        </a>
      </form>
    </Layout>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24, background: '#f9fafb',
      fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, sans-serif',
    }}>
      <div style={{
        width: '100%', maxWidth: 460, background: '#fff',
        border: '1px solid #e5e7eb', borderRadius: 20, padding: '36px 32px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
      }}>
        {children}
      </div>
    </div>
  );
}

function SuccessCard() {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>✓</div>
      <h1 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 12px', color: '#111' }}>Konto gelöscht</h1>
      <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.6, margin: '0 0 24px' }}>
        Dein Konto und alle gespeicherten Daten wurden erfolgreich gelöscht.
        Danke, dass du bookingwulf ausprobiert hast.
      </p>
      <a
        href="/"
        style={{ fontSize: 14, color: '#6b7280', textDecoration: 'none' }}
      >
        Zur Startseite
      </a>
    </div>
  );
}

function ErrorCard() {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
      <h1 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 12px', color: '#111' }}>Link ungültig</h1>
      <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.6, margin: '0 0 24px' }}>
        Dieser Link ist abgelaufen oder ungültig. Falls du Hilfe brauchst, melde dich bei uns.
      </p>
      <a
        href="mailto:support@bookingwulf.com"
        style={{ fontSize: 14, color: '#111', fontWeight: 600, textDecoration: 'none' }}
      >
        support@bookingwulf.com
      </a>
    </div>
  );
}

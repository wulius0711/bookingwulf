import { verifySession } from '@/src/lib/session';
import { prisma } from '@/src/lib/prisma';
import { redirect } from 'next/navigation';
import { hasPlanAccess } from '@/src/lib/plan-gates';
import { getNukiLocks } from '@/src/lib/nuki';
import NukiClient from './NukiClient';

export const dynamic = 'force-dynamic';

export default async function NukiPage() {
  const session = await verifySession();
  const isSuperAdmin = session.role === 'super_admin';

  if (!session.hotelId) {
    if (isSuperAdmin) return (
      <main className="admin-page">
        <h1 style={{ margin: 0 }}>Schlüsselloses Einchecken</h1>
        <p className="page-subtitle">Bitte zuerst eine Anlage in der Sidebar auswählen.</p>
      </main>
    );
    redirect('/admin');
  }

  const hotel = await prisma.hotel.findUnique({
    where: { id: session.hotelId },
    select: { plan: true, nukiConfig: { select: { apiToken: true } } },
  });

  if (!hotel || (!isSuperAdmin && !hasPlanAccess(hotel.plan ?? 'starter', 'pro'))) {
    redirect('/admin/billing');
  }

  let connected = !!hotel.nukiConfig;
  let locks: { smartlockId: number; name: string }[] = [];
  let error: string | undefined;

  if (hotel.nukiConfig) {
    try {
      locks = await getNukiLocks(hotel.nukiConfig.apiToken);
    } catch {
      error = 'Verbindung zum Nuki-Konto fehlgeschlagen. Bitte Token prüfen.';
    }
  }

  return (
    <main className="admin-page w-sm">
      <div style={{ marginBottom: 4, display: 'flex', alignItems: 'center', gap: 10 }}>
        <h1 style={{ margin: 0 }}>Schlüsselloses Einchecken</h1>
        <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 99, background: '#f3e8ff', color: '#7c3aed' }}>Pro</span>
      </div>
      <p className="page-subtitle" style={{ marginBottom: 16 }}>
        Verbinden Sie Ihre Nuki-Schlösser. Bei Sofortbuchungen erhalten Gäste automatisch einen zeitlich begrenzten Zugangscode per E-Mail.
      </p>
      <div style={{ margin: '0 0 32px', padding: '12px 16px', background: 'var(--status-new-bg)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 13, color: 'var(--status-new-text)', lineHeight: 1.6 }}>
        Falls die Code-Generierung fehlschlägt (z.B. Netzwerkfehler), wird die Buchung trotzdem gespeichert und Sie erhalten automatisch eine E-Mail-Benachrichtigung, um den Zugang manuell bereitzustellen.
      </div>

      <NukiClient
        initialConnected={connected}
        initialLocks={locks}
        initialError={error}
      />
    </main>
  );
}

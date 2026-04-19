import { verifySession } from '@/src/lib/session';
import { prisma } from '@/src/lib/prisma';
import { redirect } from 'next/navigation';
import { hasPlanAccess } from '@/src/lib/plan-gates';
import { getNukiLocks } from '@/src/lib/nuki';
import NukiClient from './NukiClient';

export const dynamic = 'force-dynamic';

export default async function NukiPage() {
  const session = await verifySession();
  if (!session.hotelId) redirect('/admin');

  const hotel = await prisma.hotel.findUnique({
    where: { id: session.hotelId },
    select: { plan: true, nukiConfig: { select: { apiToken: true } } },
  });

  if (!hotel || !hasPlanAccess(hotel.plan ?? 'starter', 'pro')) {
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
    <main className="admin-page">
      <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
        <h1 style={{ margin: 0 }}>Schlüsselloses Einchecken</h1>
        <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 99, background: '#f3e8ff', color: '#7c3aed' }}>Pro</span>
      </div>
      <p style={{ margin: '0 0 32px', fontSize: 14, color: '#6b7280' }}>
        Verbinden Sie Ihre Nuki-Schlösser. Bei Sofortbuchungen erhalten Gäste automatisch einen zeitlich begrenzten Zugangscode per E-Mail.
      </p>

      <NukiClient
        initialConnected={connected}
        initialLocks={locks}
        initialError={error}
      />
    </main>
  );
}

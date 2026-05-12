import { prisma } from '@/src/lib/prisma';
import { verifySession } from '@/src/lib/session';
import { hasPlanAccess } from '@/src/lib/plan-gates';
import type { PlanKey } from '@/src/lib/plans';
import { updateExtra, toggleExtra, deleteExtra, toggleUpsellExtra, toggleWidgetExtra } from './actions';
import ExtraRow from './ExtraRow';
import CreateExtraForm from './CreateExtraForm';
import { EmptyState } from '../components/ui';

export const dynamic = 'force-dynamic';

export default async function ExtrasPage() {
  const session = await verifySession();
  const isSuperAdmin = session.hotelId === null;

  const selectedId = session.hotelId ?? undefined;

  const extras = selectedId
    ? await prisma.hotelExtra.findMany({ where: { hotelId: selectedId }, orderBy: [{ type: 'asc' }, { sortOrder: 'asc' }, { name: 'asc' }] })
    : [];

  const selectedHotel = selectedId
    ? await prisma.hotel.findUnique({ where: { id: selectedId }, select: { id: true, name: true } })
    : null;

  let hotelPlan: PlanKey = 'starter';
  if (!isSuperAdmin && selectedId) {
    const h = await prisma.hotel.findUnique({ where: { id: selectedId }, select: { plan: true } });
    hotelPlan = (h?.plan as PlanKey) ?? 'starter';
  }
  const canUseExtras = isSuperAdmin || hasPlanAccess(hotelPlan, 'pro');

  return (
    <main className="admin-page" style={{ maxWidth: 960, background: 'var(--page-bg)', minHeight: '100vh', fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif' }}>
      <div style={{ display: 'grid', gap: 24 }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 32, letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>Zusatzleistungen</h1>
            <p style={{ margin: '6px 0 0', fontSize: 14, color: 'var(--text-secondary)' }}>
              Extras und Versicherungsoptionen pro Hotel konfigurieren.
            </p>
          </div>
        </div>

        {!canUseExtras && (
          <div style={{ padding: '14px 18px', background: 'var(--status-pending-bg)', border: '1px solid var(--status-pending-text)', borderRadius: 12, fontSize: 14, color: 'var(--status-pending-text)', lineHeight: 1.5 }}>
            <strong>Hinweis:</strong> Im Starter-Plan werden nur Versicherungsoptionen im Widget angezeigt. Für reguläre Zusatzleistungen ist ein Upgrade auf den <strong>Pro-Plan</strong> erforderlich.
          </div>
        )}

        {selectedHotel && (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', background: 'var(--surface-2)' }}>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>
                {selectedHotel.name} — {extras.length} {extras.length === 1 ? 'Eintrag' : 'Einträge'}
              </h2>
            </div>

            {extras.length === 0 ? (
              <EmptyState
                title="Noch keine Zusatzleistungen angelegt."
                description="Nutze das Formular unten, um eine neue Zusatzleistung hinzuzufügen."
              />
            ) : (
              <div className="table-scroll">
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      {['Name', 'Typ', 'Abrechnung', 'Preis', 'Link', 'Status', 'Sichtbarkeit', ''].map((h) => (
                        <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {extras.map((extra) => (
                      <ExtraRow
                        key={extra.id}
                        extra={{ ...extra, price: Number(extra.price) }}
                        updateAction={updateExtra}
                        toggleAction={async (formData: FormData) => {
                          'use server';
                          const id = Number(formData.get('id'));
                          const isActive = formData.get('isActive') === 'true';
                          await toggleExtra(id, isActive);
                        }}
                        toggleWidgetAction={async (formData: FormData) => {
                          'use server';
                          const id = Number(formData.get('id'));
                          const showInWidget = formData.get('showInWidget') === 'true';
                          await toggleWidgetExtra(id, showInWidget);
                        }}
                        toggleUpsellAction={async (formData: FormData) => {
                          'use server';
                          const id = Number(formData.get('id'));
                          const showInUpsell = formData.get('showInUpsell') === 'true';
                          await toggleUpsellExtra(id, showInUpsell);
                        }}
                        deleteAction={async (formData: FormData) => {
                          'use server';
                          const id = Number(formData.get('id'));
                          await deleteExtra(id);
                        }}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {selectedId && (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 24 }}>
            <h2 style={{ margin: '0 0 20px', fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>Neue Zusatzleistung anlegen</h2>
            <CreateExtraForm hotelId={selectedId} />
          </div>
        )}

      </div>
    </main>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { PLANS, PlanKey } from '@/src/lib/stripe';

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  active:    { label: 'Aktiv',       color: '#16a34a', bg: '#dcfce7' },
  trialing:  { label: 'Testphase',   color: '#0284c7', bg: '#e0f2fe' },
  past_due:  { label: 'Zahlung offen', color: '#d97706', bg: '#fef3c7' },
  cancelled: { label: 'Gekündigt',   color: '#dc2626', bg: '#fee2e2' },
  inactive:  { label: 'Inaktiv',     color: '#6b7280', bg: '#f3f4f6' },
};

export default function BillingPage() {
  const [hotel, setHotel] = useState<{ id: number; name: string; plan: string; subscriptionStatus: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/admin/billing-info');
      if (res.ok) {
        const data = await res.json();
        setHotel(data.hotel);
      }
      setLoading(false);
    }
    load();
  }, []);

  async function startCheckout(plan: PlanKey) {
    if (!hotel) return;
    setActionLoading(true);
    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan, hotelId: hotel.id }),
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    else setActionLoading(false);
  }

  async function openPortal() {
    if (!hotel) return;
    setActionLoading(true);
    const res = await fetch('/api/stripe/portal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hotelId: hotel.id }),
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    else setActionLoading(false);
  }

  if (loading) return <main style={{ padding: 40, fontFamily: 'Inter, sans-serif' }}>Laden…</main>;

  const currentPlan = hotel?.plan ?? 'starter';
  const status = hotel?.subscriptionStatus ?? 'inactive';
  const statusInfo = STATUS_LABELS[status] ?? STATUS_LABELS.inactive;
  const isActive = status === 'active' || status === 'trialing';

  return (
    <main style={{ padding: 32, background: '#f5f5f7', minHeight: '100vh', fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gap: 24 }}>

        <div>
          <h1 style={{ margin: 0, fontSize: 32, letterSpacing: '-0.03em', color: '#0f172a' }}>Abonnement</h1>
          <p style={{ margin: '6px 0 0', fontSize: 14, color: '#667085' }}>Plan verwalten für {hotel?.name}</p>
        </div>

        {/* Current plan */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: '24px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 4 }}>Aktueller Plan</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', letterSpacing: '-0.02em' }}>
              {PLANS[currentPlan as PlanKey]?.name ?? 'Starter'}
            </div>
            <span style={{ display: 'inline-block', marginTop: 6, padding: '3px 10px', borderRadius: 999, fontSize: 12, fontWeight: 600, background: statusInfo.bg, color: statusInfo.color }}>
              {statusInfo.label}
            </span>
          </div>
          {isActive && (
            <button
              onClick={openPortal}
              disabled={actionLoading}
              style={{ padding: '10px 20px', borderRadius: 999, border: '1px solid #d1d5db', background: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', color: '#374151' }}
            >
              Abonnement verwalten
            </button>
          )}
        </div>

        {/* Plan cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {(Object.entries(PLANS) as [PlanKey, typeof PLANS[PlanKey]][]).map(([key, plan]) => {
            const isCurrent = currentPlan === key;
            return (
              <div
                key={key}
                style={{
                  background: '#fff',
                  border: `2px solid ${isCurrent ? '#111827' : '#e5e7eb'}`,
                  borderRadius: 16,
                  padding: 24,
                  display: 'grid',
                  gap: 16,
                  position: 'relative',
                }}
              >
                {isCurrent && (
                  <div style={{ position: 'absolute', top: -12, left: 20, padding: '3px 12px', background: '#111827', color: '#fff', borderRadius: 999, fontSize: 11, fontWeight: 700, letterSpacing: '0.05em' }}>
                    AKTUELL
                  </div>
                )}

                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#111827' }}>{plan.name}</div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: '#0f172a', marginTop: 8, letterSpacing: '-0.02em' }}>
                    € {key === 'starter' ? '49' : key === 'pro' ? '99' : '199'}
                    <span style={{ fontSize: 14, fontWeight: 400, color: '#6b7280' }}> / Monat</span>
                  </div>
                </div>

                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 8 }}>
                  {plan.features.map((f) => (
                    <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#374151' }}>
                      <span style={{ color: '#10b981', fontWeight: 700 }}>✓</span> {f}
                    </li>
                  ))}
                </ul>

                {!isCurrent && (
                  <button
                    onClick={() => startCheckout(key)}
                    disabled={actionLoading}
                    style={{
                      padding: '10px 16px',
                      borderRadius: 999,
                      background: '#111827',
                      color: '#fff',
                      border: 'none',
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: 'pointer',
                      opacity: actionLoading ? 0.6 : 1,
                    }}
                  >
                    {isActive ? 'Wechseln' : 'Auswählen'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}

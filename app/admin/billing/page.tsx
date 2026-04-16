'use client';

import { useEffect, useState } from 'react';
import { PLANS, PlanKey } from '@/src/lib/plans';

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  active:    { label: 'Aktiv',       color: '#16a34a', bg: '#dcfce7' },
  trialing:  { label: 'Testphase',   color: '#0284c7', bg: '#e0f2fe' },
  past_due:  { label: 'Zahlung offen', color: '#d97706', bg: '#fef3c7' },
  cancelled: { label: 'Gekündigt',   color: '#dc2626', bg: '#fee2e2' },
  inactive:  { label: 'Inaktiv',     color: '#6b7280', bg: '#f3f4f6' },
};

function FeatureItem({ label, included, currentPlanName }: { label: string; included: boolean; currentPlanName: string }) {
  const [hover, setHover] = useState(false);

  if (included) {
    return (
      <li style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#374151' }}>
        <span style={{ color: '#10b981', fontWeight: 700, fontSize: 15 }}>✓</span> {label}
      </li>
    );
  }

  return (
    <li
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#c0c5ce', position: 'relative', cursor: 'default' }}
    >
      <span style={{ fontSize: 13 }}>🔒</span>
      <span style={{ textDecoration: 'line-through', textDecorationColor: '#e0e3e8' }}>{label}</span>
      {hover && (
        <span
          style={{
            position: 'absolute',
            left: '50%',
            bottom: '100%',
            transform: 'translateX(-50%)',
            marginBottom: 6,
            padding: '6px 12px',
            background: '#1e293b',
            color: '#fff',
            fontSize: 12,
            fontWeight: 500,
            borderRadius: 8,
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 10,
          }}
        >
          Nicht im {currentPlanName} Plan
          <span style={{
            position: 'absolute',
            top: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            borderWidth: 5,
            borderStyle: 'solid',
            borderColor: '#1e293b transparent transparent transparent',
          }} />
        </span>
      )}
    </li>
  );
}

export default function BillingPage() {
  const [hotel, setHotel] = useState<{ id: number; name: string; plan: string; subscriptionStatus: string; trialEndsAt: string | null } | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  async function handlePlanAction(plan: PlanKey) {
    if (!hotel) return;
    setActionLoading(true);
    setError(null);
    try {
      if (status === 'trialing') {
        const res = await fetch('/api/admin/switch-plan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ plan }),
        });
        const data = await res.json();
        if (data.ok) {
          setHotel({ ...hotel, plan });
          setActionLoading(false);
          return;
        }
        setError(data.error || 'Planwechsel fehlgeschlagen');
      } else {
        const res = await fetch('/api/stripe/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ plan, hotelId: hotel.id }),
        });
        const data = await res.json();
        if (data.url) { window.location.href = data.url; return; }
        setError(data.error || `Checkout fehlgeschlagen (${res.status})`);
      }
    } catch (e) {
      setError(String(e));
    }
    setActionLoading(false);
  }

  async function openPortal() {
    if (!hotel) return;
    setActionLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hotelId: hotel.id }),
      });
      const data = await res.json();
      if (data.url) { window.location.href = data.url; return; }
      setError(data.error || `Portal fehlgeschlagen (${res.status})`);
    } catch (e) {
      setError(String(e));
    }
    setActionLoading(false);
  }

  if (loading) return <main style={{ padding: 40, fontFamily: 'Inter, sans-serif' }}>Laden…</main>;

  const currentPlan = (hotel?.plan ?? 'starter') as PlanKey;
  const status = hotel?.subscriptionStatus ?? 'inactive';
  const statusInfo = STATUS_LABELS[status] ?? STATUS_LABELS.inactive;
  const isActive = status === 'active' || status === 'trialing';
  const currentFeatures: readonly string[] = PLANS[currentPlan]?.features ?? [];
  const currentPlanName = PLANS[currentPlan]?.name ?? 'Starter';

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
              {currentPlanName}
            </div>
            <span style={{ display: 'inline-block', marginTop: 6, padding: '3px 10px', borderRadius: 999, fontSize: 12, fontWeight: 600, background: statusInfo.bg, color: statusInfo.color }}>
              {statusInfo.label}
            </span>
            {status === 'trialing' && hotel?.trialEndsAt && (
              <span style={{ display: 'block', marginTop: 6, fontSize: 13, color: '#6b7280' }}>
                Testphase endet am {new Date(hotel.trialEndsAt).toLocaleDateString('de-AT', { day: '2-digit', month: '2-digit', year: 'numeric' })}
              </span>
            )}
            {status === 'inactive' && hotel?.trialEndsAt && new Date(hotel.trialEndsAt) < new Date() && (
              <span style={{ display: 'block', marginTop: 6, fontSize: 13, color: '#dc2626' }}>
                Testphase abgelaufen — bitte Plan aktivieren.
              </span>
            )}
          </div>
          {isActive && status !== 'trialing' && (
            <button
              onClick={openPortal}
              disabled={actionLoading}
              style={{ padding: '10px 20px', borderRadius: 999, border: '1px solid #d1d5db', background: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', color: '#374151' }}
            >
              Abonnement verwalten
            </button>
          )}
        </div>

        {error && (
          <div style={{ padding: '12px 16px', background: '#fee2e2', border: '1px solid #fecaca', borderRadius: 10, fontSize: 14, color: '#dc2626' }}>
            {error}
          </div>
        )}

        {/* Plan cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {(Object.entries(PLANS) as [PlanKey, typeof PLANS[PlanKey]][]).map(([key, plan]) => {
            const isCurrent = currentPlan === key;
            return (
              <div
                key={key}
                style={{
                  background: '#fff',
                  border: `2px solid ${key === 'pro' ? '#111827' : '#e5e7eb'}`,
                  borderRadius: 16,
                  padding: 24,
                  display: 'flex',
                  flexDirection: 'column' as const,
                  gap: 16,
                  position: 'relative',
                }}
              >
                {key === 'pro' && (
                  <div style={{ position: 'absolute', top: -12, left: 20, padding: '3px 12px', background: '#111827', color: '#fff', borderRadius: 999, fontSize: 11, fontWeight: 700, letterSpacing: '0.05em' }}>
                    BESTER DEAL
                  </div>
                )}

                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#111827' }}>{plan.name}</div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: '#0f172a', marginTop: 8, letterSpacing: '-0.02em' }}>
                    € {key === 'starter' ? '49' : key === 'pro' ? '99' : '199'}
                    <span style={{ fontSize: 14, fontWeight: 400, color: '#6b7280' }}> / Monat</span>
                  </div>
                </div>

                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 8, flex: 1 }}>
                  {plan.features.map((f) => (
                    <FeatureItem
                      key={f}
                      label={f}
                      included={isCurrent || currentFeatures.includes(f)}
                      currentPlanName={currentPlanName}
                    />
                  ))}
                </ul>

                <button
                  onClick={() => handlePlanAction(key)}
                  disabled={actionLoading || (isCurrent && isActive)}
                  style={{
                    padding: '10px 16px',
                    borderRadius: 999,
                    background: '#111827',
                    color: '#fff',
                    border: 'none',
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: (isCurrent && isActive) ? 'default' : 'pointer',
                    opacity: (isCurrent && isActive) ? 0.4 : actionLoading ? 0.6 : 1,
                  }}
                >
                  {isCurrent && isActive ? 'Aktueller Plan' : 'Auswählen'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}

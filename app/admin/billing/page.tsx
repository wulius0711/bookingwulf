'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { PLANS, PlanKey } from '@/src/lib/plans';

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  active:    { label: 'Aktiv',       color: '#16a34a', bg: '#dcfce7' },
  trialing:  { label: 'Testphase',   color: '#0284c7', bg: '#e0f2fe' },
  past_due:  { label: 'Zahlung offen', color: '#d97706', bg: '#fef3c7' },
  cancelled: { label: 'Gekündigt',   color: '#dc2626', bg: '#fee2e2' },
  inactive:  { label: 'Inaktiv',     color: '#6b7280', bg: '#f3f4f6' },
};

export default function BillingPage() {
  const searchParams = useSearchParams();
  const [hotel, setHotel] = useState<{ id: number; name: string; plan: string; subscriptionStatus: string; trialEndsAt: string | null } | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showWelcome, setShowWelcome] = useState(searchParams.get('welcome') === '1');
  const [billingInterval, setBillingInterval] = useState<'month' | 'year'>('year');

  function closeWelcome() {
    setShowWelcome(false);
    window.history.replaceState(null, '', '/admin/billing');
  }

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

    // Reset loading state when user returns via browser back button (bfcache restore)
    function handlePageShow(e: PageTransitionEvent) {
      if (e.persisted) setActionLoading(false);
    }
    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
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
          body: JSON.stringify({ plan, interval: billingInterval }),
        });
        const data = await res.json();
        if (data.ok) {
          window.location.reload();
          return;
        }
        setError(data.error || 'Planwechsel fehlgeschlagen');
      } else {
        const res = await fetch('/api/stripe/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ plan, hotelId: hotel.id, interval: billingInterval }),
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

  async function handleCheckout(plan: PlanKey) {
    if (!hotel) return;
    setActionLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, hotelId: hotel.id, interval: billingInterval }),
      });
      const data = await res.json();
      if (data.url) { window.location.href = data.url; return; }
      setError(data.error || `Checkout fehlgeschlagen (${res.status})`);
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

  if (loading) return <main className="admin-page" style={{ fontFamily: 'Inter, sans-serif' }}>Laden…</main>;

  const currentPlan = hotel?.plan ?? 'starter';
  const status = hotel?.subscriptionStatus ?? 'inactive';
  const statusInfo = STATUS_LABELS[status] ?? STATUS_LABELS.inactive;
  const isActive = status === 'active' || status === 'trialing';

  return (
    <main className="admin-page" style={{ background: '#f5f5f7', minHeight: '100vh', fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif' }}>
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
            <span style={{ display: 'inline-block', marginTop: 6, padding: '3px 10px', borderRadius: 8, fontSize: 12, fontWeight: 600, background: statusInfo.bg, color: statusInfo.color }}>
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
          {isActive && (
            <button
              className="btn-secondary"
              onClick={openPortal}
              disabled={actionLoading}
              style={{ padding: '10px 20px', borderRadius: 8, border: '1px solid #d1d5db', background: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', color: '#374151' }}
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

        {/* Trial info */}
        {status === 'trialing' && (
          <div style={{ padding: '14px 18px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 12, fontSize: 14, color: '#1d4ed8', lineHeight: 1.6 }}>
            Du befindest dich noch in der kostenlosen Testphase. Du kannst jederzeit zwischen den Paketen wechseln — die Änderung ist sofort wirksam und es entstehen keine Kosten bis zum Ende der Testphase.
          </div>
        )}

        {/* Billing interval toggle */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <span style={{ fontSize: 14, color: billingInterval === 'month' ? '#111827' : '#6b7280', fontWeight: billingInterval === 'month' ? 600 : 400 }}>Monatlich</span>
          <button
            onClick={() => setBillingInterval(billingInterval === 'month' ? 'year' : 'month')}
            style={{
              width: 48, height: 26, borderRadius: 999, border: 'none', cursor: 'pointer', padding: 3,
              background: billingInterval === 'year' ? '#111827' : '#d1d5db',
              display: 'flex', alignItems: 'center',
              justifyContent: billingInterval === 'year' ? 'flex-end' : 'flex-start',
              transition: 'background 0.2s ease',
            }}
          >
            <span style={{ width: 20, height: 20, borderRadius: '50%', background: '#fff', display: 'block' }} />
          </button>
          <span style={{ fontSize: 14, color: billingInterval === 'year' ? '#111827' : '#6b7280', fontWeight: billingInterval === 'year' ? 600 : 400 }}>
            Jährlich
            {billingInterval === 'year' && (
              <span style={{ marginLeft: 6, padding: '2px 8px', borderRadius: 6, background: '#dcfce7', color: '#16a34a', fontSize: 12, fontWeight: 700 }}>spare 10%</span>
            )}
          </span>
        </div>

        {/* Plan cards */}
        <div className="plan-grid" style={{ display: 'grid', gap: 16 }}>
          {(Object.entries(PLANS) as [PlanKey, typeof PLANS[PlanKey]][]).map(([key, plan]) => {
            const isCurrent = currentPlan === key;
            return (
              <div
                key={key}
                className="plan-card"
                style={{
                  background: isCurrent ? '#f9fafb' : '#fff',
                  border: `2px solid ${isCurrent ? '#e5e7eb' : key === 'pro' ? '#111827' : '#e5e7eb'}`,
                  borderRadius: 16,
                  padding: 24,
                  display: 'flex',
                  flexDirection: 'column' as const,
                  gap: 16,
                  position: 'relative',
                }}
              >
                {key === 'pro' && (
                  <div style={{ position: 'absolute', top: -12, left: 20, padding: '3px 12px', background: '#111827', color: '#fff', borderRadius: 8, fontSize: 11, fontWeight: 700, letterSpacing: '0.05em' }}>
                    BESTER DEAL
                  </div>
                )}

                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#111827' }}>{plan.name}</div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: '#0f172a', marginTop: 8, letterSpacing: '-0.02em' }}>
                    € {billingInterval === 'year' ? plan.priceYearly : plan.priceMonthly}
                    <span style={{ fontSize: 14, fontWeight: 400, color: '#6b7280' }}> / Monat</span>
                  </div>
                  {billingInterval === 'year' && (
                    <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                      = € {plan.priceYearly * 12} / Jahr
                    </div>
                  )}
                </div>

                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 8, flex: 1 }}>
                  {plan.features.map((f) => (
                    <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#374151' }}>
                      <span style={{ color: '#10b981', fontWeight: 700 }}>✓</span> {f}
                    </li>
                  ))}
                </ul>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <button
                    className="btn-primary"
                    onClick={() => handlePlanAction(key)}
                    disabled={actionLoading || isCurrent}
                    style={{
                      padding: '10px 16px',
                      borderRadius: 8,
                      background: '#111827',
                      color: '#fff',
                      border: 'none',
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: isCurrent ? 'default' : 'pointer',
                      opacity: isCurrent ? 0.4 : actionLoading ? 0.6 : 1,
                    }}
                  >
                    {isCurrent ? 'Ausgewählt' : 'Auswählen'}
                  </button>

                  {status === 'trialing' && (
                    <button
                      onClick={() => handleCheckout(key)}
                      disabled={actionLoading}
                      style={{
                        padding: '10px 16px',
                        borderRadius: 8,
                        background: '#fff',
                        color: '#111827',
                        border: '1px solid #d1d5db',
                        fontSize: 14,
                        fontWeight: 600,
                        cursor: 'pointer',
                        opacity: actionLoading ? 0.6 : 1,
                      }}
                    >
                      Jetzt kaufen
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Welcome modal */}
      {showWelcome && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: 24,
            animation: 'fadeIn 0.25s ease',
          }}
          onClick={closeWelcome}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff',
              borderRadius: 20,
              padding: '36px 32px',
              maxWidth: 480,
              width: '100%',
              boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
              animation: 'scaleIn 0.25s ease',
            }}
          >
            <div style={{ fontSize: 32, marginBottom: 8 }}>🎉</div>
            <h2 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 700, color: '#0f172a' }}>
              Willkommen!
            </h2>
            <p style={{ margin: '0 0 16px', fontSize: 15, color: '#475569', lineHeight: 1.6 }}>
              Dein Hotel-Konto wurde erfolgreich erstellt. Du hast jetzt eine
              <strong> 14-tägige kostenlose Testphase</strong>, in der du alle Features ausprobieren kannst.
            </p>
            <ul style={{ margin: '0 0 20px', padding: '0 0 0 18px', fontSize: 14, color: '#475569', lineHeight: 1.8 }}>
              <li>Wähle hier einen Plan — du kannst jederzeit wechseln</li>
              <li>Alle Features des gewählten Plans sind sofort verfügbar</li>
              <li>Erst nach der Testphase wird eine Zahlung fällig</li>
            </ul>
            <button
              onClick={closeWelcome}
              style={{
                width: '100%',
                padding: '12px 20px',
                borderRadius: 8,
                background: '#111827',
                color: '#fff',
                border: 'none',
                fontSize: 15,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Plan auswählen
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

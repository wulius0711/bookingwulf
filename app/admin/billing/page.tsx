'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { PLANS, PlanKey } from '@/src/lib/plans';
import { Button } from '../components/ui';

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  active:    { label: 'Aktiv',           color: 'var(--status-booked-text)',    bg: 'var(--status-booked-bg)'    },
  trialing:  { label: 'Testphase',       color: 'var(--status-new-text)',       bg: 'var(--status-new-bg)'       },
  past_due:  { label: 'Zahlung offen',   color: 'var(--status-pending-text)',   bg: 'var(--status-pending-bg)'   },
  cancelled: { label: 'Gekündigt',       color: 'var(--status-cancelled-text)', bg: 'var(--status-cancelled-bg)' },
  inactive:  { label: 'Inaktiv',         color: 'var(--text-secondary)',        bg: 'var(--bg-surface-raised)'   },
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
    <main className="admin-page" style={{ background: 'var(--page-bg)', minHeight: '100vh', fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif' }}>
      <div style={{ maxWidth: 1100, display: 'grid', gap: 24 }}>

        <div>
          <h1 style={{ margin: 0, fontSize: 32, letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>Abonnement</h1>
          <p style={{ margin: '6px 0 0', fontSize: 14, color: 'var(--text-secondary)' }}>Plan verwalten für {hotel?.name}</p>
        </div>

        {/* Current plan */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '24px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>Aktueller Plan</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              {PLANS[currentPlan as PlanKey]?.name ?? 'Starter'}
            </div>
            <span style={{ display: 'inline-block', marginTop: 6, padding: '3px 10px', borderRadius: 8, fontSize: 12, fontWeight: 600, background: statusInfo.bg, color: statusInfo.color }}>
              {statusInfo.label}
            </span>
            {status === 'trialing' && hotel?.trialEndsAt && (
              <span style={{ display: 'block', marginTop: 6, fontSize: 13, color: 'var(--text-secondary)' }}>
                Testphase endet am {new Date(hotel.trialEndsAt).toLocaleDateString('de-AT', { day: '2-digit', month: '2-digit', year: 'numeric' })}
              </span>
            )}
            {status === 'inactive' && hotel?.trialEndsAt && new Date(hotel.trialEndsAt) < new Date() && (
              <span style={{ display: 'block', marginTop: 6, fontSize: 13, color: 'var(--status-cancelled-text)' }}>
                Testphase abgelaufen — bitte Plan aktivieren.
              </span>
            )}
          </div>
          {isActive && (
            <div title={status === 'trialing' ? 'Verfügbar sobald ein kostenpflichtiges Abonnement aktiv ist.' : undefined}>
              <Button
                variant="secondary"
                onClick={status === 'trialing' ? undefined : openPortal}
                disabled={actionLoading || status === 'trialing'}
                loading={actionLoading && status !== 'trialing'}
              >
                Abonnement verwalten
              </Button>
            </div>
          )}
        </div>

        {error && (
          <div style={{ padding: '12px 16px', background: 'var(--status-error-bg)', border: '1px solid var(--primitive-red-300)', borderRadius: 10, fontSize: 14, color: 'var(--status-error-text)' }}>
            {error}
          </div>
        )}

        {/* Trial info */}
        {status === 'trialing' && (
          <div style={{ padding: '14px 18px', background: 'var(--status-booked-bg)', border: '1px solid var(--primitive-green-100)', borderRadius: 12, fontSize: 14, color: 'var(--status-booked-text)', lineHeight: 1.6 }}>
            Du befindest dich noch in der kostenlosen Testphase. Du kannst jederzeit zwischen den Paketen wechseln — die Änderung ist sofort wirksam und es entstehen keine Kosten bis zum Ende der Testphase.
          </div>
        )}

        {/* Billing interval toggle */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <span style={{ fontSize: 14, color: billingInterval === 'month' ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: billingInterval === 'month' ? 600 : 400 }}>Monatlich</span>
          <button
            onClick={() => setBillingInterval(billingInterval === 'month' ? 'year' : 'month')}
            style={{
              width: 48, height: 26, borderRadius: 999, border: 'none', cursor: 'pointer', padding: 3,
              background: billingInterval === 'year' ? 'var(--accent)' : 'var(--border)',
              display: 'flex', alignItems: 'center',
              justifyContent: billingInterval === 'year' ? 'flex-end' : 'flex-start',
              transition: 'background 0.2s ease',
            }}
          >
            <span style={{ width: 20, height: 20, borderRadius: '50%', background: '#fff', display: 'block' }} />
          </button>
          <span style={{ fontSize: 14, color: billingInterval === 'year' ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: billingInterval === 'year' ? 600 : 400 }}>
            Jährlich
            {billingInterval === 'year' && (
              <span style={{ marginLeft: 6, padding: '2px 8px', borderRadius: 6, background: 'var(--status-booked-bg)', color: 'var(--status-booked-text)', fontSize: 12, fontWeight: 700 }}>spare 10%</span>
            )}
          </span>
        </div>

        {/* Bundle plan indicator (only shown when on bundle_all) */}
        {currentPlan === 'bundle_all' && (
          <div style={{ padding: '20px 24px', background: 'var(--status-new-bg)', border: '2px solid var(--status-new-text)', borderRadius: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <span style={{ fontSize: 22 }}>⭐</span>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>hotelwulf Bundle</div>
            </div>
            <p style={{ margin: 0, fontSize: 14, color: 'var(--status-new-text)', lineHeight: 1.6 }}>
              Du hast das hotelwulf Bundle — alle Plattformen inklusive. Für Änderungen an deinem Abonnement wende dich an den Support.
            </p>
          </div>
        )}

        {/* Plan cards */}
        <div className="plan-grid" style={{ display: 'grid', gap: 16 }}>
          {(Object.entries(PLANS) as [PlanKey, typeof PLANS[PlanKey]][]).filter(([key]) => key !== 'bundle_all').map(([key, plan]) => {
            const isCurrent = currentPlan === key;
            const isBundle = currentPlan === 'bundle_all';
            return (
              <div
                key={key}
                className="plan-card"
                style={{
                  background: isCurrent ? 'var(--surface-2)' : 'var(--surface)',
                  border: `2px solid ${isCurrent ? 'var(--border)' : key === 'pro' ? 'var(--accent)' : 'var(--border)'}`,
                  borderRadius: 16,
                  padding: 24,
                  display: 'flex',
                  flexDirection: 'column' as const,
                  gap: 16,
                  position: 'relative',
                }}
              >
                {key === 'pro' && (
                  <div style={{ position: 'absolute', top: -12, left: 20, padding: '3px 12px', background: 'var(--accent)', color: 'var(--text-on-accent)', borderRadius: 8, fontSize: 11, fontWeight: 700, letterSpacing: '0.05em' }}>
                    BESTER DEAL
                  </div>
                )}

                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>{plan.name}</div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', marginTop: 8, letterSpacing: '-0.02em' }}>
                    € {billingInterval === 'year' ? plan.priceYearly : plan.priceMonthly}
                    <span style={{ fontSize: 14, fontWeight: 400, color: 'var(--text-secondary)' }}> / Monat</span>
                  </div>
                  {billingInterval === 'year' && (
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                      = € {plan.priceYearly * 12} / Jahr
                    </div>
                  )}
                </div>

                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 8, flex: 1 }}>
                  {plan.features.map((f) => (
                    <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'var(--text-primary)' }}>
                      <span style={{ color: 'var(--status-booked-text)', fontWeight: 700 }}>✓</span> {f}
                    </li>
                  ))}
                </ul>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <Button
                    variant="primary"
                    onClick={() => handlePlanAction(key)}
                    disabled={actionLoading || isCurrent || isBundle}
                    loading={actionLoading && !isCurrent && !isBundle}
                  >
                    {isCurrent ? 'Ausgewählt' : 'Auswählen'}
                  </Button>

                  {status === 'trialing' && !isBundle && (
                    <Button
                      variant="secondary"
                      onClick={() => handleCheckout(key)}
                      disabled={actionLoading}
                    >
                      Jetzt kaufen
                    </Button>
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
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 24, animation: 'fadeIn 0.25s ease' }}
          onClick={closeWelcome}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ background: 'var(--surface)', borderRadius: 20, padding: 'clamp(20px, 5vw, 36px) clamp(16px, 4vw, 32px)', maxWidth: 480, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', animation: 'scaleIn 0.25s ease' }}
          >
            <div style={{ fontSize: 32, marginBottom: 8 }}>🎉</div>
            <h2 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>
              Willkommen!
            </h2>
            <p style={{ margin: '0 0 16px', fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Dein Hotel-Konto wurde erfolgreich erstellt. Du hast jetzt eine
              <strong> 14-tägige kostenlose Testphase</strong>, in der du alle Features ausprobieren kannst.
            </p>
            <ul style={{ margin: '0 0 20px', padding: '0 0 0 18px', fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
              <li>Wähle hier einen Plan — du kannst jederzeit wechseln</li>
              <li>Alle Features des gewählten Plans sind sofort verfügbar</li>
              <li>Erst nach der Testphase wird eine Zahlung fällig</li>
            </ul>
            <Button variant="primary" onClick={closeWelcome} style={{ width: '100%' }}>
              Plan auswählen
            </Button>
          </div>
        </div>
      )}
    </main>
  );
}

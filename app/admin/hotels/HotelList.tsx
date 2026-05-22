'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '../components/ui';
import DeleteHotelButton from './DeleteHotelButton';

export type HotelRow = {
  id: number;
  name: string;
  slug: string;
  email: string | null;
  accentColor: string | null;
  isActive: boolean;
  subscriptionStatus: string;
  apartmentCount: number;
  requestCount: number;
  hasApartment: boolean;
  hasPayment: boolean;
  lastBookingText: string | null;
  trialDaysLeft: number | null;
  trialResetCount: number;
};

export default function HotelList({
  hotels,
  onToggle,
  onResetTrial,
  onDelete,
}: {
  hotels: HotelRow[];
  onToggle: (fd: FormData) => Promise<void>;
  onResetTrial: (fd: FormData) => Promise<void>;
  onDelete: (fd: FormData) => Promise<void>;
}) {
  const [q, setQ] = useState('');

  const filtered = q.trim()
    ? hotels.filter((h) => {
        const s = q.toLowerCase();
        return h.name.toLowerCase().includes(s) || h.slug.includes(s) || h.email?.toLowerCase().includes(s);
      })
    : hotels;

  return (
    <>
      <input
        type="search"
        placeholder="Name, Slug oder E-Mail suchen…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        style={{
          width: '100%',
          padding: '10px 14px',
          borderRadius: 10,
          border: '1px solid var(--border)',
          background: 'var(--surface)',
          color: 'var(--text-primary)',
          fontSize: 14,
          marginBottom: 12,
          outline: 'none',
        }}
      />

      {filtered.length === 0 && (
        <p style={{ color: 'var(--text-disabled)', fontSize: 14 }}>Keine Treffer.</p>
      )}

      <div style={{ display: 'grid', gap: 12 }}>
        {filtered.map((h) => {
          const trialColor =
            h.trialDaysLeft === null ? null
            : h.trialDaysLeft <= 3 ? { bg: 'var(--status-cancelled-bg)', text: 'var(--status-cancelled-text)' }
            : h.trialDaysLeft <= 7 ? { bg: '#fef9c3', text: '#92400e' }
            : { bg: 'var(--status-new-bg)', text: 'var(--status-new-text)' };

          return (
            <div
              key={h.id}
              style={{
                border: '1px solid var(--border)',
                borderRadius: 14,
                padding: '18px 20px',
                background: 'var(--surface)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 16,
                flexWrap: 'wrap',
                opacity: h.isActive ? 1 : 0.55,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: h.accentColor || 'var(--border)',
                    flexShrink: 0,
                    border: '1px solid rgba(0,0,0,0.08)',
                  }}
                />
                <div style={{ display: 'grid', gap: 4 }}>
                  <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' }}>
                    {h.name}
                    {!h.isActive && (
                      <span style={{ marginLeft: 8, padding: '2px 8px', borderRadius: 8, fontSize: 11, fontWeight: 700, background: 'var(--status-cancelled-bg)', color: 'var(--status-cancelled-text)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Inaktiv
                      </span>
                    )}
                  </div>

                  <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                    /{h.slug}
                    {h.email && <span style={{ marginLeft: 12 }}>{h.email}</span>}
                  </div>

                  <div style={{ fontSize: 12, color: 'var(--text-disabled)', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <span>{h.apartmentCount} Apt · {h.requestCount} Anfragen</span>
                    <span>·</span>
                    <span style={{
                      padding: '1px 6px', borderRadius: 8, fontSize: 11, fontWeight: 600,
                      background: h.subscriptionStatus === 'active' ? 'var(--status-booked-bg)' : h.subscriptionStatus === 'trialing' ? 'var(--status-new-bg)' : 'var(--status-cancelled-bg)',
                      color: h.subscriptionStatus === 'active' ? 'var(--status-booked-text)' : h.subscriptionStatus === 'trialing' ? 'var(--status-new-text)' : 'var(--status-cancelled-text)',
                    }}>
                      {h.subscriptionStatus}
                    </span>
                    {h.subscriptionStatus === 'trialing' && h.trialDaysLeft !== null && trialColor && (
                      <span style={{ padding: '1px 6px', borderRadius: 8, fontSize: 11, fontWeight: 600, background: trialColor.bg, color: trialColor.text }}>
                        {h.trialDaysLeft > 0 ? `${h.trialDaysLeft}d Trial` : `${(h.trialResetCount ?? 0) + 1}x Trial abgelaufen`}
                      </span>
                    )}
                  </div>

                  <div style={{ fontSize: 12, color: 'var(--text-disabled)', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <span title={h.hasApartment ? 'Apartment vorhanden' : 'Kein Apartment angelegt'}>
                      {h.hasApartment ? '✅' : '⚠️'} Apartment
                    </span>
                    <span title={h.hasPayment ? 'Zahlungsart konfiguriert' : 'Keine Zahlungsart konfiguriert'}>
                      {h.hasPayment ? '✅' : '⚠️'} Zahlung
                    </span>
                    <span style={{ color: h.lastBookingText ? 'var(--text-disabled)' : '#f59e0b' }}>
                      {h.lastBookingText ? `Letzte Buchung: ${h.lastBookingText}` : 'Noch keine Buchung'}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <Link href={`/admin/hotels/${h.id}`} className="ui-btn ui-btn-secondary ui-btn-sm" style={{ textDecoration: 'none' }}>
                  Bearbeiten
                </Link>

                <form action={onToggle}>
                  <input type="hidden" name="id" value={h.id} />
                  <input type="hidden" name="isActive" value={String(h.isActive)} />
                  <Button variant="secondary" size="sm" type="submit">
                    {h.isActive ? 'Deaktivieren' : 'Aktivieren'}
                  </Button>
                </form>

                {h.subscriptionStatus !== 'trialing' && h.subscriptionStatus !== 'active' && (
                  <form action={onResetTrial}>
                    <input type="hidden" name="id" value={h.id} />
                    <Button variant="secondary" size="sm" type="submit">Trial zurücksetzen</Button>
                  </form>
                )}

                <DeleteHotelButton hotelId={h.id} hotelName={h.name} action={onDelete} />
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

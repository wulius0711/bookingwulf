'use client';

const C = {
  card: '#13161b',
  border: '#1e2530',
  text: '#F4F2EC',
  muted: '#5B6772',
  accent: '#0E8BA9',
  green: '#10b981',
  amber: '#f59e0b',
  surface: '#1a1f27',
};

const cardBase: React.CSSProperties = {
  background: C.card,
  border: `1px solid ${C.border}`,
  borderRadius: 12,
  padding: '14px 16px',
  width: 260,
  flexShrink: 0,
  fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
};

function BookingCard({ name, apt, nights, dates, price, status }: {
  name: string; apt: string; nights: number; dates: string; price: string; status: 'pending' | 'confirmed';
}) {
  return (
    <div style={cardBase}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.text, letterSpacing: '-0.01em' }}>{name}</div>
        <div style={{
          fontSize: 9, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase',
          color: status === 'confirmed' ? C.green : C.amber,
          background: status === 'confirmed' ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)',
          border: `1px solid ${status === 'confirmed' ? 'rgba(16,185,129,0.25)' : 'rgba(245,158,11,0.25)'}`,
          borderRadius: 4, padding: '2px 6px',
        }}>
          {status === 'confirmed' ? 'Bestätigt' : 'Anfrage'}
        </div>
      </div>
      <div style={{ fontSize: 10, color: C.muted, marginBottom: 8 }}>{apt}</div>
      <div style={{ height: 1, background: C.border, marginBottom: 10 }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 9, color: C.muted, marginBottom: 2 }}>{dates}</div>
          <div style={{ fontSize: 9, color: C.muted }}>{nights} Nächte</div>
        </div>
        <div style={{ fontSize: 14, fontWeight: 700, color: C.accent }}>{price}</div>
      </div>
    </div>
  );
}

function CalendarCard() {
  const days = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
  const cells: (number | null)[] = [null, null, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31];
  const booked = [3, 4, 5, 6, 12, 13, 20, 21, 22];

  return (
    <div style={{ ...cardBase }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.text }}>Juli 2026</div>
        <div style={{ fontSize: 9, color: C.muted }}>Bergchalet</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 2 }}>
        {days.map(d => (
          <div key={d} style={{ fontSize: 7, color: C.muted, textAlign: 'center', fontWeight: 600 }}>{d}</div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
        {cells.map((n, i) => (
          <div key={i} style={{
            height: 18,
            borderRadius: 3,
            fontSize: 7,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: !n ? 'transparent' : booked.includes(n!) ? C.accent : C.surface,
            color: !n ? 'transparent' : booked.includes(n!) ? '#fff' : C.muted,
            fontWeight: n && booked.includes(n) ? 700 : 400,
          }}>{n || ''}</div>
        ))}
      </div>
    </div>
  );
}

function GuestCard() {
  return (
    <div style={cardBase}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <div style={{ width: 28, height: 28, borderRadius: 8, background: C.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>🏔️</div>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.text }}>Gäste-Lounge</div>
          <div style={{ fontSize: 8, color: C.muted }}>Familie Maier · Zimmer 3</div>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
        {[
          { label: 'Check-in', value: '15:00' },
          { label: 'Check-out', value: '11:00' },
          { label: 'Zugangscode', value: '4821' },
          { label: 'WLAN', value: 'Berg2026' },
        ].map(({ label, value }) => (
          <div key={label} style={{ background: C.surface, borderRadius: 6, padding: '6px 8px' }}>
            <div style={{ fontSize: 7, color: C.muted, marginBottom: 2 }}>{label}</div>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.text }}>{value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatsCard() {
  return (
    <div style={cardBase}>
      <div style={{ fontSize: 9, color: C.muted, marginBottom: 4 }}>Monatsumsatz</div>
      <div style={{ fontSize: 22, fontWeight: 800, color: C.text, letterSpacing: '-0.03em', marginBottom: 6 }}>€4.280</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <div style={{ fontSize: 9, color: C.green, fontWeight: 700 }}>↑ +18%</div>
        <div style={{ fontSize: 9, color: C.muted }}>vs. Vormonat</div>
      </div>
      <div style={{ marginTop: 10, display: 'flex', gap: 3, alignItems: 'flex-end', height: 28 }}>
        {[40, 55, 45, 70, 60, 80, 100].map((h, i) => (
          <div key={i} style={{ flex: 1, height: `${h}%`, background: i === 6 ? C.accent : C.surface, borderRadius: 2 }} />
        ))}
      </div>
    </div>
  );
}

function WidgetCard() {
  return (
    <div style={{ ...cardBase, background: '#fff', border: '1px solid #e5e7eb' }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: '#111', marginBottom: 8 }}>Ferienwohnung Alpenblick</div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
        {['Juli 2026', ''].map((m, i) => (
          <div key={i} style={{ flex: 1, background: i === 0 ? '#f3f4f6' : '#f3f4f6', borderRadius: 6, padding: '4px 6px', fontSize: 9, color: '#374151', fontWeight: 600 }}>
            {m || 'Aug 2026'}
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
        {Array.from({ length: 14 }, (_, i) => i + 1).map(n => (
          <div key={n} style={{
            height: 16, borderRadius: 3, fontSize: 7,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: [3, 4, 5, 10, 11].includes(n) ? '#e5e7eb' : n === 7 ? C.accent : 'transparent',
            color: n === 7 ? '#fff' : '#374151',
            fontWeight: 600,
          }}>{n}</div>
        ))}
      </div>
      <div style={{ marginTop: 8, background: C.accent, borderRadius: 6, padding: '6px', textAlign: 'center', fontSize: 9, fontWeight: 700, color: '#fff' }}>
        Jetzt buchen
      </div>
    </div>
  );
}

const COLS: React.ReactNode[][] = [
  [
    <BookingCard key="b1" name="Maria Huber" apt="Ferienwohnung Alpenblick" nights={3} dates="24.–27. Jul" price="€348" status="confirmed" />,
    <CalendarCard key="c1" />,
    <BookingCard key="b2" name="Klaus Weber" apt="Chalet Bergblick" nights={7} dates="1.–8. Aug" price="€980" status="pending" />,
    <StatsCard key="s1" />,
  ],
  [
    <GuestCard key="g1" />,
    <BookingCard key="b3" name="Anna Schmidt" apt="Suite Panorama" nights={2} dates="15.–17. Aug" price="€290" status="confirmed" />,
    <WidgetCard key="w1" />,
    <BookingCard key="b4" name="Peter Gruber" apt="Landhaus Tirol" nights={5} dates="20.–25. Aug" price="€625" status="pending" />,
  ],
  [
    <StatsCard key="s2" />,
    <BookingCard key="b5" name="Sophie Bauer" apt="Ferienwohnung Alpenblick" nights={4} dates="10.–14. Sep" price="€464" status="confirmed" />,
    <GuestCard key="g2" />,
    <CalendarCard key="c2" />,
  ],
];

export default function HeroBg() {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 0 }} aria-hidden>
      <style>{`
        @keyframes heroFloat0 { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-24px); } }
        @keyframes heroFloat1 { 0%,100% { transform: translateY(-16px); } 50% { transform: translateY(16px); } }
        @keyframes heroFloat2 { 0%,100% { transform: translateY(-8px); } 50% { transform: translateY(20px); } }
        .hero-col-0 { animation: heroFloat0 18s ease-in-out infinite; }
        .hero-col-1 { animation: heroFloat1 22s ease-in-out infinite; }
        .hero-col-2 { animation: heroFloat2 16s ease-in-out infinite; }
      `}</style>

      {/* 3D perspective grid */}
      <div style={{
        position: 'absolute',
        top: -80, left: '50%',
        transform: 'translateX(-50%) perspective(900px) rotateX(28deg) rotateY(-6deg) rotateZ(2deg)',
        transformOrigin: 'center top',
        display: 'flex',
        gap: 16,
        opacity: 0.45,
        pointerEvents: 'none',
        width: 'max-content',
      }}>
        {COLS.map((cards, ci) => (
          <div
            key={ci}
            className={`hero-col-${ci}`}
            style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
          >
            {cards}
          </div>
        ))}
      </div>

      {/* Edge fade gradients */}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 60% at 50% 100%, rgba(0,0,0,0.9) 0%, transparent 70%)' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 30%, transparent 60%, rgba(0,0,0,0.6) 100%)' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(0,0,0,0.5) 0%, transparent 20%, transparent 80%, rgba(0,0,0,0.5) 100%)' }} />
    </div>
  );
}

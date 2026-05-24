'use client';

import { useState } from 'react';

export default function BridgeSection() {
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const [sent, setSent] = useState(false);
  const [pending, setPending] = useState(false);

  function openModal() { setOpen(true); setSent(false); requestAnimationFrame(() => setVisible(true)); }
  function closeModal() { setVisible(false); setTimeout(() => setOpen(false), 220); }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    const fd = new FormData(e.currentTarget);
    await fetch('/api/bridge-inquiry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: fd.get('name'), email: fd.get('email'), switchDate: fd.get('switchDate') }),
    }).catch(() => {});
    setPending(false);
    setSent(true);
  }

  return (
    <>
      {/* Divider */}
      <div className="w-full mb-8" style={{ height: 1, background: 'rgba(255,255,255,0.12)' }} />

      {/* Card */}
      <div className="flex justify-center">
        <div className="grid overflow-hidden" style={{ width: '66%', minWidth: 340, background: '#fff', border: '0.5px solid rgba(0,0,0,0.12)', borderRadius: 'var(--v4-radius-card)', gridTemplateColumns: '1fr auto' }}>

          {/* Linke Spalte */}
          <div className="p-7">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold rounded-full px-2.5 py-1 mb-3" style={{ background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a' }}>
              🕐 Noch im Vertrag?
            </span>
            <h3 className="text-[17px] font-semibold mb-2" style={{ color: 'var(--v4-navy)' }}>
              Jetzt einsteigen, später wechseln.
            </h3>
            <p className="text-[15px] mb-4" style={{ color: 'var(--v4-body)', lineHeight: 1.6 }}>
              Noch ein paar Monate bei einem anderen Anbieter? Kein Problem — starte heute mit der Gäste-Lounge und aktiviere den vollen Pro-Plan, sobald dein Vertrag ausläuft.
            </p>
            <ul className="flex flex-col gap-2.5 list-none m-0 p-0">
              {[
                'Gäste-Lounge sofort aktiv — persönliche Links, Zugangscodes, Hausinfos',
                'Pro-Plan startet automatisch zum Datum deiner Wahl',
                'Kein doppeltes Onboarding — alles ist beim Umstieg schon eingerichtet',
              ].map((t) => (
                <li key={t} className="flex gap-2 items-start text-[15px]">
                  <span className="mt-0.5 shrink-0 font-bold v4-text-green">✓</span>
                  <span style={{ color: 'var(--v4-body)' }}>{t}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Rechte Spalte */}
          <div className="flex flex-col items-center justify-center gap-1 p-7 text-center" style={{ borderLeft: '0.5px solid rgba(0,0,0,0.10)', minWidth: 180 }}>
            <span className="text-xs font-medium" style={{ color: 'var(--v4-body)' }}>Gäste-Lounge</span>
            <div className="text-[40px] font-extrabold tracking-tight" style={{ color: 'var(--v4-navy)', lineHeight: 1 }}>
              €29<span className="text-base font-normal v4-text-muted"> / Mo</span>
            </div>
            <p className="text-xs mt-1 mb-4" style={{ lineHeight: 1.5, color: 'var(--v4-body)' }}>
              Nur buchbar mit<br />Pro-Plan-Zusage.<br />Kein Rückgaberecht.
            </p>
            <button
              onClick={openModal}
              className="text-[13px] font-semibold px-5 py-2.5 rounded-[10px] whitespace-nowrap transition-all duration-200"
              style={{ border: '1.5px solid var(--v4-navy)', background: '#fff', color: 'var(--v4-navy)', cursor: 'pointer' }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--v4-green)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--v4-green)'; (e.currentTarget as HTMLButtonElement).style.color = '#fff'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#fff'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--v4-navy)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--v4-navy)'; }}
            >
              Mehr erfahren ↗
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4"
          style={{ zIndex: 9999, background: 'rgba(23,36,66,0.92)', opacity: visible ? 1 : 0, transition: 'opacity 220ms ease-out' }}
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div className="relative w-full p-8" style={{ maxWidth: 480, background: '#fff', border: '0.5px solid rgba(0,0,0,0.12)', borderRadius: 'var(--v4-radius-card)', transform: visible ? 'translateY(0)' : 'translateY(16px)', opacity: visible ? 1 : 0, transition: 'transform 220ms ease-out, opacity 220ms ease-out' }}>
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-xl leading-none v4-text-muted"
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              aria-label="Schließen"
            >×</button>

            <h3 className="text-[18px] font-semibold mb-2.5" style={{ color: 'var(--v4-navy)' }}>
              Bridge-Lösung anfragen
            </h3>

            {!sent ? (
              <>
                <p className="text-[14px] mb-6" style={{ color: 'var(--v4-body)', lineHeight: 1.65 }}>
                  Du buchst die Gäste-Lounge für €29/Monat und gibst uns dein gewünschtes Startdatum für den Pro-Plan an. Ab diesem Datum wechselst du automatisch — ohne erneutes Onboarding, ohne Datenverlust.
                </p>
                <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                  {[
                    { name: 'name', label: 'Name', type: 'text', placeholder: 'Max Mustermann' },
                    { name: 'email', label: 'E-Mail', type: 'email', placeholder: 'max@hotel.at' },
                    { name: 'switchDate', label: 'Ab wann kannst du wechseln?', type: 'text', placeholder: 'z. B. August 2025' },
                  ].map(({ name, label, type, placeholder }) => (
                    <div key={name} className="flex flex-col gap-1.5">
                      <label className="text-[13px] font-medium" style={{ color: 'var(--v4-navy)' }}>{label}</label>
                      <input
                        name={name} type={type} placeholder={placeholder} required
                        className="text-[14px] rounded-lg px-3 py-2.5 outline-none"
                        style={{ border: '1.5px solid var(--v4-border)', color: 'var(--v4-navy)' }}
                      />
                    </div>
                  ))}
                  <button
                    type="submit" disabled={pending}
                    className="mt-1 text-[14px] font-semibold py-3 rounded-[10px] text-white transition-all duration-200"
                    style={{ background: 'var(--v4-green)', border: 'none', cursor: pending ? 'not-allowed' : 'pointer', opacity: pending ? 0.7 : 1 }}
                    onMouseEnter={e => { if (!pending) (e.currentTarget as HTMLButtonElement).style.background = 'var(--v4-green-hover)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--v4-green)'; }}
                  >
                    {pending ? 'Wird gesendet …' : 'Unverbindlich anfragen'}
                  </button>
                </form>
              </>
            ) : (
              <p className="text-[15px] text-center my-6" style={{ color: 'var(--v4-body)' }}>
                Danke — wir melden uns bei dir. 👋
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}

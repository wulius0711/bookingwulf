import { verifySession } from '@/src/lib/session';
import { prisma } from '@/src/lib/prisma';
import { redirect } from 'next/navigation';
import { saveChatbotSettings, scrapeWebsite } from './actions';
import SaveButton from '../components/SaveButton';

export const dynamic = 'force-dynamic';

export default async function ChatbotPage() {
  const session = await verifySession();
  if (!session.hotelId) redirect('/admin');

  const hotel = await prisma.hotel.findUnique({
    where: { id: session.hotelId },
    select: {
      chatbotEnabled: true,
      chatbotName: true,
      chatbotColor: true,
      chatbotContext: true,
      chatbotSourceUrl: true,
      chatbotScrapedAt: true,
      chatbotFaq: true,
    },
  });

  if (!hotel) redirect('/admin');

  const faqText = hotel.chatbotFaq
    ? JSON.stringify(hotel.chatbotFaq, null, 2)
    : '';

  const scrapedAt = hotel.chatbotScrapedAt
    ? new Intl.DateTimeFormat('de-AT', { dateStyle: 'short', timeStyle: 'short' }).format(hotel.chatbotScrapedAt)
    : null;

  return (
    <main className="admin-page" style={{ maxWidth: 720 }}>
      <h1 style={{ margin: '0 0 4px' }}>Gast-Chatbot</h1>
      <p style={{ margin: '0 0 32px', fontSize: 14, color: 'var(--text-secondary)' }}>
        KI-Assistent für Gäste — beantworten Fragen, empfehlen Apartments und generieren Buchungslinks.
      </p>

      {/* ── Einstellungen ──────────────────────────────────────────── */}
      <form action={saveChatbotSettings}>
        <section className="admin-card" style={{ marginBottom: 24 }}>
          <h2 style={{ margin: '0 0 20px', fontSize: 16 }}>Einstellungen</h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

            {/* Toggle */}
            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
              <span style={{ fontSize: 14, fontWeight: 500 }}>Chatbot aktivieren</span>
              <input
                type="checkbox"
                name="chatbotEnabled"
                defaultChecked={hotel.chatbotEnabled}
                style={{ width: 18, height: 18, accentColor: 'var(--accent)', cursor: 'pointer' }}
              />
            </label>

            <hr style={{ margin: 0, border: 'none', borderTop: '1px solid var(--border)' }} />

            {/* Name */}
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
                Name des Assistenten <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>(optional)</span>
              </label>
              <input
                type="text"
                name="chatbotName"
                defaultValue={hotel.chatbotName ?? ''}
                placeholder="Buchungs-Assistent"
                style={{
                  width: '100%', padding: '9px 12px', fontSize: 14,
                  border: '1.5px solid var(--border)', borderRadius: 8,
                  background: 'var(--surface-1)', color: 'var(--text-primary)',
                  outline: 'none',
                }}
              />
            </div>

            {/* Farbe */}
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
                Akzentfarbe
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <input
                  type="color"
                  name="chatbotColor"
                  defaultValue={hotel.chatbotColor ?? '#1a1a1a'}
                  style={{ width: 40, height: 36, padding: 2, border: '1.5px solid var(--border)', borderRadius: 8, cursor: 'pointer' }}
                />
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                  Farbe des Chat-Buttons und der Nachrichten-Bubbles
                </span>
              </div>
            </div>

          </div>
        </section>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 32 }}>
          <SaveButton label="Speichern" />
        </div>
      </form>

      {/* ── Website-Kontext ────────────────────────────────────────── */}
      <section className="admin-card" style={{ marginBottom: 24 }}>
        <h2 style={{ margin: '0 0 6px', fontSize: 16 }}>Website-Kontext</h2>
        <p style={{ margin: '0 0 18px', fontSize: 13, color: 'var(--text-secondary)' }}>
          Der Chatbot liest den Inhalt eurer Website und kann damit Fragen zu Lage, Storno, Umgebung und mehr beantworten.
        </p>

        <form action={scrapeWebsite} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
                Website-URL
              </label>
              <input
                type="url"
                name="chatbotSourceUrl"
                defaultValue={hotel.chatbotSourceUrl ?? ''}
                placeholder="https://www.mein-hotel.at"
                style={{
                  width: '100%', padding: '9px 12px', fontSize: 14,
                  border: '1.5px solid var(--border)', borderRadius: 8,
                  background: 'var(--surface-1)', color: 'var(--text-primary)',
                  outline: 'none',
                }}
              />
            </div>
            <button
              type="submit"
              style={{
                padding: '9px 18px', fontSize: 14, fontWeight: 600,
                background: 'var(--accent)', color: 'var(--text-on-accent)',
                border: 'none', borderRadius: 8, cursor: 'pointer', whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              Scrapen
            </button>
          </div>
          {scrapedAt && (
            <p style={{ margin: 0, fontSize: 12, color: 'var(--text-secondary)' }}>
              Zuletzt gescrapt: {scrapedAt} · {hotel.chatbotContext?.length?.toLocaleString('de')} Zeichen
            </p>
          )}
        </form>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────── */}
      <form action={saveChatbotSettings}>
        <section className="admin-card" style={{ marginBottom: 24 }}>
          <h2 style={{ margin: '0 0 6px', fontSize: 16 }}>Manuelle FAQ <span style={{ fontSize: 13, fontWeight: 400, color: 'var(--text-secondary)' }}>(optional)</span></h2>
          <p style={{ margin: '0 0 14px', fontSize: 13, color: 'var(--text-secondary)' }}>
            Für Infos die nicht auf der Website stehen. Format: JSON-Array mit <code>question</code> und <code>answer</code>.
          </p>
          <textarea
            name="chatbotFaq"
            defaultValue={faqText}
            rows={8}
            placeholder={'[\n  {"question": "Sind Haustiere erlaubt?", "answer": "Kleine Hunde bis 10 kg sind willkommen."}\n]'}
            style={{
              width: '100%', padding: '10px 12px', fontSize: 13, fontFamily: 'monospace',
              border: '1.5px solid var(--border)', borderRadius: 8,
              background: 'var(--surface-1)', color: 'var(--text-primary)',
              outline: 'none', resize: 'vertical', boxSizing: 'border-box',
            }}
          />

          {/* Hidden fields to preserve other values when saving FAQ */}
          <input type="hidden" name="chatbotEnabled" value={hotel.chatbotEnabled ? 'on' : 'off'} />
          <input type="hidden" name="chatbotName" value={hotel.chatbotName ?? ''} />
          <input type="hidden" name="chatbotColor" value={hotel.chatbotColor ?? '#1a1a1a'} />
        </section>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <SaveButton label="FAQ speichern" />
        </div>
      </form>

    </main>
  );
}

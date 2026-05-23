import { verifySession } from '@/src/lib/session';
import { prisma } from '@/src/lib/prisma';
import { redirect } from 'next/navigation';
import { scrapeWebsite } from './actions';
import ChatbotSettingsForm from './ChatbotSettingsForm';
import FaqEditor from './FaqEditor';

export const dynamic = 'force-dynamic';

export default async function ChatbotPage() {
  const session = await verifySession();
  if (!session.hotelId) redirect('/admin');

  const hotel = await prisma.hotel.findUnique({
    where: { id: session.hotelId },
    select: {
      chatbotEnabled: true,
      chatbotName: true,
      chatbotAvatar: true,
      chatbotColor: true,
      chatbotContext: true,
      chatbotSourceUrl: true,
      chatbotScrapedAt: true,
      chatbotFaq: true,
    },
  });

  if (!hotel) redirect('/admin');

  const faqEntries = Array.isArray(hotel.chatbotFaq)
    ? (hotel.chatbotFaq as { question: string; answer: string }[])
    : [];

  const scrapedAt = hotel.chatbotScrapedAt
    ? new Intl.DateTimeFormat('de-AT', { dateStyle: 'short', timeStyle: 'short' }).format(hotel.chatbotScrapedAt)
    : null;

  return (
    <main className="admin-page" style={{ maxWidth: 720 }}>
      <h1 style={{ margin: '0 0 4px' }}>Gast-Chatbot</h1>
      <p style={{ margin: '0 0 32px', fontSize: 14, color: 'var(--text-secondary)' }}>
        KI-Assistent für Gäste — beantwortet Fragen, empfiehlt Apartments und generiert Buchungslinks.
      </p>

      {/* ── Einstellungen ──────────────────────────────────────────── */}
      <ChatbotSettingsForm
        initialEnabled={hotel.chatbotEnabled}
        initialName={hotel.chatbotName ?? ''}
        initialAvatar={hotel.chatbotAvatar ?? null}
        initialColor={hotel.chatbotColor ?? '#1a1a1a'}
      />

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
      <FaqEditor
        initialFaq={faqEntries}
        chatbotEnabled={hotel.chatbotEnabled}
        chatbotName={hotel.chatbotName ?? ''}
        chatbotColor={hotel.chatbotColor ?? '#1a1a1a'}
      />

    </main>
  );
}

'use client';

import { useState } from 'react';
import { saveChatbotSettings } from './actions';

type FaqEntry = { question: string; answer: string };

export default function FaqEditor({
  initialFaq,
  chatbotEnabled,
  chatbotName,
  chatbotColor,
}: {
  initialFaq: FaqEntry[];
  chatbotEnabled: boolean;
  chatbotName: string;
  chatbotColor: string;
}) {
  const [entries, setEntries] = useState<FaqEntry[]>(
    initialFaq.length > 0 ? initialFaq : [],
  );
  const [saved, setSaved] = useState(false);

  function update(i: number, field: keyof FaqEntry, value: string) {
    setEntries(prev => prev.map((e, idx) => idx === i ? { ...e, [field]: value } : e));
  }

  function remove(i: number) {
    setEntries(prev => prev.filter((_, idx) => idx !== i));
  }

  function add() {
    setEntries(prev => [...prev, { question: '', answer: '' }]);
  }

  async function handleSubmit() {
    const valid = entries.filter(e => e.question.trim() && e.answer.trim());
    const fd = new FormData();
    fd.set('chatbotEnabled', chatbotEnabled ? 'on' : 'off');
    fd.set('chatbotName', chatbotName);
    fd.set('chatbotColor', chatbotColor);
    fd.set('chatbotFaq', valid.length > 0 ? JSON.stringify(valid) : '');
    await saveChatbotSettings(fd);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <section className="admin-card" style={{ marginBottom: 24 }}>
      <h2 style={{ margin: '0 0 6px', fontSize: 16 }}>
        Häufige Fragen{' '}
        <span style={{ fontSize: 13, fontWeight: 400, color: 'var(--text-secondary)' }}>(optional)</span>
      </h2>
      <p style={{ margin: '0 0 18px', fontSize: 13, color: 'var(--text-secondary)' }}>
        Für Infos die nicht auf der Website stehen — z.B. Haustiere, Parken, lokale Tipps.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {entries.map((entry, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: 14, background: 'var(--surface-2)', borderRadius: 10 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                type="text"
                value={entry.question}
                onChange={e => update(i, 'question', e.target.value)}
                placeholder="Frage"
                style={{
                  flex: 1, padding: '8px 10px', fontSize: 13, fontWeight: 500,
                  border: '1.5px solid var(--border)', borderRadius: 7,
                  background: 'var(--surface-1)', color: 'var(--text-primary)', outline: 'none',
                }}
              />
              <button
                type="button"
                onClick={() => remove(i)}
                style={{ padding: '6px 10px', fontSize: 13, border: 'none', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', borderRadius: 6 }}
              >
                ✕
              </button>
            </div>
            <textarea
              value={entry.answer}
              onChange={e => update(i, 'answer', e.target.value)}
              placeholder="Antwort"
              rows={2}
              style={{
                width: '100%', padding: '8px 10px', fontSize: 13,
                border: '1.5px solid var(--border)', borderRadius: 7,
                background: 'var(--surface-1)', color: 'var(--text-primary)',
                outline: 'none', resize: 'vertical', boxSizing: 'border-box',
              }}
            />
          </div>
        ))}

        <button
          type="button"
          onClick={add}
          style={{
            padding: '8px 14px', fontSize: 13, fontWeight: 500,
            border: '1.5px dashed var(--border)', borderRadius: 8,
            background: 'transparent', color: 'var(--text-secondary)',
            cursor: 'pointer', textAlign: 'left',
          }}
        >
          + Frage hinzufügen
        </button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 12, marginTop: 18 }}>
        {saved && <span style={{ fontSize: 13, color: '#16a34a', fontWeight: 500 }}>✓ Gespeichert</span>}
        <button
          type="button"
          onClick={handleSubmit}
          className="btn-shine"
          style={{
            padding: '10px 20px', fontSize: 14, fontWeight: 600,
            background: 'var(--accent)', color: 'var(--text-on-accent)',
            border: 'none', borderRadius: 8, cursor: 'pointer',
          }}
        >
          FAQ speichern
        </button>
      </div>
    </section>
  );
}

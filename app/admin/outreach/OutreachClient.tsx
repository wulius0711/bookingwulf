'use client';

import { useState, useMemo } from 'react';

type Lead = {
  id: number;
  betrieb: string;
  inhaber: string | null;
  email: string | null;
  phone: string | null;
  kontaktPer: string | null;
  region: string | null;
  website: string | null;
  status: string;
  sentAt: Date | string | null;
  followUpAt: Date | string | null;
  notes: string | null;
  nextStep: string | null;
  createdAt: Date | string;
};

const STATUS_LABELS: Record<string, string> = {
  'neu': 'Neu',
  'gesendet': 'Gesendet',
  'follow-up': 'Follow-up',
  'geantwortet': 'Geantwortet',
  'demo': 'Demo',
  'kein-interesse': 'Kein Interesse',
  'abgeschlossen': 'Abgeschlossen',
};

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  'neu':            { bg: '#f3f4f6', color: '#374151' },
  'gesendet':       { bg: '#dbeafe', color: '#1d4ed8' },
  'follow-up':      { bg: '#fef3c7', color: '#92400e' },
  'geantwortet':    { bg: '#d1fae5', color: '#065f46' },
  'demo':           { bg: '#ede9fe', color: '#5b21b6' },
  'kein-interesse': { bg: '#fee2e2', color: '#991b1b' },
  'abgeschlossen':  { bg: '#f0fdf4', color: '#166534' },
};

const FILTER_TABS = ['alle', 'neu', 'gesendet', 'follow-up', 'geantwortet', 'demo', 'kein-interesse', 'abgeschlossen'];

type Props = { initialLeads: Lead[]; zohoConfigured: boolean };

export default function OutreachClient({ initialLeads, zohoConfigured }: Props) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [filter, setFilter] = useState('alle');
  const [sending, setSending] = useState<number | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<Lead>>({});
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null);
  const [newLeadOpen, setNewLeadOpen] = useState(false);
  const [newLead, setNewLead] = useState({ betrieb: '', inhaber: '', email: '', phone: '', kontaktPer: '', region: '', website: '' });
  const [bulkSending, setBulkSending] = useState(false);

  const filtered = useMemo(() =>
    filter === 'alle' ? leads : leads.filter(l => l.status === filter),
    [leads, filter]
  );

  const counts = useMemo(() => {
    const c: Record<string, number> = { alle: leads.length };
    FILTER_TABS.slice(1).forEach(s => { c[s] = leads.filter(l => l.status === s).length; });
    return c;
  }, [leads]);

  function showToast(msg: string, type: 'ok' | 'err') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  async function sendEmail(lead: Lead) {
    if (!lead.email) return showToast('Keine E-Mail-Adresse hinterlegt.', 'err');
    setSending(lead.id);
    try {
      const r = await fetch(`/api/admin/outreach/${lead.id}/send`, { method: 'POST' });
      const d = await r.json();
      if (!r.ok) return showToast(d.error || 'Fehler beim Senden.', 'err');
      setLeads(prev => prev.map(l => l.id === lead.id ? d.lead : l));
      showToast(`E-Mail an ${lead.betrieb} gesendet.`, 'ok');
    } finally {
      setSending(null);
    }
  }

  async function updateStatus(lead: Lead, status: string) {
    const r = await fetch(`/api/admin/outreach/${lead.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    const d = await r.json();
    if (!r.ok) return showToast(d.error || 'Fehler.', 'err');
    setLeads(prev => prev.map(l => l.id === lead.id ? d.lead : l));
  }

  async function saveEdit(id: number) {
    const r = await fetch(`/api/admin/outreach/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editData),
    });
    const d = await r.json();
    if (!r.ok) return showToast(d.error || 'Fehler.', 'err');
    setLeads(prev => prev.map(l => l.id === id ? d.lead : l));
    setEditId(null);
    showToast('Gespeichert.', 'ok');
  }

  async function deleteLead(id: number) {
    if (!confirm('Lead wirklich löschen?')) return;
    const r = await fetch(`/api/admin/outreach/${id}`, { method: 'DELETE' });
    if (!r.ok) return showToast('Fehler beim Löschen.', 'err');
    setLeads(prev => prev.filter(l => l.id !== id));
    showToast('Gelöscht.', 'ok');
  }

  async function createLead() {
    if (!newLead.betrieb.trim()) return showToast('Betrieb ist Pflichtfeld.', 'err');
    const r = await fetch('/api/admin/outreach', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newLead),
    });
    const d = await r.json();
    if (!r.ok) return showToast(d.error || 'Fehler.', 'err');
    setLeads(prev => [...prev, d.lead]);
    setNewLead({ betrieb: '', inhaber: '', email: '', phone: '', kontaktPer: '', region: '', website: '' });
    setNewLeadOpen(false);
    showToast('Lead angelegt.', 'ok');
  }

  async function bulkSend() {
    const pending = leads.filter(l => l.status === 'neu' && l.email);
    if (!pending.length) return showToast('Keine offenen Leads mit E-Mail-Adresse.', 'err');
    if (!confirm(`${pending.length} E-Mails versenden?`)) return;
    setBulkSending(true);
    let ok = 0; let err = 0;
    for (const lead of pending) {
      const r = await fetch(`/api/admin/outreach/${lead.id}/send`, { method: 'POST' });
      const d = await r.json();
      if (r.ok) { setLeads(prev => prev.map(l => l.id === lead.id ? d.lead : l)); ok++; }
      else err++;
      await new Promise(res => setTimeout(res, 800));
    }
    setBulkSending(false);
    showToast(`${ok} gesendet${err ? `, ${err} fehlgeschlagen` : ''}.`, err ? 'err' : 'ok');
  }

  const fmtDate = (d: Date | string | null) => d ? new Date(d).toLocaleDateString('de-AT') : '–';

  return (
    <div style={{ padding: '32px', maxWidth: 1200 }}>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 24, right: 24, zIndex: 9999,
          background: toast.type === 'ok' ? '#dcfce7' : '#fee2e2',
          color: toast.type === 'ok' ? '#166534' : '#991b1b',
          border: `1px solid ${toast.type === 'ok' ? '#86efac' : '#fca5a5'}`,
          padding: '10px 18px', borderRadius: 10, fontSize: 14, fontWeight: 500,
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        }}>
          {toast.msg}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>Outreach</h1>
          <p style={{ margin: 0, fontSize: 14, color: '#6b7280' }}>{leads.length} potenzielle Kunden</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => setNewLeadOpen(true)}
            style={{ padding: '8px 16px', background: 'var(--surface-3)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', color: 'var(--text-muted)' }}
          >
            + Lead
          </button>
          {zohoConfigured ? (
            <button
              onClick={bulkSend}
              disabled={bulkSending}
              style={{ padding: '8px 16px', background: '#111827', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: bulkSending ? 'not-allowed' : 'pointer', opacity: bulkSending ? 0.7 : 1 }}
            >
              {bulkSending ? 'Sende…' : `Alle neuen anschreiben (${counts['neu'] || 0})`}
            </button>
          ) : (
            <div style={{ padding: '8px 14px', background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: 8, fontSize: 13, color: '#92400e' }}>
              ⚠ ZOHO_SMTP_USER / ZOHO_SMTP_PASS in .env.local setzen
            </div>
          )}
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
        {FILTER_TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            style={{
              padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600,
              border: '1px solid',
              borderColor: filter === tab ? '#111827' : 'var(--border)',
              background: filter === tab ? '#111827' : 'var(--surface)',
              color: filter === tab ? '#fff' : 'var(--text-muted)',
              cursor: 'pointer',
            }}
          >
            {tab === 'alle' ? 'Alle' : STATUS_LABELS[tab]} {counts[tab] > 0 && `(${counts[tab]})`}
          </button>
        ))}
      </div>

      {/* New lead form */}
      {newLeadOpen && (
        <div style={{ marginBottom: 20, padding: 20, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 12 }}>
            {(['betrieb', 'inhaber', 'email', 'phone', 'region', 'website'] as const).map(field => (
              <input key={field} placeholder={{ betrieb: 'Betrieb', inhaber: 'Inhaber', email: 'E-Mail', phone: 'Telefon', region: 'Region', website: 'Website' }[field]} value={newLead[field]}
                onChange={e => setNewLead(p => ({ ...p, [field]: e.target.value }))}
                style={{ padding: '7px 10px', border: '1px solid var(--border)', borderRadius: 7, fontSize: 13 }} />
            ))}
            <select value={newLead.kontaktPer} onChange={e => setNewLead(p => ({ ...p, kontaktPer: e.target.value }))}
              style={{ padding: '7px 10px', border: '1px solid var(--border)', borderRadius: 7, fontSize: 13, color: newLead.kontaktPer ? 'var(--text-primary)' : '#9ca3af' }}>
              <option value="">Kontakt per…</option>
              <option value="E-Mail">E-Mail</option>
              <option value="Telefon">Telefon</option>
              <option value="Persönlich">Persönlich</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={createLead} className="btn-shine" style={{ padding: '7px 16px', background: '#111827', color: '#fff', border: 'none', borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Speichern</button>
            <button onClick={() => setNewLeadOpen(false)} className="btn-shine" style={{ padding: '7px 16px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 7, fontSize: 13, cursor: 'pointer' }}>Abbrechen</button>
          </div>
        </div>
      )}

      {/* Table */}
      <div style={{ overflowX: 'auto', borderRadius: 12, border: '1px solid var(--border)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
              {['Betrieb', 'Inhaber', 'E-Mail', 'Telefon', 'Kontakt per', 'Region', 'Status', 'Gesendet', 'Aktionen'].map(h => (
                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 700, color: 'var(--text-muted)', fontSize: 12, whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((lead, i) => {
              const isEditing = editId === lead.id;
              const sc = STATUS_COLORS[lead.status] || STATUS_COLORS['neu'];
              return (
                <tr key={lead.id} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'var(--surface)' : 'var(--surface-2)' }}>
                  <td style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {isEditing
                      ? <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          <input value={editData.betrieb ?? ''} onChange={e => setEditData(p => ({ ...p, betrieb: e.target.value }))} placeholder="Betrieb" style={{ width: 130, padding: '4px 7px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 12 }} />
                          <input value={editData.website ?? ''} onChange={e => setEditData(p => ({ ...p, website: e.target.value }))} placeholder="Website" style={{ width: 130, padding: '4px 7px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 12 }} />
                        </div>
                      : <div>
                          {lead.betrieb}
                          {lead.website && <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{lead.website}</div>}
                        </div>
                    }
                  </td>
                  <td style={{ padding: '10px 14px', color: 'var(--text-muted)' }}>
                    {isEditing
                      ? <input value={editData.inhaber ?? ''} onChange={e => setEditData(p => ({ ...p, inhaber: e.target.value }))} style={{ width: 120, padding: '4px 7px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 12 }} />
                      : (lead.inhaber || '–')
                    }
                  </td>
                  <td style={{ padding: '10px 14px', color: 'var(--text-muted)' }}>
                    {isEditing
                      ? <input value={editData.email ?? ''} onChange={e => setEditData(p => ({ ...p, email: e.target.value }))} style={{ width: 160, padding: '4px 7px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 12 }} />
                      : lead.email
                        ? <a href={`mailto:${lead.email}`} style={{ color: '#1d4ed8', textDecoration: 'none' }}>{lead.email}</a>
                        : <span style={{ color: '#d1d5db' }}>–</span>
                    }
                  </td>
                  <td style={{ padding: '10px 14px', color: 'var(--text-muted)' }}>
                    {isEditing
                      ? <input value={editData.phone ?? ''} onChange={e => setEditData(p => ({ ...p, phone: e.target.value }))} style={{ width: 120, padding: '4px 7px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 12 }} />
                      : lead.phone
                        ? <a href={`tel:${lead.phone}`} style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>{lead.phone}</a>
                        : <span style={{ color: '#d1d5db' }}>–</span>
                    }
                  </td>
                  <td style={{ padding: '10px 14px', color: 'var(--text-muted)' }}>
                    {isEditing
                      ? <select value={editData.kontaktPer ?? ''} onChange={e => setEditData(p => ({ ...p, kontaktPer: e.target.value }))} style={{ padding: '4px 7px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 12 }}>
                          <option value="">–</option>
                          <option value="E-Mail">E-Mail</option>
                          <option value="Telefon">Telefon</option>
                          <option value="Persönlich">Persönlich</option>
                        </select>
                      : <span style={{ color: lead.kontaktPer ? 'var(--text-muted)' : '#d1d5db' }}>{lead.kontaktPer || '–'}</span>
                    }
                  </td>
                  <td style={{ padding: '10px 14px', color: '#6b7280' }}>
                    {isEditing
                      ? <input value={editData.region ?? ''} onChange={e => setEditData(p => ({ ...p, region: e.target.value }))} placeholder="Region" style={{ width: 110, padding: '4px 7px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 12 }} />
                      : (lead.region || '–')
                    }
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <select
                      value={lead.status}
                      onChange={e => updateStatus(lead, e.target.value)}
                      style={{ padding: '4px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700, border: 'none', background: sc.bg, color: sc.color, cursor: 'pointer' }}
                    >
                      {Object.entries(STATUS_LABELS).map(([v, l]) => (
                        <option key={v} value={v}>{l}</option>
                      ))}
                    </select>
                  </td>
                  <td style={{ padding: '10px 14px', color: '#6b7280', whiteSpace: 'nowrap' }}>{fmtDate(lead.sentAt)}</td>
                  <td style={{ padding: '10px 14px' }}>
                    {isEditing ? (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => saveEdit(lead.id)} className="btn-shine" style={{ padding: '4px 10px', background: '#111827', color: '#fff', border: 'none', borderRadius: 6, fontSize: 12, cursor: 'pointer' }}>Speichern</button>
                        <button onClick={() => setEditId(null)} className="btn-shine" style={{ padding: '4px 10px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 6, fontSize: 12, cursor: 'pointer' }}>Abbrechen</button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        {lead.status !== 'gesendet' && lead.status !== 'kein-interesse' && lead.status !== 'abgeschlossen' && zohoConfigured && (
                          <button
                            onClick={() => { if (window.confirm(`E-Mail an ${lead.email} senden?`)) sendEmail(lead); }}
                            disabled={sending === lead.id || !lead.email}
                            title={!lead.email ? 'Keine E-Mail-Adresse' : 'E-Mail senden'}
                            style={{
                              padding: '4px 10px', background: '#1d4ed8', color: '#fff', border: 'none',
                              borderRadius: 6, fontSize: 12, fontWeight: 600,
                              cursor: (sending === lead.id || !lead.email) ? 'not-allowed' : 'pointer',
                              opacity: !lead.email ? 0.4 : 1,
                            }}
                          >
                            {sending === lead.id ? '…' : 'Senden'}
                          </button>
                        )}
                        <button
                          onClick={() => { setEditId(lead.id); setEditData({ betrieb: lead.betrieb, inhaber: lead.inhaber ?? '', email: lead.email ?? '', phone: lead.phone ?? '', kontaktPer: lead.kontaktPer ?? '', website: lead.website ?? '', region: lead.region ?? '' }); }}
                          style={{ padding: '4px 8px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 6, fontSize: 12, cursor: 'pointer', color: 'var(--text-muted)' }}
                        >
                          Bearbeiten
                        </button>
                        <button
                          onClick={() => deleteLead(lead.id)}
                          style={{ padding: '4px 8px', background: 'transparent', border: '1px solid #fee2e2', borderRadius: 6, fontSize: 12, cursor: 'pointer', color: '#dc2626' }}
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={9} style={{ padding: 32, textAlign: 'center', color: '#9ca3af' }}>Keine Leads in diesem Status.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

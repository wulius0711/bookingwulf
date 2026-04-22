'use client';

import { useState } from 'react';

function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <pre style={{ padding: '16px 18px', background: '#0f172a', color: '#e2e8f0', borderRadius: 12, fontSize: 13, lineHeight: 1.6, overflowX: 'auto', margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
        {code}
      </pre>
      <button
        type="button"
        onClick={() => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
        style={{ position: 'absolute', top: 10, right: 10, padding: '6px 14px', borderRadius: 8, border: 'none', background: copied ? '#22c55e' : '#334155', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s ease' }}
      >
        {copied ? 'Kopiert!' : 'Kopieren'}
      </button>
    </div>
  );
}

export function EmbedCode({ code }: { code: string }) {
  return <CodeBlock code={code} />;
}

export function MiniEmbedCode({ baseCode }: { baseCode: string }) {
  const [target, setTarget] = useState('');
  const code = baseCode + (target ? ` data-target="${target}"` : '') + '></script>';
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <div>
        <label style={{ fontSize: 12, fontWeight: 700, color: '#4b5563', letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
          Ziel-URL <span style={{ fontWeight: 400, textTransform: 'none', color: '#9ca3af' }}>(Seite auf der das Haupt-Widget eingebunden ist)</span>
        </label>
        <input
          type="url"
          value={target}
          onChange={e => setTarget(e.target.value)}
          placeholder="https://ihre-website.de/buchen"
          style={{ width: '100%', padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, color: '#111', boxSizing: 'border-box' }}
        />
      </div>
      <CodeBlock code={code} />
    </div>
  );
}

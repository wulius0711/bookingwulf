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


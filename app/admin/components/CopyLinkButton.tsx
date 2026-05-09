'use client';

import { useState } from 'react';

export default function CopyLinkButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      style={{ fontSize: 12, padding: '3px 10px', borderRadius: 8, border: '1px solid #d1d5db', background: copied ? '#dcfce7' : '#fff', color: copied ? '#15803d' : '#374151', cursor: 'pointer', fontWeight: copied ? 700 : 400 }}
    >
      {copied ? '✓ Kopiert' : 'Link kopieren'}
    </button>
  );
}

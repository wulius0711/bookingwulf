'use client';

import { useState } from 'react';

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[äöü]/g, (match) => ({ ä: 'ae', ö: 'oe', ü: 'ue' }[match] || match))
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

interface NameSlugFieldsProps {
  fieldStyle: React.CSSProperties;
  labelStyle: React.CSSProperties;
  inputStyle: React.CSSProperties;
}

export function NameSlugFields({ fieldStyle, labelStyle, inputStyle }: NameSlugFieldsProps) {
  const [slug, setSlug] = useState('');
  const [autoSlug, setAutoSlug] = useState(true);

  return (
    <>
      <div style={fieldStyle}>
        <label style={labelStyle}>Name *</label>
        <input
          name="name"
          required
          style={inputStyle}
          onChange={(e) => {
            if (autoSlug) setSlug(generateSlug(e.target.value));
          }}
        />
      </div>
      <input type="hidden" name="slug" value={slug} />
    </>
  );
}

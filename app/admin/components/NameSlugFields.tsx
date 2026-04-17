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
  rowStyle: React.CSSProperties;
  labelStyle: React.CSSProperties;
  inputStyle: React.CSSProperties;
}

export function NameSlugFields({ rowStyle, labelStyle, inputStyle }: NameSlugFieldsProps) {
  const [slug, setSlug] = useState('');
  const [autoSlug, setAutoSlug] = useState(true);

  return (
    <>
      <div style={rowStyle}>
        <label style={labelStyle}>Name</label>
        <input
          name="name"
          required
          style={inputStyle}
          onChange={(e) => {
            if (autoSlug) {
              setSlug(generateSlug(e.target.value));
            }
          }}
        />
      </div>

      <div style={rowStyle}>
        <label style={labelStyle}>Slug</label>
        <input
          name="slug"
          required
          style={inputStyle}
          value={slug}
          onChange={(e) => {
            setAutoSlug(false);
            setSlug(e.target.value);
          }}
        />
      </div>
    </>
  );
}

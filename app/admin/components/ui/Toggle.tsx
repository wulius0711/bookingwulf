'use client';

import './ui.css';
import { useId, type ChangeEvent } from 'react';

export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  hint?: string;
  name?: string;
  disabled?: boolean;
  className?: string;
}

export default function Toggle({
  checked,
  onChange,
  label,
  hint,
  name,
  disabled = false,
  className = '',
}: ToggleProps) {
  const id = useId();
  const hintId = `${id}-hint`;

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    onChange(e.target.checked);
  }

  return (
    <div
      className={className}
      style={{ display: 'grid', gap: 'var(--space-1)' }}
    >
      <label
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-3)',
          cursor: disabled ? 'not-allowed' : 'pointer',
        }}
      >
        {/* Hidden checkbox — screen readers announce it as a switch */}
        <input
          id={id}
          type="checkbox"
          role="switch"
          name={name}
          checked={checked}
          onChange={handleChange}
          disabled={disabled}
          aria-checked={checked}
          aria-describedby={hint ? hintId : undefined}
          className="ui-sr-only"
        />

        {/* Visual pill track — aria-hidden because the input handles announcement */}
        <span
          className="ui-toggle-track"
          data-checked={checked ? 'true' : 'false'}
          data-disabled={disabled ? 'true' : 'false'}
          aria-hidden="true"
        >
          <span className="ui-toggle-thumb" />
        </span>

        <span
          style={{
            fontSize: 'var(--text-base)',
            color: disabled ? 'var(--text-disabled)' : 'var(--text-primary)',
            lineHeight: 'var(--leading-tight)',
          }}
        >
          {label}
        </span>
      </label>

      {hint && (
        <p
          id={hintId}
          style={{
            margin: 0,
            fontSize: 'var(--text-xs)',
            color: 'var(--text-secondary)',
            lineHeight: 'var(--leading-normal)',
            paddingLeft: 'calc(44px + var(--space-3))',
          }}
        >
          {hint}
        </p>
      )}
    </div>
  );
}

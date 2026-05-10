'use client';

import './ui.css';
import { useId, forwardRef, type SelectHTMLAttributes } from 'react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: SelectOption[];
  hint?: string;
  error?: string;
  placeholder?: string;
  className?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  {
    label,
    options,
    hint,
    error,
    required,
    placeholder,
    id: idProp,
    className = '',
    style,
    ...rest
  },
  ref,
) {
  const generatedId = useId();
  const id = idProp ?? generatedId;
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;

  const describedBy = [hint ? hintId : null, error ? errorId : null]
    .filter(Boolean)
    .join(' ') || undefined;

  return (
    <div
      className={className}
      style={{ display: 'grid', gap: 'var(--space-1)', ...style }}
    >
      <label
        htmlFor={id}
        style={{
          fontSize: 'var(--text-sm)',
          fontWeight: 'var(--font-weight-semibold)',
          color: 'var(--text-primary)',
          display: 'flex',
          gap: 'var(--space-1)',
          alignItems: 'center',
        }}
      >
        {label}
        {required && (
          <span aria-hidden="true" style={{ color: 'var(--danger)' }}>*</span>
        )}
      </label>

      {hint && (
        <p
          id={hintId}
          style={{
            margin: 0,
            fontSize: 'var(--text-xs)',
            color: 'var(--text-secondary)',
            lineHeight: 'var(--leading-normal)',
          }}
        >
          {hint}
        </p>
      )}

      <div className="ui-select-wrapper">
        <select
          ref={ref}
          id={id}
          required={required}
          aria-required={required ? 'true' : undefined}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={describedBy}
          className="ui-select-control"
          {...rest}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Custom chevron — pointer-events: none in CSS so select stays clickable */}
        <span className="ui-select-chevron" aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M4 6l4 4 4-4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </div>

      {error && (
        <p
          id={errorId}
          role="alert"
          style={{
            margin: 0,
            fontSize: 'var(--text-xs)',
            color: 'var(--danger)',
            lineHeight: 'var(--leading-normal)',
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
});

Select.displayName = 'Select';
export default Select;

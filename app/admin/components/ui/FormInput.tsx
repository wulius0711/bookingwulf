'use client';

import './ui.css';
import { useId, forwardRef, type InputHTMLAttributes } from 'react';

export interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
  error?: string;
  className?: string;
}

const FormInput = forwardRef<HTMLInputElement, FormInputProps>(function FormInput(
  { label, hint, error, required, id: idProp, className = '', style, ...rest },
  ref,
) {
  const generatedId = useId();
  const id = idProp ?? generatedId;
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;

  const describedBy = [
    hint ? hintId : null,
    error ? errorId : null,
  ]
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
          <span aria-hidden="true" style={{ color: 'var(--danger)', fontSize: 'var(--text-sm)' }}>
            *
          </span>
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

      <input
        ref={ref}
        id={id}
        required={required}
        aria-required={required ? 'true' : undefined}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={describedBy}
        className="ui-input"
        {...rest}
      />

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

FormInput.displayName = 'FormInput';
export default FormInput;

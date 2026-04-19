'use client';

import { useRef } from 'react';

type Props = {
  requestId: number;
  currentStatus: string;
  guestEmail: string | null;
  action: (formData: FormData) => Promise<void>;
};

const STATUS_OPTIONS = [
  { value: 'new', label: 'Neu' },
  { value: 'answered', label: 'Beantwortet' },
  { value: 'booked', label: 'Gebucht' },
  { value: 'cancelled', label: 'Storniert' },
];

export default function StatusButtons({ requestId, currentStatus, guestEmail, action }: Props) {
  const formRefs = useRef<Record<string, HTMLFormElement | null>>({});

  function handleClick(e: React.MouseEvent, status: string, statusLabel: string) {
    const sendsEmail = status !== 'answered';
    const emailNote = sendsEmail && guestEmail ? `\n\nDer Gast (${guestEmail}) wird per E-Mail informiert.` : '';
    const confirmed = window.confirm(`Status auf „${statusLabel}" setzen?${emailNote}`);
    if (!confirmed) e.preventDefault();
  }

  return (
    <div style={{ display: 'flex', gap: 10, marginTop: 10, flexWrap: 'wrap' }}>
      {STATUS_OPTIONS.map((s) => {
        const active = currentStatus === s.value;
        const disabled = active || (s.value === 'new' && currentStatus !== 'new');
        const showPopup = s.value !== 'new' && s.value !== 'answered';
        return (
          <form
            key={s.value}
            ref={(el) => { formRefs.current[s.value] = el; }}
            action={action}
          >
            <input type="hidden" name="id" value={requestId} />
            <input type="hidden" name="status" value={s.value} />
            <button
              type="submit"
              disabled={disabled}
              onClick={(e) => !disabled && showPopup && handleClick(e, s.value, s.label)}
              style={{
                padding: '10px 14px',
                borderRadius: 8,
                border: active ? '1px solid #111' : '1px solid #ccc',
                background: active ? '#111' : '#fff',
                color: disabled ? '#aaa' : active ? '#fff' : '#111',
                cursor: disabled ? 'default' : 'pointer',
              }}
            >
              {s.label}
            </button>
          </form>
        );
      })}
    </div>
  );
}

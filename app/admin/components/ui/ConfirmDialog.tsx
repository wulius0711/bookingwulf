'use client';

import './ui.css';
import { useState, type ChangeEvent } from 'react';
import Modal from './Modal';
import Button from './Button';

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description: string;
  confirmLabel?: string;
  dangerous?: boolean;
  /** When provided the user must type this exact string to enable the confirm button. */
  confirmText?: string;
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Bestätigen',
  dangerous = false,
  confirmText,
}: ConfirmDialogProps) {
  const [typed, setTyped] = useState('');
  const [loading, setLoading] = useState(false);

  const requiresTyping = dangerous && !!confirmText;
  const confirmEnabled = !requiresTyping || typed === confirmText;

  async function handleConfirm() {
    setLoading(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setLoading(false);
      setTyped('');
    }
  }

  function handleClose() {
    setTyped('');
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={title} size="sm">
      <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
        <p
          style={{
            margin: 0,
            fontSize: 'var(--text-base)',
            color: 'var(--text-secondary)',
            lineHeight: 'var(--leading-normal)',
          }}
        >
          {description}
        </p>

        {requiresTyping && (
          <div style={{ display: 'grid', gap: 'var(--space-2)' }}>
            <label
              style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--text-primary)',
                fontWeight: 'var(--font-weight-medium)',
              }}
            >
              Zur Bestätigung{' '}
              <strong
                style={{
                  fontFamily: 'monospace',
                  background: 'var(--bg-surface-raised)',
                  padding: '1px 4px',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                {confirmText}
              </strong>{' '}
              eingeben:
            </label>
            <input
              className="ui-input"
              type="text"
              value={typed}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setTyped(e.target.value)}
              placeholder={confirmText}
              autoComplete="off"
              spellCheck={false}
            />
          </div>
        )}

        <div className="ui-modal-footer" style={{ padding: 0, border: 'none' }}>
          <Button variant="ghost" onClick={handleClose} disabled={loading}>
            Abbrechen
          </Button>
          <Button
            variant={dangerous ? 'danger' : 'primary'}
            onClick={handleConfirm}
            loading={loading}
            disabled={!confirmEnabled}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

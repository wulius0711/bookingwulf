import './ui.css';
import type { ReactNode } from 'react';
import Button from './Button';

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div className={`ui-empty ${className}`} role="status">
      {icon && (
        <div className="ui-empty-icon" aria-hidden="true">
          {icon}
        </div>
      )}

      <p className="ui-empty-title">{title}</p>

      {description && (
        <p className="ui-empty-desc">{description}</p>
      )}

      {action && (
        <Button variant="ghost" size="md" onClick={action.onClick} style={{ marginTop: 'var(--space-2)' }}>
          {action.label}
        </Button>
      )}
    </div>
  );
}

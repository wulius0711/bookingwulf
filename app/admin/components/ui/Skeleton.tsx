import './ui.css';
import type { CSSProperties } from 'react';

interface SkeletonTextProps {
  width?: string | number;
  className?: string;
  style?: CSSProperties;
}

function SkeletonText({ width = '100%', className = '', style }: SkeletonTextProps) {
  return (
    <span
      className={`ui-skeleton ${className}`}
      aria-hidden="true"
      style={{
        display: 'block',
        height: 'var(--text-base)',
        width,
        borderRadius: 'var(--radius-sm)',
        ...style,
      }}
    />
  );
}

interface SkeletonCardProps {
  height?: string | number;
  className?: string;
  style?: CSSProperties;
}

function SkeletonCard({ height = 120, className = '', style }: SkeletonCardProps) {
  return (
    <div
      className={`ui-skeleton ${className}`}
      aria-hidden="true"
      style={{
        width: '100%',
        height,
        borderRadius: 'var(--radius-xl)',
        ...style,
      }}
    />
  );
}

function SkeletonRow({ className = '', style }: { className?: string; style?: CSSProperties }) {
  return (
    <span
      className={`ui-skeleton ${className}`}
      aria-hidden="true"
      style={{
        display: 'block',
        height: 14,
        width: `${60 + Math.floor(Math.random() * 30)}%`,
        borderRadius: 'var(--radius-sm)',
        ...style,
      }}
    />
  );
}

const Skeleton = Object.assign(function Skeleton() { return null; }, {
  Text: SkeletonText,
  Card: SkeletonCard,
  Row: SkeletonRow,
});

export default Skeleton;

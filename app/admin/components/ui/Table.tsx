'use client';

import './ui.css';
import type { ReactNode, CSSProperties } from 'react';
import Skeleton from './Skeleton';

export interface Column<T> {
  key: string;
  label: string;
  render?: (row: T, index: number) => ReactNode;
  align?: 'left' | 'center' | 'right';
  width?: string | number;
}

export interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyState?: ReactNode;
  getRowKey?: (row: T, index: number) => string | number;
  className?: string;
  style?: CSSProperties;
}

const alignStyle: Record<string, CSSProperties['textAlign']> = {
  left: 'left',
  center: 'center',
  right: 'right',
};

export default function Table<T extends object>({
  columns,
  data,
  loading = false,
  emptyState,
  getRowKey,
  className = '',
  style,
}: TableProps<T>) {
  return (
    <div style={{ overflowX: 'auto', ...style }} className={className}>
      <table className="ui-table" aria-busy={loading ? 'true' : undefined}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                style={{
                  textAlign: col.align ? alignStyle[col.align] : 'left',
                  width: col.width,
                }}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} aria-hidden="true">
                {columns.map((col) => (
                  <td key={col.key}>
                    <Skeleton.Row />
                  </td>
                ))}
              </tr>
            ))
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={{ padding: 0, border: 'none' }}>
                {emptyState}
              </td>
            </tr>
          ) : (
            data.map((row, i) => {
              const key = getRowKey ? getRowKey(row, i) : i;
              return (
                <tr key={key}>
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      style={{ textAlign: col.align ? alignStyle[col.align] : 'left' }}
                    >
                      {col.render
                        ? col.render(row, i)
                        : String((row as Record<string, unknown>)[col.key] ?? '')}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

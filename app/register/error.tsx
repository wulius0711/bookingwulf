'use client';

export default function RegisterError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main style={{ minHeight: '100vh', background: '#f5f5f7', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ maxWidth: 500, width: '100%', background: '#fff', border: '1px solid #fecaca', borderRadius: 16, padding: 32 }}>
        <h2 style={{ margin: '0 0 8px', color: '#dc2626', fontSize: 18 }}>Fehler beim Laden</h2>
        <pre style={{ fontSize: 12, background: '#fef2f2', padding: 16, borderRadius: 8, overflowX: 'auto', color: '#7f1d1d' }}>
          {error.message || '(no message)'}
          {'\n'}digest: {error.digest || 'none'}
        </pre>
        <button onClick={reset} style={{ marginTop: 16, padding: '8px 20px', borderRadius: 8, background: '#111', color: '#fff', border: 'none', cursor: 'pointer' }}>
          Erneut versuchen
        </button>
      </div>
    </main>
  );
}

import Link from 'next/link';

export default function GastRootPage() {
  return (
    <div style={{ minHeight: '100svh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', textAlign: 'center', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🔗</div>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', marginBottom: 8 }}>Kein gültiger Link</h1>
      <p style={{ fontSize: 15, color: '#6b7280', lineHeight: 1.6, maxWidth: 320, marginBottom: 32 }}>
        Bitte verwende den persönlichen Link aus deiner Buchungsbestätigung, um zur Gäste-Lounge zu gelangen.
      </p>
      <Link href="/" style={{ fontSize: 14, color: '#108ba9', fontWeight: 600, textDecoration: 'none' }}>
        Zur Startseite →
      </Link>
    </div>
  );
}

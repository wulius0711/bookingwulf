export const dynamic = 'force-dynamic';

import RegisterForm from './RegisterForm';

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  if (error === 'token_expired' || error === 'invalid_token') {
    const isExpired = error === 'token_expired';
    return (
      <main style={{ minHeight: '100vh', background: '#f5f5f7', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif' }}>
        <div style={{ width: '100%', maxWidth: 480, textAlign: 'center' }}>
          <img src="/bookingwulf-logo.png" alt="bookingwulf" style={{ height: 40, marginBottom: 32 }} />
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 20, padding: '40px 32px' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
            <h1 style={{ margin: '0 0 12px', fontSize: 24, fontWeight: 700, color: '#0f172a', letterSpacing: '-0.02em' }}>
              {isExpired ? 'Link abgelaufen' : 'Ungültiger Link'}
            </h1>
            <p style={{ margin: '0 0 24px', fontSize: 15, color: '#6b7280', lineHeight: 1.6 }}>
              {isExpired
                ? 'Ihr Bestätigungslink ist abgelaufen. Bitte fordern Sie einen neuen an.'
                : 'Dieser Bestätigungslink ist ungültig. Bitte fordern Sie einen neuen an.'}
            </p>
            <a
              href="/register/resend-verification"
              style={{ display: 'inline-block', padding: '12px 28px', background: '#111827', color: '#fff', borderRadius: 10, fontSize: 15, fontWeight: 600, textDecoration: 'none' }}
            >
              Neuen Link anfordern
            </a>
          </div>
          <p style={{ marginTop: 20, fontSize: 13, color: '#9ca3af' }}>
            <a href="/admin/login" style={{ color: '#374151', textDecoration: 'none', fontWeight: 600 }}>Zur Anmeldung</a>
          </p>
        </div>
      </main>
    );
  }

  const bgIndex = Math.floor(Math.random() * 5) + 1;
  return <RegisterForm bgIndex={bgIndex} />;
}

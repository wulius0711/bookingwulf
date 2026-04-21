export default function CheckEmailPage() {
  return (
    <main style={{ minHeight: '100vh', background: '#f5f5f7', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif' }}>
      <div style={{ width: '100%', maxWidth: 480, textAlign: 'center' }}>
        <img src="/bookingwulf-logo.png" alt="bookingwulf" style={{ height: 40, marginBottom: 32 }} />

        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 20, padding: '40px 32px' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📬</div>
          <h1 style={{ margin: '0 0 12px', fontSize: 24, fontWeight: 700, color: '#0f172a', letterSpacing: '-0.02em' }}>
            E-Mail bestätigen
          </h1>
          <p style={{ margin: '0 0 20px', fontSize: 15, color: '#6b7280', lineHeight: 1.6 }}>
            Wir haben Ihnen einen Bestätigungslink geschickt. Bitte prüfen Sie Ihr Postfach und klicken Sie auf den Link, um Ihr Konto zu aktivieren.
          </p>
          <p style={{ margin: 0, fontSize: 13, color: '#9ca3af', lineHeight: 1.5 }}>
            Der Link ist 24 Stunden gültig. Bei Problemen wenden Sie sich an{' '}
            <a href="mailto:support@bookingwulf.com" style={{ color: '#374151', fontWeight: 600 }}>support@bookingwulf.com</a>.
          </p>
        </div>

        <p style={{ marginTop: 20, fontSize: 13, color: '#9ca3af' }}>
          <a href="/admin/login" style={{ color: '#374151', textDecoration: 'none', fontWeight: 600 }}>Zur Anmeldung</a>
        </p>
      </div>
    </main>
  );
}

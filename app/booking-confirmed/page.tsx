export default async function BookingConfirmedPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; id?: string }>;
}) {
  const { status } = await searchParams;

  const isSuccess = status === 'success';
  const isCancelled = status === 'cancelled';

  const accent = '#111827';

  const config = isSuccess
    ? {
        icon: '✅',
        title: 'Buchung bestätigt',
        message: 'Ihre Zahlung wurde erfolgreich abgeschlossen. Sie erhalten in Kürze eine Bestätigungs-E-Mail.',
        color: '#16a34a',
        bg: '#f0fdf4',
        border: '#bbf7d0',
      }
    : isCancelled
      ? {
          icon: '↩️',
          title: 'Zahlung abgebrochen',
          message: 'Sie haben den Zahlungsvorgang abgebrochen. Ihre Buchung wurde nicht abgeschlossen.',
          color: '#92400e',
          bg: '#fffbeb',
          border: '#fde68a',
        }
      : {
          icon: '❌',
          title: 'Fehler aufgetreten',
          message: 'Bei der Verarbeitung Ihrer Zahlung ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut oder wenden Sie sich an das Hotel.',
          color: '#991b1b',
          bg: '#fef2f2',
          border: '#fecaca',
        };

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f5f5f7',
        fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, sans-serif',
        padding: '24px 16px',
      }}
    >
      <div
        style={{
          maxWidth: 480,
          width: '100%',
          background: '#ffffff',
          borderRadius: 20,
          boxShadow: '0 10px 40px rgba(15,23,42,0.08)',
          overflow: 'hidden',
        }}
      >
        {/* Header bar */}
        <div style={{ background: accent, padding: '24px 32px' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#ffffff', opacity: 0.8, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Buchungsstatus
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '36px 32px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: config.bg,
              border: `1px solid ${config.border}`,
              fontSize: 28,
              marginBottom: 20,
            }}
          >
            {config.icon}
          </div>

          <h1
            style={{
              margin: '0 0 12px',
              fontSize: 24,
              fontWeight: 700,
              color: '#111827',
              letterSpacing: '-0.02em',
            }}
          >
            {config.title}
          </h1>

          <p
            style={{
              margin: '0 0 28px',
              fontSize: 15,
              color: '#6b7280',
              lineHeight: 1.6,
            }}
          >
            {config.message}
          </p>

          <div
            style={{
              padding: '14px 18px',
              background: config.bg,
              border: `1px solid ${config.border}`,
              borderRadius: 12,
              fontSize: 13,
              color: config.color,
              fontWeight: 500,
            }}
          >
            {isSuccess
              ? 'Bitte überprüfen Sie Ihren E-Mail-Posteingang (auch den Spam-Ordner).'
              : isCancelled
                ? 'Sie können jederzeit eine neue Buchung starten.'
                : 'Falls das Problem weiterhin besteht, kontaktieren Sie bitte das Hotel direkt.'}
          </div>
        </div>
      </div>
    </main>
  );
}

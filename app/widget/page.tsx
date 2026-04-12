export default function WidgetPage({
  searchParams,
}: {
  searchParams: { hotel?: string };
}) {
  const hotel = searchParams.hotel || 'beimoser';

  return (
    <html lang="de">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Booking Widget</title>
      </head>
      <body style={{ margin: 0 }}>
        <div
          dangerouslySetInnerHTML={{
            __html: `
              <script>
                const API_BASE = "https://booking-app-snowy-two.vercel.app";
                const HOTEL_SLUG = "${hotel}";
              </script>

              <!-- HIER DEIN GANZER HTML + CSS + JS CODE -->
            `,
          }}
        />
      </body>
    </html>
  );
}

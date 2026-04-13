type Props = {
  searchParams: Promise<{
    hotel?: string;
  }>;
};

export default async function WidgetPage({ searchParams }: Props) {
  const params = await searchParams;
  const hotel = params.hotel ?? 'beimoser';

  const src = `https://booking-app-snowy-two.vercel.app/?hotel=${hotel}`;

  return (
    <iframe
      src={src}
      scrolling="no"
      style={{
        width: '100%',
        border: 'none',
        display: 'block',
        background: 'transparent',
      }}
      onLoad={(e) => {
        const iframe = e.currentTarget;

        function resize() {
          try {
            const doc = iframe.contentWindow?.document;
            if (!doc) return;

            const height = Math.max(
              doc.body.scrollHeight,
              doc.documentElement.scrollHeight,
            );

            iframe.style.height = height + 'px';
          } catch (err) {
            // cross-origin safety
          }
        }

        resize();

        try {
          const doc = iframe.contentWindow?.document;
          if (!doc) return;

          const observer = new MutationObserver(resize);
          observer.observe(doc.body, {
            childList: true,
            subtree: true,
            attributes: true,
            characterData: true,
          });

          iframe.contentWindow?.addEventListener('resize', resize);

          setInterval(resize, 500);
        } catch (err) {
          // ignore cross-origin errors
        }
      }}
    />
  );
}

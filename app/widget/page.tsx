type Props = {
  searchParams: Promise<{
    hotel?: string;
  }>;
};

export default async function WidgetPage({ searchParams }: Props) {
  const params = await searchParams;
  const hotel = params.hotel ?? 'beimoser';

  return (
    <iframe
      src={`https://booking-app-snowy-two.vercel.app/?hotel=${hotel}`}
      scrolling="no"
      style={{
        width: '100%',
        height: '1700px',
        border: 'none',
        display: 'block',
        background: 'transparent',
      }}
    />
  );
}

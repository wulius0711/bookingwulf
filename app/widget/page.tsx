import IframeWrapper from './IframeWrapper';

type Props = {
  searchParams: Promise<{
    hotel?: string;
  }>;
};

export default async function WidgetPage({ searchParams }: Props) {
  const params = await searchParams;
  const hotel = params.hotel ?? 'beimoser';

  return <IframeWrapper hotel={hotel} />;
}

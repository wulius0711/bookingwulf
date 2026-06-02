import IframeWrapper from './IframeWrapper';

type Props = {
  searchParams: Promise<{
    hotel?: string;
    lang?: string;
  }>;
};

export default async function WidgetPage({ searchParams }: Props) {
  const params = await searchParams;
  const hotel = params.hotel ?? 'alpine-retreat';
  const lang = params.lang;

  return <IframeWrapper hotel={hotel} lang={lang} />;
}

import { NextResponse } from 'next/server';
import { verifySession } from '@/src/lib/session';

export async function GET(req: Request) {
  await verifySession();

  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q')?.trim();
  if (!q || q.length < 2) return NextResponse.json([]);

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'GOOGLE_PLACES_API_KEY not configured' }, { status: 500 });

  const url = new URL('https://maps.googleapis.com/maps/api/place/autocomplete/json');
  url.searchParams.set('input', q);
  url.searchParams.set('types', 'establishment');
  url.searchParams.set('language', 'de');
  url.searchParams.set('key', apiKey);

  const res = await fetch(url.toString());
  const data = await res.json() as {
    predictions?: { place_id: string; description: string; structured_formatting: { main_text: string; secondary_text: string } }[];
  };

  const predictions = (data.predictions ?? []).map((p) => ({
    placeId: p.place_id,
    title: p.structured_formatting.main_text,
    subtitle: p.structured_formatting.secondary_text,
  }));

  return NextResponse.json(predictions);
}

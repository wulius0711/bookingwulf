import { NextResponse } from 'next/server';
import { verifySession } from '@/src/lib/session';

export async function GET(req: Request) {
  await verifySession();

  const { searchParams } = new URL(req.url);
  const placeId = searchParams.get('placeId')?.trim();
  if (!placeId) return NextResponse.json({ error: 'placeId required' }, { status: 400 });

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'GOOGLE_PLACES_API_KEY not configured' }, { status: 500 });

  const url = new URL('https://maps.googleapis.com/maps/api/place/details/json');
  url.searchParams.set('place_id', placeId);
  url.searchParams.set('fields', 'name,formatted_address,geometry,photos,types,url,editorial_summary');
  url.searchParams.set('language', 'de');
  url.searchParams.set('key', apiKey);

  const res = await fetch(url.toString());
  const data = await res.json() as {
    result?: {
      name: string;
      formatted_address: string;
      geometry: { location: { lat: number; lng: number } };
      photos?: { photo_reference: string }[];
      types?: string[];
      url?: string;
      editorial_summary?: { overview: string };
    };
  };

  const r = data.result;
  if (!r) return NextResponse.json({ error: 'Place not found' }, { status: 404 });

  // Fetch photo if available
  let imageUrl: string | null = null;
  if (r.photos?.[0]?.photo_reference) {
    const photoUrl = new URL('https://maps.googleapis.com/maps/api/place/photo');
    photoUrl.searchParams.set('maxwidth', '800');
    photoUrl.searchParams.set('photo_reference', r.photos[0].photo_reference);
    photoUrl.searchParams.set('key', apiKey);
    imageUrl = photoUrl.toString();
  }

  // Derive category from Google types
  const types = r.types ?? [];
  let category = 'attraction';
  if (types.some(t => ['restaurant', 'cafe', 'bar', 'food', 'bakery'].includes(t))) category = 'restaurant';
  else if (types.some(t => ['supermarket', 'grocery_or_supermarket', 'shopping_mall', 'store'].includes(t))) category = 'shopping';
  else if (types.some(t => ['ski_resort', 'gym', 'park', 'campground', 'hiking_area', 'stadium'].includes(t))) category = 'activity';
  else if (types.some(t => ['hospital', 'pharmacy', 'police', 'fire_station'].includes(t))) category = 'emergency';

  const mapsUrl = r.url ?? `https://maps.google.com/?q=${encodeURIComponent(r.formatted_address)}`;

  return NextResponse.json({
    title: r.name,
    address: r.formatted_address,
    mapsUrl,
    imageUrl,
    category,
    description: r.editorial_summary?.overview ?? null,
  });
}

import { NextRequest, NextResponse } from 'next/server';
import { loadEvents, NIGHTS_FRESH_S, parseNightsQuery, pickNights, toNight, type PublicEvent } from '@/lib/nights';

// The guest page's nights, read server-side: imin-api answers 403 to imin.wtf's origin (no CORS).
export const dynamic = 'force-dynamic';

const DEFAULT_API = 'https://imin-api-production.up.railway.app';

export async function GET(request: NextRequest) {
  const query = parseNightsQuery(request.nextUrl.searchParams);
  if (!query.ok) {
    return NextResponse.json({ error: query.error }, { status: 400, headers: { 'Cache-Control': 'no-store' } });
  }
  const base = (process.env.IMIN_API_BASE || DEFAULT_API).replace(/\/+$/, '');

  let events: PublicEvent[];
  try {
    events = await loadEvents(base, query.ids);
  } catch (error) {
    console.error('Error loading nights from imin-api:', error);
    return NextResponse.json(
      { error: 'Nights are unavailable right now' },
      { status: 502, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  const nights = pickNights(events, new Date()).map((e) => toNight(e, query.lang));
  return NextResponse.json(
    { nights },
    { headers: { 'Cache-Control': `public, s-maxage=${NIGHTS_FRESH_S}, stale-while-revalidate=3600` } },
  );
}

import { NextRequest, NextResponse } from 'next/server';
import { pickNights, toNight, type PublicEvent } from '@/lib/nights';

// The guest page's nights, read server-side: imin-api answers 403 to imin.wtf's origin (no CORS).
export const dynamic = 'force-dynamic';

const DEFAULT_API = 'https://imin-api-production.up.railway.app';
// Ids go into the upstream path, so nothing but a UUID gets through.
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_IDS = 5;
const LANGS = ['en', 'fr', 'es', 'uk'];
const UPSTREAM_TIMEOUT_MS = 8000;

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const ids = (params.get('ids') ?? '').split(',');
  if (ids.length > MAX_IDS || !ids.every((id) => UUID_RE.test(id))) {
    return NextResponse.json(
      { error: `ids must be 1 to ${MAX_IDS} event UUIDs, comma-separated` },
      { status: 400, headers: { 'Cache-Control': 'no-store' } },
    );
  }
  const lang = LANGS.find((l) => l === params.get('lang')) ?? 'en';
  const base = (process.env.IMIN_API_BASE || DEFAULT_API).replace(/\/+$/, '');

  let events: PublicEvent[];
  try {
    const unique = Array.from(new Set(ids.map((id) => id.toLowerCase())));
    const found = await Promise.all(unique.map((id) => fetchEvent(base, id)));
    events = found.filter((e): e is PublicEvent => e !== null);
  } catch (error) {
    console.error('Error loading nights from imin-api:', error);
    return NextResponse.json(
      { error: 'Nights are unavailable right now' },
      { status: 502, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  const nights = pickNights(events, new Date()).map((e) => toNight(e, lang));
  return NextResponse.json(
    { nights },
    { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=3600' } },
  );
}

// null = the event is gone or unpublished; any other failure throws.
async function fetchEvent(base: string, id: string): Promise<PublicEvent | null> {
  const res = await fetch(`${base}/api/v1/public/events/${id}`, {
    headers: { Accept: 'application/json' },
    next: { revalidate: 300 },
    signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`imin-api answered ${res.status} for event ${id}`);
  return (await res.json()) as PublicEvent;
}

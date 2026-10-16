// The nights the guest page pins by id: which still show, and how their date and line read.

/** The fields of imin-api's PublicTierDto that the price line reads. */
export interface PublicTier {
  priceAllInMinor: number; // one ticket, booking fee included
  currency: string;
  onSale: boolean;
  soldOut: boolean;
}

/** The fields of imin-api's PublicEventResponse that the guest page uses. */
export interface PublicEvent {
  id: string;
  name: string;
  status: string; // "live" | "past" | "cancelled"
  startsAt: string | null;
  endsAt: string | null;
  timezone: string;
  genre?: string | null;
  type?: string | null;
  venue?: { name?: string | null; city?: string | null } | null;
  tiers?: PublicTier[] | null;
}

export interface NightWhen {
  day: string; // "Sat 31.10"
  time: string; // "15:00 – 19:00"
  dock: string; // "Sat 31.10 · 15:00"
}

/** Data only: the page words it ("Sold out", "Free", "Free or from €16.74", "From €16.74") in the visitor's language. */
export type NightPrice =
  | { kind: 'soldout' }
  | { kind: 'free' }
  | { kind: 'freeOrFrom'; minor: number; currency: string }
  | { kind: 'from'; minor: number; currency: string };

export interface Night extends NightWhen {
  id: string;
  name: string;
  url: string;
  city: string;
  meta: string;
  price?: NightPrice;
}

const NIGHT_URL = 'https://app.imin.wtf/e/';
const CURRENCY_RE = /^[A-Z]{3}$/;
const DAY_MS = 24 * 60 * 60 * 1000;
// Ids go into the upstream path, so nothing but a UUID gets through.
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_IDS = 5;
const LANGS = ['en', 'fr', 'es', 'uk'];
const UPSTREAM_TIMEOUT_MS = 8000;
/** Seconds a nights answer may be reused: by the edge (s-maxage) and for the upstream read. */
export const NIGHTS_FRESH_S = 60;

export type NightsQuery = { ok: true; ids: string[]; lang: string } | { ok: false; error: string };

/** The query /api/nights takes, and nothing else: any other parameter would only make a new cache entry. */
export function parseNightsQuery(params: URLSearchParams): NightsQuery {
  for (const key of params.keys()) {
    if (key !== 'ids' && key !== 'lang') return { ok: false, error: 'Only ids and lang are accepted' };
  }
  const ids = (params.get('ids') ?? '').split(',');
  if (ids.length > MAX_IDS || !ids.every((id) => UUID_RE.test(id))) {
    return { ok: false, error: `ids must be 1 to ${MAX_IDS} event UUIDs, comma-separated` };
  }
  const lang = params.get('lang') ?? 'en';
  if (!LANGS.includes(lang)) return { ok: false, error: `lang must be one of ${LANGS.join(', ')}` };
  return { ok: true, ids: Array.from(new Set(ids.map((id) => id.toLowerCase()))), lang };
}

/** The pinned events imin-api still has: a 404 drops that id, any other failure throws (the route answers 502). */
export async function loadEvents(base: string, ids: string[], fetchImpl: typeof fetch = fetch): Promise<PublicEvent[]> {
  const found = await Promise.all(
    ids.map(async (id) => {
      // includeUnavailable lists sold-out tiers too, so "sold out" reads apart from "no tickets yet".
      const res = await fetchImpl(`${base}/api/v1/public/events/${id}?includeUnavailable=true`, {
        headers: { Accept: 'application/json' },
        next: { revalidate: NIGHTS_FRESH_S },
        signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
      });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error(`imin-api answered ${res.status} for event ${id}`);
      return (await res.json()) as PublicEvent;
    }),
  );
  return found.filter((e): e is PublicEvent => e !== null);
}

/** Live nights that have not ended yet, soonest first. Without an end time a night drops once it starts. */
export function pickNights<T extends PublicEvent>(events: T[], now: Date): T[] {
  const at = now.getTime();
  return events
    .filter((e) => e.status === 'live' && e.startsAt !== null && Date.parse(e.endsAt ?? e.startsAt) > at)
    .sort((a, b) => Date.parse(a.startsAt as string) - Date.parse(b.startsAt as string));
}

/** Date and time as the poster prints them, always on the event's own clock. */
export function formatWhen(night: Pick<PublicEvent, 'startsAt' | 'endsAt' | 'timezone'>, lang: string): NightWhen {
  const start = clock(night.startsAt as string, night.timezone, lang);
  const end = night.endsAt ? clock(night.endsAt, night.timezone, lang) : null;
  const day = `${start.weekday} ${start.date}`;
  // A night of 24 hours or more also names the day it ends: "20:00 – Sun 08.11, 23:00".
  const days = night.endsAt && Date.parse(night.endsAt) - Date.parse(night.startsAt as string) >= DAY_MS;
  return {
    day,
    time: !end ? start.time : days ? `${start.time} – ${end.weekday} ${end.date}, ${end.time}` : `${start.time} – ${end.time}`,
    dock: `${day} · ${start.time}`,
  };
}

/** What the guest page needs about one night. The line under the title uses only fields the event has. */
export function toNight(event: PublicEvent, lang: string): Night {
  const city = clean(event.venue?.city);
  const line: string[] = [];
  for (const part of [event.type, event.genre, event.venue?.name, city]) {
    const word = clean(part);
    if (word && !line.some((w) => w.toLowerCase() === word.toLowerCase())) line.push(word);
  }
  return {
    id: event.id,
    name: clean(event.name),
    url: NIGHT_URL + event.id,
    ...formatWhen(event, lang),
    city,
    meta: line.join(' · '),
    price: nightPrice(event.tiers),
  };
}

/** What a ticket costs, from every enabled tier. All-in (fee included), the only lawful first price in the EU;
 *  no claim when the tiers can't back one: none listed, none on sale, or an amount missing. */
export function nightPrice(tiers: PublicTier[] | null | undefined): NightPrice | undefined {
  if (!tiers || tiers.length === 0) return undefined;
  if (tiers.every((t) => t.soldOut === true)) return { kind: 'soldout' };
  const open = tiers.filter((t) => t.onSale === true);
  if (open.length === 0) return undefined;
  if (!open.every((t) => Number.isSafeInteger(t.priceAllInMinor) && t.priceAllInMinor >= 0 && CURRENCY_RE.test(t.currency))) {
    return undefined;
  }
  // Free only when every ticket on sale is; free and paid side by side start from the cheapest paid one.
  const paid = open.filter((t) => t.priceAllInMinor > 0);
  if (paid.length === 0) return { kind: 'free' };
  const cheapest = paid.reduce((a, b) => (b.priceAllInMinor < a.priceAllInMinor ? b : a));
  return { kind: paid.length < open.length ? 'freeOrFrom' : 'from', minor: cheapest.priceAllInMinor, currency: cheapest.currency };
}

function clean(value: string | null | undefined): string {
  return (value ?? '').trim();
}

function clock(iso: string, timeZone: string, lang: string) {
  const at = new Date(iso);
  const parts: Record<string, string> = {};
  const numeric = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  });
  for (const p of numeric.formatToParts(at)) parts[p.type] = p.value;
  // Poster style drops the abbreviation dot some languages add ("sam." → "sam").
  const weekday = new Intl.DateTimeFormat(lang, { timeZone, weekday: 'short' }).format(at).replace(/\.$/, '');
  return { weekday, date: `${parts.day}.${parts.month}`, time: `${parts.hour}:${parts.minute}` };
}

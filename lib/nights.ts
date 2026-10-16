// The nights the guest page pins by id: which still show, and how their date and line read.

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
}

export interface NightWhen {
  day: string; // "Sat 31.10"
  time: string; // "15:00 – 19:00"
  dock: string; // "Sat 31.10 · 15:00"
}

export interface Night extends NightWhen {
  id: string;
  name: string;
  url: string;
  city: string;
  meta: string;
}

const NIGHT_URL = 'https://app.imin.wtf/e/';

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
  return {
    day,
    time: end ? `${start.time} – ${end.time}` : start.time,
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
  };
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

// The front door of the routes that email the team (/api/pitch, /api/call-click):
// only this site's own pages, only JSON, and only a few times per window from one address.

/** Milliseconds until `key` may try again; 0 means go ahead. */
export type Limiter = (key: string, now?: number) => number;

/** At most `limit` requests per `windowMs` for each key, counted in fixed windows.
 *  ponytail: in memory, so per server instance and reset on cold start; if abused, add a Vercel WAF rate-limit rule on /api/*. */
export function windowLimiter(limit: number, windowMs: number, maxKeys = 10_000): Limiter {
  const hits = new Map<string, { start: number; count: number }>();
  return (key, now = Date.now()) => {
    let hit = hits.get(key);
    if (!hit || now - hit.start >= windowMs) {
      // A new window goes to the end, so the map runs oldest first: when full, the oldest (expired first) make room.
      hits.delete(key);
      for (const k of hits.keys()) { if (hits.size < maxKeys) break; hits.delete(k); }
      hit = { start: now, count: 0 };
      hits.set(key, hit);
    }
    hit.count += 1;
    return hit.count > limit ? hit.start + windowMs - now : 0;
  };
}

const JSON_TYPE = /^application\/json\s*(?:;|$)/i;

/** null when the request may go on; otherwise the answer to send back (403, 415 or 429). */
export function guardPost(request: { headers: Headers }, limiter: Limiter, now = Date.now()): Response | null {
  const h = request.headers;
  // Browsers say where a request comes from; anything but this site's own pages is turned away.
  const site = h.get('sec-fetch-site');
  if (site !== null && site !== 'same-origin') return refuse(403, 'Requests from other sites are not accepted');
  const origin = h.get('origin');
  if (origin !== null && !isOwnOrigin(origin, h)) return refuse(403, 'Requests from other sites are not accepted');
  if (!JSON_TYPE.test(h.get('content-type') ?? '')) return refuse(415, 'Send JSON');
  const wait = limiter(clientIp(h), now);
  if (wait > 0) {
    return refuse(429, 'Too many requests. Try again later.', { 'Retry-After': String(Math.ceil(wait / 1000)) });
  }
  return null;
}

// This site = the host the request was sent to: imin.wtf in production, a preview URL, or http://localhost:<port> locally.
function isOwnOrigin(origin: string, h: Headers): boolean {
  const host = (h.get('x-forwarded-host') ?? h.get('host') ?? '').split(',')[0].trim().toLowerCase();
  try {
    const url = new URL(origin);
    return host !== '' && (url.protocol === 'https:' || url.protocol === 'http:') && url.host === host;
  } catch {
    return false;
  }
}

// Vercel sets x-forwarded-for to the visitor's address (it overwrites what the client sent).
function clientIp(h: Headers): string {
  const forwarded = h.get('x-forwarded-for')?.split(',')[0].trim();
  return forwarded || h.get('x-real-ip')?.trim() || 'unknown';
}

function refuse(status: number, error: string, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify({ error }), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...headers },
  });
}

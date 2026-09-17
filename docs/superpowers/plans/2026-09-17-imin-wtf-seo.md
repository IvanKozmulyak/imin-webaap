# imin.wtf SEO foundation — plan + progress

**Repo:** `imin-webaap` (github.com/IvanKozmulyak/imin-webaap) = the `imin.wtf` landing. Next 14.2 · React 18 · Vercel.
**Worktree:** `imin-webaap/.claude/worktrees/seo-foundation`, branch `seo-foundation` off `origin/main` @ `dc3add7`.
**Check command:** `npx tsc --noEmit && npm run build` (green on untouched base — verified 2026-09-17).
**Status:** BUILT + VERIFIED 2026-09-17, staged in the worktree. Not committed, not pushed — ship is the user's call (step 12).

## Baseline audit (live https://imin.wtf, 2026-09-17)

| Check | Result |
|---|---|
| robots.txt / sitemap.xml | **404** (HTML 404 page) — likely why Google shows nothing |
| canonical | none; `www.imin.wtf` also serves 200 → duplicate origin |
| JSON-LD | none |
| OG image | `og-image.svg` — social crawlers + Google do not render SVG |
| meta title | "IMIN — The two-sided platform for nightlife" (43 chars, fine) |
| meta description | 197 chars (too long, trims in SERP) |
| h1 | exactly one; hierarchy h1→h2→h3 clean |
| noindex | none on `/`; only on the Next 404 page (correct) |
| alt text | present on all 8 `<img>` |
| broken links | none (8 anchor ids resolve; dashboard/cal.com/LinkedIn 200/301) |
| HTTPS | http→https 301 + HSTS `max-age=63072000` already on |
| mobile | no horizontal overflow at 390px; viewport meta correct |
| Lighthouse mobile | perf 87 · a11y 95 · BP 100 · SEO 100 |
| LCP | **4.1 s** — hero `imin-logo-mark.png` 393 KB, element render delay 1.2 s |
| other LH fails | unsized `<img>` ×4, `--text3` contrast 3.07:1 in footer, no `<main>` landmark, render-blocking CSS 110 ms |
| URL slugs | single page `/`; nothing to clean |

## Steps

- [x] 1. `app/robots.ts` — allow `/`, disallow `/api/`, sitemap URL (staged)
- [x] 2. `app/sitemap.ts` — single entry `https://imin.wtf/` (staged)
- [x] 3. Images → WebP via `cwebp -q 82 -m 6` (staged): imin-logo-mark 393 KB→26 KB, poster-studio-variants 2.9 MB→259 KB, poster-studio-vibe 2.4 MB→146 KB, vechirka-poster 1.5 MB→111 KB, night.jpg 101 KB→55 KB. Originals + `og-image.svg` `git rm`'d.
- [x] `.env.example` — `GOOGLE_SITE_VERIFICATION=""` (staged)
- [x] 4. `app/page.tsx`
  - hero: `<img src="/assets/imin-logo-mark.png">` → `next/image` `priority` `width={526} height={696}` src `.webp` (this is the LCP element; kills the 393 KB + preload delay)
  - poster `Image` srcs → `.webp` (3 of them: poster-studio-variants, poster-studio-vibe, vechirka-poster)
  - add `width`/`height` to plain imgs: `logo-imin.png` 49×65 (nav + footer), `team-*.jpg` 280×280, `dashboard-home.webp` 2000×992
  - wrap `<header id="top">` … `</section id="invest">` in `<main id="main">` (landmark audit)
  - footer "Start" column: add `<a href="https://app.imin.wtf/events">Find events ↗</a>` (internal ecosystem link)
- [x] 5. `app/globals.css` — line 932 `url(/assets/night.jpg)` → `night.webp`; `--text3: #5f5b70` → a value ≥ 4.5:1 on `#08070d` (e.g. `#8d89a3`) — check it doesn't wash out eyebrows elsewhere; if so scope to `.footer-tagline, .footer-col-head, .footer-bottom`
- [x] 6. `app/layout.tsx` metadata
  - `description` ≤ 160 chars, e.g. "IMIN runs the night for organizers — AI marketing, ticketing and posters in one dashboard — and helps people find an event, and someone to go with." (149)
  - `alternates: { canonical: '/' }`
  - `robots: { index: true, follow: true }`
  - `openGraph: { url: '/', siteName: 'IMIN', type: 'website', locale: 'en_US', title, description }` — **remove `images: ['/assets/og-image.svg']`** (file convention below supplies it)
  - `twitter: { card: 'summary_large_image', title, description }`
  - `verification: { google: process.env.GOOGLE_SITE_VERIFICATION }` (undefined when unset — Next omits the tag)
  - JSON-LD `<script type="application/ld+json">` in `<body>`: `Organization` (name IMIN, url, logo `https://imin.wtf/icon.png` 512², founder: Person Bohdan Shostak + Ivan Kozmulyak with LinkedIn `sameAs`) + `WebSite`. Only facts already on the page.
- [x] 7. `app/opengraph-image.tsx` — `ImageResponse` 1200×630 PNG (`next/og`, default font is fine), same copy as the old SVG: eyebrow / headline / IMIN wordmark on the dark gradient. Exports `alt`, `size`, `contentType`. Static at build.
- [x] 8. `next.config.js` — `redirects()`: `{ source: '/:path*', has: [{ type: 'host', value: 'www.imin.wtf' }], destination: 'https://imin.wtf/:path*', permanent: true }`
- [x] 9. `README.md` "SEO" section — Search Console: recommend **Domain property** `imin.wtf` via DNS TXT at the registrar (covers app./dashboard. too); alt: URL-prefix property + `GOOGLE_SITE_VERIFICATION` env on Vercel. After deploy: submit `https://imin.wtf/sitemap.xml`, URL-inspect `/` → Request indexing.
- [x] 10. `docs/seo-backlink-strategy.md` — see outline below.
- [x] 11. Verified 2026-09-17 — `npx tsc --noEmit && npm run build`; `npm start -p 3100` then
  `curl localhost:3100/robots.txt`, `/sitemap.xml`, `/opengraph-image` (PNG 1200×630), head tags (`canonical`, `og:image`, `ld+json`), `curl -sI -H 'Host: www.imin.wtf' localhost:3100/` → 308 to `https://imin.wtf/`; Lighthouse mobile on localhost (target LCP < 2.5 s, a11y 100); playwright 390 px overflow re-check.
- [ ] 12. Ship — `imin-webaap` is NOT in the `/ship-imin` table: commit on `seo-foundation`, push, merge to `main` → Vercel deploys. Then GSC sitemap submit + request indexing. Confirm `www.imin.wtf` is attached to the same Vercel project (it serves the same page today, so it should be).

## Result (local prod build, Lighthouse mobile, simulated slow 4G)

| | live before | local after |
|---|---|---|
| performance | 87 | 95 |
| accessibility | 95 | 100 |
| best practices | 100 | 100 |
| SEO | 100 | 100 |
| LCP | 4.1 s | 2.8–3.0 s (fonts-bound now; 6 preloaded woff2) |
| CLS | 0 | 0 |
| unsized images | 4 | 0 |
| contrast failures | 5 | 0 |

Verified on `next start`: robots.txt 200, sitemap.xml 200 (one URL), `/opengraph-image` 200 PNG 1200×630 57 KB, canonical + robots + OG + Twitter tags, JSON-LD parses, one `<main>`, `Host: www.imin.wtf` → 308 `https://imin.wtf/…`, no horizontal overflow at 390 px, hero renders via next/image.

Remaining LCP lever is the font set (3 families, 9 weights). Real-network numbers need Search Console / CrUX after deploy — there is no field data yet.

## Backlink strategy (written: docs/seo-backlink-strategy.md)

1. **Own properties first:** footer link from `app.imin.wtf` (imin-public) and `dashboard.imin.wtf` login page back to `imin.wtf`; LinkedIn company page + both founders' profiles; Cal.com page; email signatures.
2. **Programme/press pages that already mention IMIN** — ask each for a live link: Metz Startup Challenge (winner), Web Summit startup listings '24/'25, University of Luxembourg Incubator Summer School cohort page, eupinions/any coverage.
3. **Startup directories** (free, indexed): Crunchbase, F6S, Product Hunt (launch the poster studio), BetaList, Wellfound, EU-Startups, French Tech / Luxembourg startup maps.
4. **Organizer-side content:** each organizer's event page on `app.imin.wtf/e/…` is a real page; encourage organizers to link it from Instagram bio / RA / Shotgun listings. Vechirka event pages first.
5. **Founder-led:** 1 guest post / podcast per month on independent-nightlife or event-marketing outlets (Resident Advisor community, Mixmag, IQ Magazine, Eventbrite/DICE comparison blogs); cite the "151M live-music fans" stat with source → link-worthy.
6. **Don't:** buy links, PBNs, directory spam.

## Follow-ups noticed (other repos, not in this task)

- `imin-public` sitemap lists `https://app.imin.wtf/` which 307s to `/events` — drop it or point at `/events`.
- `imin-public` `/events` has no `alternates.canonical`.
- `imin-public` footer has no link to `imin.wtf` (see backlink step 1).
- `timeandmoney.agency` (separate owner): canonical says non-www while the site 307s to www; `twitter:description` is EN on the UK page; no OG image.

# imin.wtf: guest page at `/`, creators page at `/pro`

Date: 2026-10-16. Repo: `imin-webaap` (Next 14, Vercel, deploys on push to `main`; not in the `/ship-imin` table).
Branch `feat/guest-pro-landing`, task worktree `imin-webaap/.claude/worktrees/landing`.

Sources (designer exports, untrusted downloads, read only):
- Guest: `~/Downloads/Telegram Desktop/IMIN Guest Page/` → `/`
- Pro: `~/Downloads/Telegram Desktop/IMIN Pro/` → `/pro` (`IMIN Pro 2` is byte-identical)

## Decisions (Ivan, 2026-10-16)

1. Hero night = the **real** prod event. With no upcoming night, the page gets a designed "no date yet" state that still looks good.
2. "Keep me posted" and "Send us your night" email the team through Resend (same mechanism as the old imin.wtf forms).
3. Keep the EN/FR/ES/UA switcher; **translate both pages at the end** (Track E).
4. Missing links (WhatsApp, Telegram, Spotify playlist, "I'm in" channel): Ivan pastes them; until then they stay hidden / "Coming soon" (the design already supports empty values).
5. In parallel: design-improvement proposals for both pages, delivered as an artifact with before/after screenshots (Track D). Proposals are not applied until Ivan picks them.

## Analysis: what the export does today

- Both pages are static HTML + vanilla JS (GSAP 3.13, ScrollTrigger, SplitText, Lenis). `config.js` is read only for `links` (guest) and `pro.links` / `pro.pitchEndpoint` (pro). The guest config's `events`, `state`, `lastNight`, `inRegion`, `voiceNote`, `nightPhotos`, `formats` are read by nothing.
- Guest hero poster, dock and "I'm in" are hard-coded to "Halloween CoffeeShop Rave". "I'm in" only appends a chat bubble.
- Prod (`GET /api/v1/public/events`, 2026-10-16): the only upcoming Metz night on 31.10 is **The Midnight Bean Society** (`ef3b1f87-2cc6-4697-94e6-1cd37881905d`, 15:00–19:00 Europe/Paris, org Chernivtsi Vibe). A junk test event "123" (12.12, Metz) is also `live`, so "next event in Metz" cannot be auto-picked: nights are pinned by id in `config.js`.
- Public API answers `403` to `Origin: https://imin.wtf` (no CORS), so the page reads nights through a same-origin Next route.
- `PublicEventResponse.status` is `"live" | "past" | "cancelled"` (`imin-api` `dto/publicapi/PublicEventResponse.java:14`).
- Guest "Keep me posted" shows "You're on the list" and sends nothing. Pro "Send us your night" shows success with an empty endpoint and never checks `res.ok`.
- Dead or wrong links: guest nav "Sign in" → `#hero`; footer legal → `/legal` for all five; "Cookie settings" → `#hero` (no cookie banner exists); pro sign-up → `dashboard.imin.wtf/signup` (route is `/auth/signup`); pro "Nights" → a claude.ai artifact; call → empty (live imin.wtf uses `https://cal.com/bohdan-shostak`).
- Head: artifact wrapper markup, `<title>` inside `<body>`, guest has `noindex`, canonical `/en/`, `og:image` points to a file that does not exist, and the guest page also loads Google Fonts although the fonts are self-hosted.

## Architecture

Static pages in `public/` served by `next.config.js` rewrites (`/` → `/index.html`, `/pro` → `/pro/index.html`; the `.html` URLs 308 to the clean ones). No React on the pages, so nothing fights GSAP for the DOM. Next keeps serving the API routes, `robots.txt`, `sitemap.xml`, `icon.png` and `opengraph-image`. No root layout is needed (404 falls back to the pages-router default); verified with `next build` + `next start`.

## Scaffold (done, main session)

Removed the old landing (`app/page.tsx`, `useLandingEffects.ts`, `globals.css`, `layout.tsx`), the investor form routes (`partner-request`, `growth-application`) and their images. Copied both designs' assets into `public/assets/` (shared files are byte-identical), pages into `public/index.html` and `public/pro/index.html` with root-absolute asset paths, rewrote `config.js` (only keys the pages read, links fixed, `events` pinned by id, endpoints set), added `/pro` to the sitemap. `app/api/call-click` stays (Track B rewires it).

## Track A: guest page `/` (worker)

### Affected files
- `public/index.html`, `public/assets/js/client.js`, `public/assets/css/client.css`
- `app/api/nights/route.ts`, `lib/nights.ts`, `lib/nights.test.mjs` (new)
- `app/api/subscribe/route.ts` (new)
- `app/opengraph-image.tsx`
- `package.json` (only a `"test": "node --test"` script)

### Ordered steps
1. **Head.** Replace the artifact wrapper with a real document: `<!doctype html><html lang="en" class="no-js">`, everything that belongs in `<head>` moved there. Title "IMIN: music-first nights in Metz" (or better, ≤60 chars), description from the design, canonical `https://imin.wtf/`, no `noindex`, theme-color, favicon `/assets/img/favicon.svg`, OG + Twitter tags with `og:image` `https://imin.wtf/opengraph-image` (1200×630), the two font preloads, self-hosted `fonts.css` only (drop Google Fonts). JSON-LD: keep the FAQPage block and add the Organization + WebSite graph from the old `app/layout.tsx` (`git show origin/main:app/layout.tsx`). Keep any wrapper rule the CSS relies on (`[hidden]{display:none!important}`, body margin); visual parity with the export is required.
2. **Nights API.** `lib/nights.ts`: `pickNights(events, now)` keeps `status === 'live'` with `endsAt > now`, sorted by `startsAt`; `formatWhen(night, lang)` returns the poster day (`Sat 31.10`), the time range (`15:00 – 19:00`) and the dock line, always in the **event's** `timezone` via `Intl` (never the visitor's or UTC). `app/api/nights/route.ts` GET `?ids=<uuid>,…&lang=en`: every id must match a strict UUID regex and at most 5 ids (else 400; ids go into the upstream path); fetches `${IMIN_API_BASE ?? 'https://imin-api-production.up.railway.app'}/api/v1/public/events/<id>` with `next: { revalidate: 300 }`; 404 drops the id; any other upstream failure → 502. Responds `{ nights: [{ id, name, url: 'https://app.imin.wtf/e/<id>', day, time, dock, city, meta }] }` with `Cache-Control: public, s-maxage=300, stale-while-revalidate=3600`. `meta` is built only from real fields (type, genre, venue name when non-empty, city), with no invented tags.
3. **Tests** (`lib/nights.test.mjs`, `node --test`, imports `./nights.ts` through Node's type stripping): past, cancelled and ended nights drop and the rest sort; one fixture where UTC and Europe/Paris disagree on the day (e.g. `2026-10-31T23:30:00Z` → `Sun 01.11`, `00:30`), proven red by computing in UTC once.
4. **Hero states** in `client.js` + markup:
   - **Default markup** (no JS, before the fetch resolves, and when the API is unreachable) makes no date claim: the poster shows no date or name, and "I'm in" links to `https://app.imin.wtf/events`.
   - **A, a night is on:** poster day/time/title/meta, notification text, dock line and the "I'm in" target all come from `/api/nights`; the first night is the hero; more than one → a compact "Pick your night" list under it (design idiom, small). "I'm in" keeps the chat-bubble reply, then opens the night's page.
   - **B, API answered and nothing is upcoming:** design a "no date yet" poster and copy in the page's own voice (short, casual), e.g. the poster says the next date is coming, the IMIN message asks if they want it first, and "I'm in" scrolls to *Stay close* and focuses the email field. The dock follows the same state. It must look intentional, not empty.
   - Put every user-facing string `client.js` emits in one `STR` object at the top (EN now; Track E adds languages keyed by `<html lang>`).
5. **Keep me posted** → `POST /api/subscribe` (`{ email, consent: true, consent_text, source: 'guest-stay', lang, company }`): honeypot `company` non-empty → 200 without sending; invalid email (existing `EMAIL_RE`) or no consent → 400; fields capped (email 254, consent text 300); `sendTeamEmail` (eyebrow "Keep me posted", the consent text, timestamp, language and page in the fields, `replyTo` the address); a send failure → 500. `client.js` really POSTs, shows the success bubble only on `res.ok`, otherwise an error in `[data-mail-err]` with `contact@imin.support`.
6. **Links.** Nav "Sign in" → `data-link="signIn"`; footer "All nights" → `allNights`; "For creators" → `create`; footer "Sign in" → `creatorSignIn`; legal → `https://app.imin.wtf/legal/{notice,terms,privacy,refunds,cookies}`; FAQ "Privacy" → `/legal/privacy`; remove "Cookie settings". Fallback `href`s in markup are the real URLs too (no-JS). Leave the language switcher for Track E.
7. **OG image** `app/opengraph-image.tsx`: the guest message ("Don't overthink the night." / "Music first. Come as you are.") in the page's palette (ink `#0B0A14`, paper `#F4EFE7`, haze `#9C8CFF`, doorlight `#16B877`).

### Verification commands
- `node --test lib/` (green; paste the red run of the UTC proof too)
- `npx next build > <scratchpad>/gate-webaap-landing-guest.log 2>&1; tail -30 <scratchpad>/gate-webaap-landing-guest.log`
- `npx next start -p 3101`, then: `curl` `/` (200, one `<title>`, no `noindex`, canonical `/`), `/api/nights?ids=ef3b1f87-2cc6-4697-94e6-1cd37881905d&lang=en` (the real night), `/api/nights?ids=00000000-0000-4000-8000-000000000000` (empty list), `/api/nights?ids=../x` (400), `/api/subscribe` with honeypot (200), bad email (400), valid without `RESEND_API_KEY` (500 → UI shows the error, not success).
- Headless browser (own Playwright in the scratchpad, `chromium.launch({ channel: 'chrome' })`): 1440×900 and 390×844 screenshots of the export vs the build, state A, state B (stub `/api/nights` with `page.route` returning `{ nights: [] }`), API-down state; zero console errors.

## Track B: creators page `/pro` (worker)

### Affected files
- `public/pro/index.html`, `public/assets/js/pro.js`, `public/assets/css/pro.css`
- `app/api/pitch/route.ts` (new), `app/api/call-click/route.ts`
- `app/pro/opengraph-image.tsx` (new)

### Ordered steps
1. **Head**, same as Track A step 1: title like "IMIN for creators: run your night in one place", description, canonical `https://imin.wtf/pro`, OG `https://imin.wtf/pro/opengraph-image`, keep the FAQPage JSON-LD, self-hosted fonts with preloads, wrapper rules the CSS needs; visual parity required.
2. **Send us your night** → `POST /api/pitch` (`{ type, name, contact, what, when, link, consent, lang, company_site }`): honeypot → 200 without sending; `type` ∈ `planned | idea | company`; `name`, `contact`, `what` required, `consent === true`; `link` empty or an `https:` URL; fields capped (name 100, contact 200, what 2000, when 200, link 500); `sendTeamEmail` (eyebrow "Night pitch", `replyTo` when the contact is an email); send failure → 500. `pro.js` shows the confirmation only on `res.ok`; otherwise its existing error copy.
3. **Call link**: config now sets `call` to cal.com. A click on any `data-link="call"` link sends `navigator.sendBeacon('/api/call-click')`; reword `call-click` from the investor call to the creators page ("Someone is booking a 20-minute call from imin.wtf/pro").
4. **Links**: markup fallbacks match config (`/`, `https://dashboard.imin.wtf/auth/signup`, `https://dashboard.imin.wtf/auth/login`); remove "Cookie settings"; WhatsApp and Telegram stay hidden while empty (no-JS: give them no `href="#"`).
5. Put every user-facing string `pro.js` emits in one `STR` object at the top (EN now, for Track E).
6. **OG image** `app/pro/opengraph-image.tsx`: "You create the night. We carry the rest." in the same palette as Track A.

### Verification commands
- `npx next build > <scratchpad>/gate-webaap-landing-pro.log 2>&1; tail -30 <scratchpad>/gate-webaap-landing-pro.log`
- `npx next start -p 3102`, then `curl` `/pro` (200, one `<title>`, canonical `/pro`), `/pro/opengraph-image` (200 PNG), `/api/pitch` honeypot (200), missing fields (400), `http:` link (400), valid without `RESEND_API_KEY` (500 → UI shows the error), `/api/call-click` (200).
- Headless browser: 1440×900 + 390×844 export vs build parity, form error and success paths (`page.route` stub for success), zero console errors.

## Track C: claims audit (read-only agent)

Every feature, price or promise on both pages traced to `origin/<base>` code in `imin-api`, `imin-webapp`, `imin-public` and `imin-tickets-gate` (and prod config where it decides). Verdict per claim (LIVE / PARTIAL / NOT LIVE / HUMAN PROMISE) with `file:line`, plus a corrected line for every claim that is not LIVE. Claims that fail get fixed in copy before ship (workspace rule: a feature claim is traced to prod).

## Track D: design improvement proposals (2 agents, one per page)

Each works on copies of the export in the scratchpad (`before/` untouched, `after/` improved), never on the task worktree. 6–10 improvements per page, ranked by impact, excluding the wiring Tracks A/B already do. Output: `manifest.json` (id, title, problem, change, why, effort, section, viewport, before/after image paths), before/after screenshots per improvement, `after.patch`. The main session publishes one artifact with all pairs. Ivan picks; picked items are ported to the build afterwards.

## Track E: translations (after A + B are merged and the proposals are settled)

FR, ES, UK versions of both pages at `/fr`, `/es`, `/uk`, `/fr/pro`, … (static files, rewrites, `hreflang` alternates, switcher wired, `STR` dictionaries in the JS, sitemap). Copy translated for meaning and tone, not word for word. Native review recommended for FR (primary market).

## Integration and ship

1. Merge A and B into the task worktree as diffs (`git diff | git apply`), rebuild, browser-check both pages at both widths.
2. Fresh `reviewer` on the full diff against this plan.
3. Ship = push `main` of `imin-webaap` (Vercel prod). **Ask Ivan before pushing.** After deploy: curl `/`, `/pro`, `/api/nights`, `/sitemap.xml`; one real "Keep me posted" and one real pitch to confirm Resend delivery.

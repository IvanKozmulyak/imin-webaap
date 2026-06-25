# night-kit design-sync notes

## What this is
`imin-webaap` is a single-page Next.js investor landing — **not** a design-system repo.
On user request ("extract a kit anyway") we authored a real component library at
`design-system/` (`@imin/night-kit`) by packaging the landing's existing
className-driven primitives. The components emit the exact classNames the landing
already uses; styling is the extracted slice of `app/globals.css` shipped as
`design-system/src/styles.css`. No reimplementation — the kit IS the landing's DS.

## Build
- Library lives in `design-system/` (own `node_modules`, npm). Build: `npm run build --prefix design-system` (tsup → `dist/index.js` ESM + `dist/index.d.ts`).
- Converter entry: `--entry design-system/dist/index.js`, `--node-modules design-system/node_modules`.
- `dist/index.js` not `.mjs` — tsup names ESM `.js` because `package.json` has `"type":"module"`. `module`/`main` point at `./dist/index.js`.

## Components (10)
Button, Eyebrow, LiveDot, StatusPill, Card, StatCard, Pillar, Chip, Field, Modal.
All map 1:1 to classes in `globals.css`.

## Fonts
Brand fonts (Barlow Condensed / DM Sans / DM Mono) are Google Fonts. The landing
loads them via next/font; the kit isn't a Next app, so `styles.css` loads them with
a Google Fonts `@import` (→ `[FONT_REMOTE]`, informational). The `--font-*` CSS vars
stay undefined in the kit and the literal family fallbacks resolve.

## Known render warns (expected — not new on re-sync)
- `[FONT_REMOTE]` for "Barlow Condensed" / "DM Sans" / "DM Mono" — brand fonts load via a Google Fonts `@import`, served at runtime. Non-blocking.
- Offline captures render the **serif fallback** instead of the brand fonts (the `@import` needs network). Tokens, gradients, borders, and layout are all correct; only the typeface differs. In the real (online) claude.ai/design environment the brand fonts load and cards render correctly.

## Preview convention
- The card body is hardcoded **white** by the converter (`emit.mjs`), but this is a **dark** DS. Every preview wraps its component in a brand-dark frame (`background:#08070d`) so light text + white-alpha borders read true. `Modal` uses a sized `position:relative` box because `<dialog open>` is `position:absolute` by UA default.
- `overrides`: `Button`/`Card`/`Field` use `cardMode: column` (framed cells overflow the grid); `Modal` uses `cardMode: single` + a `560x640` viewport.

## Re-sync risks
- **Font rendering depends on network**: the headless render check / capture may run
  offline, in which case screenshots fall back to system fonts (colors/spacing/borders
  still apply, so cards still grade "styled"). Brand font correctness can't be verified
  offline. If grading a card's typography, confirm online.
- The kit is a hand-authored snapshot of the landing's primitives. If `app/globals.css`
  or `app/page.tsx` change a primitive, `design-system/src/` + `styles.css` must be
  updated by hand — they don't auto-track the landing.

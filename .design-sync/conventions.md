# IMIN night-kit — usage conventions

The IMIN nightlife design system: a **dark**, className-driven kit. Components are
imported from `window.NightKit.*` and emit their own classNames; all styling lives in
the shipped `styles.css` (which `@import`s `_ds_bundle.css` and the brand fonts). There
is **no provider and no React context** — render a component and it's styled.

## Dark canvas (required)
Every token is tuned for the dark IMIN background. Hairlines are white-alpha and body
text is near-white, so on a light page the surfaces and ghost buttons wash out. Put the
brand background on your page/section root:

```jsx
<div style={{ background: 'var(--bg)', color: 'var(--text)', minHeight: '100vh' }}>
  {/* your design */}
</div>
```

`styles.css` already sets `body { background: var(--bg) }`, so a full-page design is dark
by default — only override when you place the kit on your own surface.

## Styling idiom — tokens, not utility classes
Style your own layout with the CSS custom properties (do **not** invent hex values —
use the tokens so designs stay on-brand):

| Token | Use |
|---|---|
| `--bg` `#08070d` · `--panel` `#100c1c` | page background · raised surface |
| `--text` · `--text2` · `--text3` | primary · muted · faint text |
| `--accent` `#16b877` · `--accent2` `#0e8f86` · `--green` | brand green / accents |
| `--grad` | the signature `linear-gradient(120deg,#0e8f86,#24c98a)` (buttons, gradient words) |
| `--hair` · `--hair2` | hairline borders (`1px solid var(--hair2)`) |
| `--red` `#ef5b5b` · `--amber` | error · warning |
| `--display` · `--sans` · `--mono` | Barlow Condensed (uppercase headings) · DM Sans (body) · DM Mono (labels/eyebrows) |
| `--card-surface` · `--card-surface-2` | the subtle card fill gradients |

Conventions the kit follows, match them: headings are `var(--display)`, 800 weight,
UPPERCASE, tight tracking; eyebrows/labels are `var(--mono)`, ~0.7rem, uppercase, wide
letter-spacing, `var(--accent)`; everything pill-shaped uses `border-radius: 999px`.

## Components (10)
`Button` (variant primary|ghost, block, href), `Eyebrow` (pill, tone), `LiveDot`
(small, paused), `StatusPill`, `Card` (eyebrow, title), `StatCard` (value, cite),
`Pillar` (word), `Chip` (dot), `Field` (label, multiline, invalid), `Modal` (open,
eyebrow, title, sub). Read each component's `<Name>.d.ts` for its exact props and
`<Name>.prompt.md` for usage before composing.

## Where the truth lives
- `styles.css` (+ its `@import`s, incl. `_ds_bundle.css`) — every token and component class.
- `components/<group>/<Name>/<Name>.d.ts` — the prop contract.
- `components/<group>/<Name>/<Name>.prompt.md` — per-component usage.

## One idiomatic example
```jsx
const { Eyebrow, Card, Button } = window.NightKit;

<section style={{ background: 'var(--bg)', color: 'var(--text)', padding: '90px 28px' }}>
  <Eyebrow>Two sides · same market</Eyebrow>
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 16, marginTop: 24 }}>
    <Card eyebrow="The organizer" title="Great nights. Lost on the marketing.">
      A 2-person crew can’t run ads, email and design like a company with a marketing team.
    </Card>
    <Card eyebrow="The event-goer" title="Want to go out. Don’t know where.">
      New rooms, new circles, company for the night — dating apps don’t fit.
    </Card>
  </div>
  <Button variant="primary" href="#access" style={{ marginTop: 28 }}>Request access →</Button>
</section>
```

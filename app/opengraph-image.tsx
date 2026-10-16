import { ImageResponse } from 'next/og';

// Share card for /, the guest page's own message in its palette. A PNG, because Facebook,
// LinkedIn, X and Google all skip SVG og:images. Satori rules: flexbox only, literal colours.

export const alt = "IMIN: Don't overthink the night. Music first. Come as you are.";
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const INK = '#0B0A14';
const PAPER = '#F4EFE7';
const HAZE = '#9C8CFF';
const DOOR = '#16B877';

const HEADLINE = ['Don’t overthink', 'the night.'];
const LINE = 'Music first. Come as you are.';
const BUTTON = 'I’m in';
const DOMAIN = 'imin.wtf';

// The brand beat, as the page draws it: I paper · M haze · I paper · N doorlight.
const D_BACK = 'M292.215 52.8235C285.967 25.8047 306.486 0 334.218 0C354.056 0 371.334 13.5391 376.078 32.8025L550.268 740.176C557.762 770.606 534.728 800 503.389 800C480.916 800 461.414 784.494 456.351 762.598L292.215 52.8235Z';
const D_FWD = 'M877.785 52.8235C884.033 25.8047 863.514 0 835.782 0C815.944 0 798.666 13.5391 793.922 32.8025L619.732 740.176C612.238 770.606 635.272 800 666.611 800C689.084 800 708.586 784.494 713.649 762.598L877.785 52.8235Z';
const BAR: [string, number, string][] = [['v', 0, PAPER], ['v', 140, HAZE], ['b', 0, HAZE], ['f', 0, HAZE], ['v', 930, HAZE], ['v', 1070, PAPER], ['v', 1210, DOOR], ['b', 1070, DOOR], ['v', 1675, DOOR]];
const BEAT_H = 64;
const BEAT_GROUPS = Math.ceil((size.width * 800) / (BEAT_H * 1815)) + 1;

type Font = { name: string; data: ArrayBuffer; weight: 500 | 800; style: 'normal' };

// Satori reads TTF/OTF/WOFF, not the page's woff2, so the two faces come from Google Fonts at build.
// ponytail: if Google Fonts is unreachable the card falls back to Satori's default font, smaller.
async function loadFonts(): Promise<Font[] | null> {
  const text = Array.from(new Set([...HEADLINE, LINE, BUTTON, DOMAIN].join('') + [...HEADLINE, BUTTON].join('').toUpperCase())).join('');
  const faces: [string, string, 500 | 800][] = [
    ['Barlow Condensed', 'Barlow+Condensed:wght@800', 800],
    ['DM Sans', 'DM+Sans:wght@500', 500],
  ];
  try {
    return await Promise.all(
      faces.map(async ([name, family, weight]) => {
        const cssUrl = `https://fonts.googleapis.com/css2?family=${family}&text=${encodeURIComponent(text)}`;
        const css = await (await fetch(cssUrl, { signal: AbortSignal.timeout(5000) })).text();
        const src = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/);
        if (!src) throw new Error(`no TTF for ${name}`);
        const res = await fetch(src[1], { signal: AbortSignal.timeout(5000) });
        if (!res.ok) throw new Error(`${name} ${res.status}`);
        return { name, data: await res.arrayBuffer(), weight, style: 'normal' as const };
      }),
    );
  } catch (error) {
    console.warn('opengraph-image: brand fonts unavailable, using the default font', error);
    return null;
  }
}

export default async function OpenGraphImage() {
  const fonts = await loadFonts();
  const display = fonts ? 'Barlow Condensed' : 'sans-serif';
  const text = fonts ? 'DM Sans' : 'sans-serif';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: INK,
          color: PAPER,
          fontFamily: text,
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 1,
            justifyContent: 'space-between',
            padding: '60px 72px 52px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <svg width="150" height="46" viewBox="0 0 348.33 107.29" fill={PAPER}>
              <path d="M0 0H36.86V107.29H0Z" />
              <path d="M46.03 0H85.82L107.8 35.65L129.43 0H169.58V107.29H132.55V55.03L107.8 89.29L83.06 55.03V107.29H46.03Z" />
              <path d="M178.75 0H215.61V107.29H178.75Z" />
              <path d="M224.78 0H266.65L303.34 49.49V0H348.33V107.28H306.97L269.07 60.56V107.28H224.78Z" />
            </svg>
            <div style={{ display: 'flex', fontSize: 26, letterSpacing: 1, color: 'rgba(244,239,231,0.62)' }}>{DOMAIN}</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {HEADLINE.map((line) => (
              <div
                key={line}
                style={{
                  display: 'flex',
                  fontFamily: display,
                  fontWeight: 800,
                  fontSize: fonts ? 142 : 82,
                  lineHeight: 0.9,
                  textTransform: 'uppercase',
                }}
              >
                {line}
              </div>
            ))}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 22 }}>
              <div style={{ display: 'flex', fontSize: 40, color: HAZE }}>{LINE}</div>
              <div
                style={{
                  display: 'flex',
                  flexShrink: 0,
                  alignItems: 'center',
                  whiteSpace: 'nowrap',
                  padding: '0 34px',
                  height: 76,
                  borderRadius: 8,
                  background: DOOR,
                  color: INK,
                  fontFamily: display,
                  fontWeight: 800,
                  fontSize: fonts ? 40 : 30,
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                }}
              >
                {BUTTON}
              </div>
            </div>
          </div>
        </div>

        <svg
          width={size.width}
          height={BEAT_H}
          viewBox={`0 0 ${BEAT_GROUPS * 1815 - 40} 800`}
          preserveAspectRatio="xMinYMid slice"
        >
          {Array.from({ length: BEAT_GROUPS }).flatMap((_, g) =>
            BAR.map(([kind, x, fill], i) =>
              kind === 'v' ? (
                <rect key={`${g}-${i}`} x={g * 1815 + x} y={0} width={100} height={800} rx={50} fill={fill} />
              ) : (
                <path key={`${g}-${i}`} d={kind === 'b' ? D_BACK : D_FWD} transform={`translate(${g * 1815 + x} 0)`} fill={fill} />
              ),
            ),
          )}
        </svg>
      </div>
    ),
    { ...size, fonts: fonts ?? undefined },
  );
}

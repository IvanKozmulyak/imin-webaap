import { ImageResponse } from 'next/og';

// Share card for /pro. A PNG, because Facebook, LinkedIn, X and Google all skip SVG og:images.
// Satori rules apply: flexbox only, literal colours, default font (Noto Sans).

export const alt = 'IMIN for creators: you create the night, we carry the rest';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const INK = '#0B0A14';
const PAPER = '#F4EFE7';
const HAZE = '#9C8CFF';
const DOOR = '#16B877';

// The beat band: bars in the three brand colours, heights from a fixed wave so every render matches.
const COLORS = [PAPER, HAZE, HAZE, HAZE, HAZE, PAPER, DOOR, DOOR, DOOR];
const BARS = Array.from({ length: 48 }, (_, i) => ({
  color: COLORS[i % COLORS.length],
  height: 14 + Math.round(Math.abs(0.6 * Math.sin(i * 1.7) + 0.4 * Math.sin(i * 0.5)) * 34),
}));

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '60px 80px 56px',
          background: INK,
          color: PAPER,
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <svg width="150" height="46" viewBox="0 0 348.33 107.29" xmlns="http://www.w3.org/2000/svg">
            <path fill={PAPER} d="M0 0H36.86V107.29H0Z" />
            <path
              fill={PAPER}
              d="M46.03 0H85.82L107.8 35.65L129.43 0H169.58V107.29H132.55V55.03L107.8 89.29L83.06 55.03V107.29H46.03Z"
            />
            <path fill={PAPER} d="M178.75 0H215.61V107.29H178.75Z" />
            <path
              fill={PAPER}
              transform="translate(178.75 -117.67)"
              d="M46.03 117.67H87.9L124.59 167.16V117.67H169.58V224.95H128.22L90.32 178.23V224.95H46.03Z"
            />
          </svg>
          <div
            style={{
              display: 'flex',
              marginLeft: 22,
              paddingLeft: 22,
              borderLeft: '1px solid rgba(244,239,231,0.24)',
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: 5,
              color: HAZE,
            }}
          >
            FOR CREATORS
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            fontSize: 96,
            fontWeight: 700,
            lineHeight: 1.04,
            letterSpacing: -3,
          }}
        >
          <div style={{ display: 'flex' }}>You create the night.</div>
          <div style={{ display: 'flex', color: HAZE }}>We carry the rest.</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 30 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                height: 60,
                padding: '0 30px',
                background: DOOR,
                color: INK,
                fontSize: 28,
                fontWeight: 700,
              }}
            >
              Create your night
            </div>
            <div style={{ display: 'flex', fontSize: 26, color: 'rgba(244,239,231,0.76)' }}>imin.wtf/pro</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: 48 }}>
            {BARS.map((bar, i) => (
              <div key={i} style={{ display: 'flex', width: 12, height: bar.height, borderRadius: 6, background: bar.color }} />
            ))}
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}

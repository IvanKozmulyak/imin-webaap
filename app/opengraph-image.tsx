import { ImageResponse } from 'next/og';

// Share card for /. A PNG, because Facebook, LinkedIn, X and Google all skip
// SVG og:images (the previous /assets/og-image.svg was never rendered).
// Satori rules apply: flexbox only, literal colours, default font (Noto Sans).

export const alt = 'IMIN — The two-sided platform for nightlife';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

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
          padding: '72px 80px',
          background: 'linear-gradient(135deg, #0a0816 0%, #07060d 100%)',
          color: '#f4f2fb',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            fontSize: 22,
            letterSpacing: 6,
            color: '#9a96ad',
          }}
        >
          THE TWO-SIDED PLATFORM FOR NIGHTLIFE
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            fontSize: 88,
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: -3,
          }}
        >
          <div style={{ display: 'flex' }}>The night has two problems.</div>
          <div style={{ display: 'flex', color: '#16b877' }}>We solve both.</div>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 20,
            fontSize: 24,
            color: '#9a96ad',
          }}
        >
          <div
            style={{
              display: 'flex',
              fontSize: 40,
              fontWeight: 700,
              color: '#16b877',
              letterSpacing: -1,
            }}
          >
            IMIN
          </div>
          <div style={{ display: 'flex' }}>imin.wtf</div>
        </div>
      </div>
    ),
    { ...size },
  );
}

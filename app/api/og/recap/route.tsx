import { ImageResponse } from 'next/og';
 
export const runtime = 'edge';
 
export const alt = 'IMIN Event Recap Card';
export const size = {
  width: 1080,
  height: 1920,
};
export const contentType = 'image/png';
 
interface RecapParams {
  event: string;
  date: string;
  squad: string;
  size: string;
  name: string;
  lang?: string;
}
 
export default async function Image({ searchParams }: { searchParams: Promise<RecapParams> }) {
  const params = await searchParams;
  const { event, date, squad, size: squadSize, name, lang = 'en' } = params;
  
  const isUkrainian = lang === 'uk';
  const squadText = squad 
    ? (isUkrainian ? `Команда: ${squad}` : `Squad: ${squad}`)
    : (isUkrainian ? `Разом з ${squadSize} людьми` : `With ${squadSize} people`);
 
  const title = isUkrainian ? 'Я був там!' : 'I Was There!';
  const cta = isUkrainian ? 'Знайди свою команду' : 'Find your squad';
 
  // Colors
  const bgColor = '#0a0a0a';
  const accentColor = '#10b981'; // Emerald
  const textColor = '#ffffff';
  const secondaryText = '#a1a1aa';
 
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: bgColor,
          fontFamily: 'sans-serif',
          padding: '60px',
        }}
      >
        {/* Background gradient effect */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 50% 30%, rgba(16, 185, 129, 0.15) 0%, transparent 50%)',
          }}
        />
        
        {/* IMIN Logo/Brand */}
        <div
          style={{
            position: 'absolute',
            top: '60px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <span style={{ fontSize: '48px', fontWeight: 700, color: accentColor }}>
            IMIN
          </span>
        </div>
        
        {/* Main Content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '40px',
            zIndex: 1,
          }}
        >
          {/* Celebration Icon */}
          <div
            style={{
              fontSize: '180px',
              lineHeight: 1,
            }}
          >
            🎉
          </div>
          
          {/* Title */}
          <div
            style={{
              fontSize: '80px',
              fontWeight: 700,
              color: textColor,
              textAlign: 'center',
              lineHeight: 1.1,
            }}
          >
            {title}
          </div>
          
          {/* Event Name */}
          <div
            style={{
              fontSize: '52px',
              fontWeight: 600,
              color: accentColor,
              textAlign: 'center',
              maxWidth: '900px',
            }}
          >
            {event}
          </div>
          
          {/* Date & Squad Info */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px',
              marginTop: '20px',
            }}
          >
            <div
              style={{
                fontSize: '36px',
                color: secondaryText,
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              📅 {date}
            </div>
            <div
              style={{
                fontSize: '36px',
                color: secondaryText,
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              👥 {squadText}
            </div>
          </div>
        </div>
        
        {/* Bottom CTA */}
        <div
          style={{
            position: 'absolute',
            bottom: '80px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <div
            style={{
              fontSize: '32px',
              color: secondaryText,
            }}
          >
            {cta}
          </div>
          <div
            style={{
              fontSize: '40px',
              fontWeight: 700,
              color: accentColor,
            }}
          >
            imin.wtf
          </div>
        </div>
        
        {/* Decorative elements */}
        <div
          style={{
            position: 'absolute',
            bottom: '200px',
            left: '60px',
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            backgroundColor: accentColor,
            opacity: 0.3,
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '200px',
            right: '120px',
            width: '30px',
            height: '30px',
            borderRadius: '50%',
            backgroundColor: accentColor,
            opacity: 0.2,
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  );
}
'use client';

import { useEffect, useRef, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import CustomDropdown, { DropdownOption } from './components/CustomDropdown';
import SiteHeader from './components/SiteHeader';
import SiteFooter from './components/SiteFooter';

function HomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const style = searchParams?.get('style');
  const isFestivalStyle = style === 'festival';

  const switchMode = () => {
    if (isFestivalStyle) {
      router.push('/');
    } else {
      router.push('/?style=festival');
    }
  };
  
  const [attendees, setAttendees] = useState(50000);
  const [revenue, setRevenue] = useState(600000);
  const masterFlowWrapperRef = useRef<HTMLDivElement>(null);
  const [annualAttendees, setAnnualAttendees] = useState<string>('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [partnerFieldErrors, setPartnerFieldErrors] = useState<{
    organization?: string;
    email?: string;
    annualAttendees?: string;
  }>({});

  const attendeeOptions: DropdownOption[] = [
    { value: '10k - 50k Attendees', label: '10k - 50k Attendees' },
    { value: '50k - 200k Attendees', label: '50k - 200k Attendees' },
    { value: '200k+ Attendees', label: '200k+ Attendees' },
  ];

  useEffect(() => {
    // Calculator update
    const recovered = Math.round(attendees * 0.24 * 50);
    setRevenue(recovered);
  }, [attendees]);

  useEffect(() => {
    // Force reload videos when style changes to prevent caching issues
    const videos = document.querySelectorAll('video');
    videos.forEach((video) => {
      if (video instanceof HTMLVideoElement) {
        video.load();
      }
    });
  }, [isFestivalStyle]);

  useEffect(() => {
    // Parallax blob animation with performance optimization
    let ticking = false;
    let rafId: number | null = null;

    const handleScroll = () => {
      if (!ticking) {
        rafId = requestAnimationFrame(() => {
          const scrollPos = window.scrollY;
          const blob1 = document.getElementById('blob1');
          const blob2 = document.getElementById('blob2');
          if (blob1) blob1.style.transform = `translate3d(0, ${scrollPos * 0.2}px, 0)`;
          if (blob2) blob2.style.transform = `translate3d(0, ${scrollPos * 0.15}px, 0)`;

          // Scroll ball animation
          const path = document.getElementById('motion-path') as SVGPathElement | null;
          const ball = document.getElementById('scroll-ball') as SVGCircleElement | null;
          const wrapper = masterFlowWrapperRef.current;
          const contactForm = document.getElementById('contact-form-card');

          if (path && ball && wrapper) {
            let percentage = (window.scrollY - (wrapper.offsetTop - 300)) / (wrapper.offsetHeight - window.innerHeight / 2);
            percentage = Math.max(0, Math.min(1, percentage));

            if (percentage > 0 && percentage < 1 && path) {
              let currentRadius = Math.max(15, 80 - (percentage * 200));
              let currentBlur = Math.max(10, 50 - (percentage * 120));
              let color = isFestivalStyle 
                ? (percentage < 0.1 ? '#14B8A6' : '#EC4899') // Ocean teal to vivid pink for festival
                : (percentage < 0.1 ? '#00FF94' : '#FF8F00'); // Green to orange for nightlife
              let currentOpacity = Math.min(1, percentage * 5);

              ball.setAttribute('r', currentRadius.toString());
              ball.setAttribute('fill', color);
              ball.style.filter = `blur(${currentBlur}px) drop-shadow(0 0 30px ${color})`;
              ball.style.opacity = currentOpacity.toString();

              const pathLength = path.getTotalLength();
              const point = path.getPointAtLength(percentage * pathLength);
              ball.setAttribute('cx', point.x.toString());
              ball.setAttribute('cy', point.y.toString());
            } else {
              if (ball) ball.style.opacity = '0';
            }

            // Hit target effect
            if (contactForm) {
              if (percentage > 0.95) {
                contactForm.classList.add('form-active');
              } else {
                contactForm.classList.remove('form-active');
              }
            }
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [isFestivalStyle]);

  const formatRevenue = (value: number) => {
    if (value >= 1000000) {
      return '$' + (value / 1000000).toFixed(1) + 'M';
    }
    return '$' + Math.round(value / 1000) + 'k';
  };

  return (
    <div className={isFestivalStyle ? 'festival-style' : ''}>
      {/* Mode Switcher */}
      <button 
        onClick={switchMode}
        className="mode-switcher"
        aria-label={isFestivalStyle ? 'Switch to Nightlife' : 'Switch to Festival'}
      >
        <span className="switcher-indicator"></span>
        <span className="switcher-text">
          {isFestivalStyle ? 'Switch to Nightlife' : 'Switch to Festival'}
        </span>
      </button>

      {/* Ambient Background with Blobs */}
      <div className="ambient-light" aria-hidden="true">
        <div className="blob blob-1" id="blob1"></div>
        <div className="blob blob-2" id="blob2"></div>
      </div>
      
      {/* Festival Background Layer */}
      {isFestivalStyle && (
        <>
          <div className="hero-bg-layer"></div>
          <div className="hero-overlay"></div>
        </>
      )}

      <SiteHeader />

      <div className="container">
        {/* Hero Section */}
        <section className="hero">
          <div className="hero-content" style={{ zIndex: 5 }}>
            <span className="section-tag">{isFestivalStyle ? 'Festival Season 2026' : 'Market Opportunity 2026'}</span>
            <h1>
              {isFestivalStyle ? (
                <>
                  The Full-Service Concierge For Your<br />
                  <span className="text-gradient">Solo Attendees.</span>
                </>
              ) : (
                <>
                  <span className="hero-nowrap-line">UNITING PEOPLE TO</span><br />
                  <span className="text-green">POWER YOUR EVENT.</span>
                </>
              )}
            </h1>
            <p>
              {isFestivalStyle ? (
                <>
                  24% of your audience wants to come but the logistics of traveling alone stop them. We don&apos;t just connect them; our AI concierge organizes their entire trip—from carpooling and flights to shared accommodation—so they buy the ticket.
                </>
              ) : (
                <>
                  24% of your traffic leaves because they have &quot;no one to go with.&quot; We act as the &quot;Social Infrastructure&quot; that bundles them into squads and drives them to your checkout.
                </>
              )}
            </p>
            <div className="hero-actions" style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
              <a href="#partner" className="btn-gradient">Start Integrating</a>
              <a href="#calc" className="btn-outline">{isFestivalStyle ? 'Calculate Revenue' : 'Calculate ROI'}</a>
            </div>
          </div>
          <div className="phone-perspective">
            <div className="hero-glow"></div>
            <div className="iphone-wrapper face-left">
              <div className="iphone-body"></div>
              <div className="iphone-frame"></div>
              <div className="iphone-screen">
                <Image
                  key={isFestivalStyle ? 'festival-hero' : 'nightlife-hero'}
                  src={isFestivalStyle ? "/assets/placeholders/festival-eventsimin.png" : "/assets/placeholders/eventsimin.png"}
                  alt="IMIN App"
                  className="screen-content"
                  fill
                  style={{ objectFit: 'cover' }}
                  unoptimized
                />
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Markets Section - Both Styles */}
      <section className="markets-section" style={{ padding: '60px 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center' }}>
            <span className="section-tag">WHO WE SERVE</span>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: isFestivalStyle ? 'var(--text-dark)' : 'white' }}>
              {isFestivalStyle ? 'Built For Multi-Day Experiences' : 'Built For High-Frequency Events'}
            </h2>
          </div>
            <div className="markets-grid">
              {isFestivalStyle ? (
                <>
                  <div className="market-card" key="festival-card-1">
                    <Image key="festival-img-1" src="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=800&auto=format&fit=crop" alt="Music Festival Crowd" width={800} height={200} className="market-img" unoptimized />
                    <div className="market-content">
                      <h3>Major Music Festivals</h3>
                      <p>For large-scale events where organizing camping and travel is a major friction point for solo attendees.</p>
                    </div>
                  </div>
                  <div className="market-card" key="festival-card-2">
                    <Image key="festival-img-2" src="https://images.unsplash.com/photo-1545128485-c400e7702796?q=80&w=800&auto=format&fit=crop" alt="Dance Festival" width={800} height={200} className="market-img" unoptimized />
                    <div className="market-content">
                      <h3>Dance & Bachata Congresses</h3>
                      <p>Community-driven events where connection is key. We help dancers find roommates and travel buddies.</p>
                    </div>
                  </div>
                  <div className="market-card" key="festival-card-3">
                    <Image key="festival-img-3" src="https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?q=80&w=800&auto=format&fit=crop" alt="Beach Festival" width={800} height={200} className="market-img" unoptimized />
                    <div className="market-content">
                      <h3>Destination & Resort Events</h3>
                      <p>Complex travel logistics are solved by our AI, coordinating flights and transfers for international guests.</p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="market-card" key="nightlife-card-1">
                    <Image key="nightlife-img-1" src="/assets/event-types/night-clubs.jpg" alt="Night Clubs" width={800} height={200} className="market-img" unoptimized />
                    <div className="market-content">
                      <h3>Night Clubs & Venues</h3>
                      <p>For weekly parties and regular club nights where solo attendees need a squad to feel comfortable entering.</p>
                    </div>
                  </div>
                  <div className="market-card" key="nightlife-card-2">
                    <Image key="nightlife-img-2" src="/assets/event-types/techno-raves.jpg" alt="Techno Raves" width={800} height={200} className="market-img" unoptimized />
                    <div className="market-content">
                      <h3>Techno Raves & Underground</h3>
                      <p>Community-focused events where finding your crew is essential. We match by music taste and vibe.</p>
                    </div>
                  </div>
                  <div className="market-card" key="nightlife-card-3">
                    <Image key="nightlife-img-3" src="/assets/event-types/rooftop.jpg" alt="Rooftop Events" width={800} height={200} className="market-img" unoptimized />
                    <div className="market-content">
                      <h3>Rooftop & Pop-Up Events</h3>
                      <p>Exclusive events where social proof matters. We bundle solo attendees into confident squads.</p>
                    </div>
                  </div>
                </>
              )}
            </div>
        </div>
      </section>

      <div className="master-flow-wrapper" ref={masterFlowWrapperRef}>
        {/* SVG Track Container */}
        <div className="svg-track-container">
          <svg id="main-svg" width="100%" height="100%" viewBox="0 0 1200 4500" preserveAspectRatio="none">
            <path
              id="motion-path"
              className="track-path"
              d="M 600 100 C 600 300 200 600 200 1000 C 200 1400 1000 1500 1000 1900 C 1000 2300 200 2400 200 2800 C 200 3200 1000 3300 1000 3700 C 1000 4100 600 4200 600 4400"
            />
            <circle
              id="scroll-ball"
              className="track-ball"
              cx="0"
              cy="0"
              r="80"
              fill={isFestivalStyle ? "#14B8A6" : "#00FF94"}
              filter="blur(50px)"
              opacity="0.6"
            />
          </svg>
        </div>

        {/* ROI Calculator Section */}
        <section id="calc" className="container" style={{ padding: '60px 0' }}>
          <div className="calc-grid">
            <div>
              <span className="section-tag" style={isFestivalStyle ? {} : { background: 'rgba(59, 130, 246, 0.1)', borderColor: 'var(--glow-blue)', color: 'var(--glow-blue)' }}>
                {isFestivalStyle ? 'REVENUE FORECAST' : 'ROI CALCULATOR'}
              </span>
              <h2 style={{ fontSize: '2.5rem', lineHeight: '1.1', marginBottom: '20px' }}>
                {isFestivalStyle ? (
                  <>
                    Calculate Your <br />
                    <span className="text-gradient">Recoverable Revenue.</span>
                  </>
                ) : (
                  <>
                    CALCULATE YOUR<br />
                    <span className="text-green">LOST REVENUE.</span>
                  </>
                )}
              </h2>
              <p style={{ color: 'var(--text-muted)' }}>
                {isFestivalStyle ? (
                  <>
                    Move the slider to match your annual attendance. See how much money is walking away because people don&apos;t want to handle logistics alone.
                  </>
                ) : (
                  <>
                    Move the slider to match your annual attendance. See exactly how much money is walking away because they have &quot;no one to go with.&quot;
                  </>
                )}
              </p>
              <label style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', display: 'block', marginTop: '40px', fontSize: '0.9rem', letterSpacing: '1px' }}>
                ANNUAL ATTENDEES
              </label>
              <div id="attendee-val" className={isFestivalStyle ? '' : 'text-green'} style={{ fontWeight: 700, fontSize: '3rem', lineHeight: '1', marginBottom: '20px', color: isFestivalStyle ? 'var(--primary-purple)' : undefined }}>
                {attendees.toLocaleString()}
              </div>
              <input
                type="range"
                min={5000}
                max={500000}
                step={5000}
                value={attendees}
                onChange={(e) => setAttendees(parseInt(e.target.value))}
                className="slider"
                id="calc-slider"
                style={{ margin: 0 }}
              />
            </div>
            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <h3 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px' }}>
                Estimated Recoverable Revenue
              </h3>
              <div id="revenue-val" style={{ fontSize: '6rem', fontWeight: 900, color: isFestivalStyle ? 'var(--text-dark)' : 'white', lineHeight: '1', textShadow: isFestivalStyle ? 'none' : '0 0 40px rgba(0, 255, 148, 0.3)' }}>
                {formatRevenue(revenue)}
              </div>
              <p style={{ fontSize: '1.2rem', color: isFestivalStyle ? 'var(--text-dark)' : 'white', marginTop: '20px', fontWeight: 500 }}>
                Based on a <span style={{ color: isFestivalStyle ? 'var(--vivid-pink)' : 'var(--glow-green)', fontWeight: 700 }}>+24%</span> uplift in ticket sales.
              </p>
              <p style={{ marginTop: '30px', fontSize: '0.8rem', color: '#666', lineHeight: '1.4', maxWidth: '80%', marginLeft: 'auto', marginRight: 'auto' }}>
                *Projections are estimates based on industry averages and an assumed $50 avg. ticket price.
              </p>
            </div>
          </div>
        </section>

        {/* Flow Steps Section */}
        <section className="flow-section">
          <div className="container">
            <div className="flow-header">
              <span className="section-tag">{'// THE MECHANIC'}</span>
              <h2 style={{ fontSize: '3rem', color: isFestivalStyle ? 'var(--text-dark)' : undefined }}>
                {isFestivalStyle ? 'From Solo to Squad in 4 Steps' : 'How We Fill The Floor.'}
              </h2>
            </div>

            {/* Step 01 */}
            <div className="flow-row">
              <div className="flow-phone-wrap">
                <div className="flow-glow glow-1"></div>
                <div className="iphone-wrapper face-right">
                  <div className="iphone-body"></div>
                  <div className="iphone-frame"></div>
                  <div className="iphone-screen">
                    <Image
                      key={isFestivalStyle ? 'festival-link' : 'nightlife-link'}
                      src={isFestivalStyle ? "/assets/placeholders/festival-linkscreen.png" : "/assets/placeholders/linkscreen.png"}
                      alt="Link"
                      className="screen-content"
                      fill
                      style={{ objectFit: 'cover' }}
                      unoptimized
                    />
                  </div>
                </div>
              </div>
              <div className="flow-text">
                <div className="flow-step-num">01</div>
                <h3 className="flow-title">The Smart Link</h3>
                <p className="flow-desc">No complex integration. You simply place a unique IMIN link in your social bio or email blast.</p>
              </div>
            </div>

            {/* Step 02 */}
            <div className="flow-row right-img">
              <div className="flow-phone-wrap">
                <div className="flow-glow glow-2"></div>
                <div className="iphone-wrapper face-left">
                  <div className="iphone-body"></div>
                  <div className="iphone-frame"></div>
                  <div className="iphone-screen">
                    <Image
                      key={isFestivalStyle ? 'festival-regis' : 'nightlife-regis'}
                      src={isFestivalStyle ? "/assets/placeholders/festival-regisimin.png" : "/assets/placeholders/regisimin.png"}
                      alt="Form"
                      className="screen-content"
                      fill
                      style={{ objectFit: 'cover' }}
                      unoptimized
                    />
                  </div>
                </div>
              </div>
              <div className="flow-text">
                <div className="flow-step-num">02</div>
                <h3 className="flow-title">The Vibe Check</h3>
                <p className="flow-desc">
                  {isFestivalStyle 
                    ? 'We capture user data (Age, Music Taste, Vibe) and perform a social verification. Our AI matches them with compatible festival-goers.'
                    : 'We capture user data (Age, Music Taste, Vibe) and perform a social verification.'}
                </p>
              </div>
            </div>

            {/* Step 03 */}
            <div className="flow-row">
              <div className="flow-phone-wrap">
                <div className="flow-glow glow-3"></div>
                <div className="iphone-wrapper face-right">
                  <div className="iphone-body"></div>
                  <div className="iphone-frame"></div>
                  <div className="iphone-screen">
                    <Image
                      key={isFestivalStyle ? 'festival-telegram' : 'nightlife-telegram'}
                      src={isFestivalStyle ? "/assets/placeholders/festival-telegramimin.png" : "/assets/placeholders/telegramimin.png"}
                      alt="Chat"
                      className="screen-content"
                      fill
                      style={{ objectFit: 'cover' }}
                      unoptimized
                    />
                  </div>
                </div>
              </div>
              <div className="flow-text">
                <div className="flow-step-num">03</div>
                <h3 className="flow-title">{isFestivalStyle ? 'The Logistics Concierge' : 'The Squad Sale'}</h3>
                <p className="flow-desc">
                  {isFestivalStyle 
                    ? 'A private squad chat is formed. Our AI agent immediately starts organizing logistics: coordinating carpools from their city, finding flight options, and securing shared accommodation options tailored to their budget.'
                    : 'A private Telegram group is formed. Our AI Bot facilitates introductions and pushes a "Group Buy" button.'}
                </p>
              </div>
            </div>

            {/* Step 04 */}
            <div className="flow-row right-img">
              <div className="flow-phone-wrap">
                <div className="flow-glow glow-4"></div>
                <div className="iphone-wrapper face-left">
                  <div className="iphone-body"></div>
                  <div className="iphone-frame"></div>
                  <div className="iphone-screen">
                    <video 
                      key={isFestivalStyle ? 'festival-video' : 'nightlife-video'}
                      className="screen-content" 
                      autoPlay 
                      loop 
                      muted 
                      playsInline 
                      poster={isFestivalStyle ? "/assets/placeholders/festival-partyvideo-poster.jpg" : "/assets/placeholders/partyvideo-poster.jpg"}
                    >
                      <source src={isFestivalStyle ? "/assets/placeholders/festival-partyvideo.mp4" : "/assets/placeholders/partyvideo.mp4"} type="video/mp4" />
                    </video>
                  </div>
                </div>
              </div>
              <div className="flow-text">
                <div className="flow-step-num">04</div>
                <h3 className="flow-title">{isFestivalStyle ? 'The Squad Arrival' : 'The Experience'}</h3>
                <p className="flow-desc">
                  {isFestivalStyle 
                    ? 'Logistics solved, entry anxiety gone. They buy the ticket and arrive as a cohesive unit, ready to spend the weekend together (and spend more on-site).'
                    : 'Attendees arrive together, reducing entry anxiety. Squads stay longer and spend more.'}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Economics Section */}
        <section id="economics" className="container" style={{ padding: '60px 0' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <span className="section-tag">OUR PRIORITIES</span>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: isFestivalStyle ? 'var(--text-dark)' : undefined }}>
              What We Focus On
            </h2>
          </div>
          <div className="bento-grid">
            <div className="glass-card">
              <span className="section-tag" style={isFestivalStyle ? { background: 'rgba(20, 184, 166, 0.1)', borderColor: 'var(--ocean-teal)', color: 'var(--ocean-teal)' } : { background: 'rgba(0, 255, 148, 0.1)', borderColor: 'var(--glow-green)' }}>
                PRIORITY #1
              </span>
              <h2 style={{ fontSize: '2.5rem', marginBottom: '20px', color: isFestivalStyle ? 'var(--text-dark)' : undefined }}>Ticket Sales.</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '30px' }}>
                {isFestivalStyle 
                  ? 'We recover the "Lost Audience." By bundling solo users into squads and solving travel, we convert hesitant traffic into sales.'
                  : 'We recover the "Lost Audience." By bundling solo users into squads, we convert hesitant traffic into bulk ticket sales.'}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ fontSize: '3rem' }}>🎟️</div>
                <div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: isFestivalStyle ? 'var(--text-dark)' : 'white' }}>+24%</div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Volume Uplift</div>
                </div>
              </div>
            </div>
            <div className="glass-card">
              <span className="section-tag" style={isFestivalStyle ? { background: 'rgba(139, 92, 246, 0.1)', borderColor: 'var(--primary-purple)', color: 'var(--primary-purple)' } : { background: 'rgba(139, 92, 246, 0.1)', borderColor: 'var(--glow-purple)', color: 'var(--glow-purple)' }}>
                PRIORITY #2
              </span>
              <h2 style={{ fontSize: '2.5rem', marginBottom: '20px', color: isFestivalStyle ? 'var(--text-dark)' : undefined }}>On-Site Spend.</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '30px' }}>
                {isFestivalStyle 
                  ? 'Solo attendees leave early. Squads stay late and utilize upsells (Glamping, Shuttles, VIP upgrades).'
                  : 'Solo attendees leave early. Squads stay late, buy rounds of drinks, and utilize upsells.'}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ fontSize: '3rem' }}>🍹</div>
                <div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: isFestivalStyle ? 'var(--text-dark)' : 'white' }}>+30%</div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Bar Revenue</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* AI Bot Section */}
        <section id="bot" className="container" style={{ padding: '60px 0' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center' }}>
            <div>
              <span className="section-tag" style={isFestivalStyle ? { color: 'var(--primary-purple)', borderColor: 'var(--primary-purple)' } : { color: 'var(--glow-purple)', borderColor: 'var(--glow-purple)' }}>
                MEET THE AGENT
              </span>
              <h2 style={{ fontSize: '3rem', lineHeight: '1.1', marginBottom: '30px', color: isFestivalStyle ? 'var(--text-dark)' : undefined }}>
                {isFestivalStyle ? 'More Than A Chatbot.\nA 24/7 Travel Agent.' : 'More Than A Chat.\nA Concierge.'}
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '40px' }}>
                {isFestivalStyle 
                  ? 'Our AI Bot sits inside the squad chat and handles the complex logistics that humans hate doing.'
                  : 'Our AI Bot acts like a savvy team member inside the squad chat.'}
              </p>
              <ul style={{ listStyle: 'none', color: 'var(--text-muted)' }}>
                <li style={{ marginBottom: '20px', display: 'flex', gap: '15px' }}>
                  <span style={{ color: isFestivalStyle ? 'var(--vivid-pink)' : 'var(--glow-green)' }}>✓</span>
                  <strong>{isFestivalStyle ? 'Accommodation Bundling:' : 'Human-Like Persona:'}</strong> {isFestivalStyle ? 'Finds Airbnbs/Hotels to split.' : 'Uses slang and memes.'}
                </li>
                <li style={{ marginBottom: '20px', display: 'flex', gap: '15px' }}>
                  <span style={{ color: isFestivalStyle ? 'var(--vivid-pink)' : 'var(--glow-green)' }}>✓</span>
                  <strong>Logistics Solver:</strong> {isFestivalStyle ? 'Organizes carpools based on location.' : 'Organizes carpooling.'}
                </li>
                <li style={{ marginBottom: '20px', display: 'flex', gap: '15px' }}>
                  <span style={{ color: isFestivalStyle ? 'var(--vivid-pink)' : 'var(--glow-green)' }}>✓</span>
                  <strong>Revenue Upsell:</strong> {isFestivalStyle ? 'Suggests official festival travel partners.' : 'Suggests partner hotels.'}
                </li>
              </ul>
            </div>
            <div className="chat-interface">
              <div className="chat-header">
                <div className="bot-avatar">IM</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: isFestivalStyle ? 'var(--text-dark)' : undefined }}>
                    {isFestivalStyle ? 'IMIN Travel Concierge' : 'IMIN Squad Host'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: isFestivalStyle ? 'var(--primary-purple)' : 'var(--glow-green)' }}>Online • AI Agent</div>
                </div>
              </div>
              <div className="chat-bubble bubble-bot">Yo Squad! ⚡ Looks like 3 of you are coming from downtown. Need a ride?</div>
              <div className="chat-bubble bubble-user">Yeah, parking is tight there.</div>
              <div className="chat-bubble bubble-bot">
                {isFestivalStyle 
                  ? 'Smart. I found a 4-person Airbnb near the venue and can organize a carpool.'
                  : 'Smart. I can organize a carpool or grab a 5-seater Uber for you guys?'}
              </div>
              <div className="chat-bubble bubble-action">
                <span>{isFestivalStyle ? '🚙' : '🚖'}</span> {isFestivalStyle ? 'View Travel Plan & Split Costs' : 'Setup Carpool Group'}
              </div>
            </div>
          </div>
        </section>

        {/* Partner Form Section */}
        <section id="partner" style={{ padding: '60px 0 80px 0' }}>
          <div className="container">
            {/* Success Modal */}
            {showSuccess && (
              <div className="partner-success-overlay" onClick={() => setShowSuccess(false)}>
                <div className="partner-success-modal" onClick={(e) => e.stopPropagation()}>
                  <button 
                    className="partner-success-close" 
                    onClick={() => setShowSuccess(false)}
                    aria-label="Close"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                  <div className="partner-success-content">
                    <div className="partner-success-icon">
                      <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
                        <path d="M8 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '16px', color: isFestivalStyle ? 'var(--text-dark)' : 'white' }}>
                      Thank You!
                    </h2>
                    <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginBottom: '30px', lineHeight: '1.6' }}>
                      We&apos;ve received your application. Our team will review it and get back to you within 24-48 hours.
                    </p>
                    <button 
                      onClick={() => setShowSuccess(false)}
                      className="btn-gradient"
                      style={{ padding: '14px 32px', fontSize: '1rem' }}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
            <div id="contact-form-card" className="glass-card form-target" style={{ maxWidth: '900px', margin: '0 auto', border: isFestivalStyle ? '1px solid var(--glass-border)' : '1px solid var(--glow-green)', textAlign: 'center' }}>
              <span className="section-tag" style={isFestivalStyle ? { background: 'var(--text-dark)', color: 'white' } : { background: 'var(--glow-green)', color: 'black' }}>
                FOUNDING PARTNER PROGRAM
              </span>
              <h2 style={{ fontSize: '3rem', fontWeight: 800, lineHeight: '1', marginBottom: '20px', color: isFestivalStyle ? 'var(--text-dark)' : undefined }}>
                {isFestivalStyle ? 'FILL YOUR FIELDS.' : 'FILL YOUR VENUE.'}
              </h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '40px' }}>
                {isFestivalStyle 
                  ? 'We are opening 50 spots for our Launch Cohort (Q1 2026). Apply now.'
                  : 'We are opening 50 spots for our Launch Cohort (Q1 2026).'}
              </p>
              <form
                noValidate
                onSubmit={async (e) => {
                  e.preventDefault();
                  const form = e.currentTarget as HTMLFormElement;
                  const formData = new FormData(form);
                  const organization = ((formData.get('organization') as string) || '').trim();
                  const email = ((formData.get('email') as string) || '').trim();

                  const nextErrors: typeof partnerFieldErrors = {};
                  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

                  if (!organization) nextErrors.organization = 'Please enter your organization name.';
                  if (!email || !emailRegex.test(email)) nextErrors.email = 'Please enter a valid email address.';
                  if (!annualAttendees) nextErrors.annualAttendees = 'Please select annual attendees.';

                  if (Object.keys(nextErrors).length > 0) {
                    setPartnerFieldErrors(nextErrors);
                    return;
                  }

                  setPartnerFieldErrors({});

                  const data = {
                    organization,
                    email,
                    annualAttendees,
                  };
                  try {
                    const response = await fetch('/api/partner-request', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(data),
                    });
                    if (response.ok) {
                      form.reset();
                      setAnnualAttendees('');
                      setPartnerFieldErrors({});
                      setShowSuccess(true);
                    } else {
                      const res = await response.json().catch(() => null);
                      setPartnerFieldErrors({ email: res?.error || 'Failed to send request. Please try again.' });
                    }
                  } catch (error) {
                    setPartnerFieldErrors({ email: 'An error occurred. Please try again.' });
                  }
                }}
                style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', textAlign: 'left' }}
              >
                <div style={{ gridColumn: 'span 2' }}>
                  <label htmlFor="organization" style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 600, color: isFestivalStyle ? 'var(--text-dark)' : 'white' }}>
                    Organization Name
                  </label>
                  <input 
                    type="text" 
                    id="organization"
                    className={`form-input ${partnerFieldErrors.organization ? 'error' : ''}`}
                    placeholder={isFestivalStyle ? 'e.g., Coachella, Tomorrowland, Electric Daisy Carnival' : 'e.g., Your Venue Name'} 
                    name="organization" 
                    aria-required="true"
                    aria-invalid={partnerFieldErrors.organization ? 'true' : 'false'}
                    onChange={() => {
                      if (partnerFieldErrors.organization) setPartnerFieldErrors((p) => ({ ...p, organization: undefined }));
                    }}
                  />
                  {partnerFieldErrors.organization && <div className="form-error-text">{partnerFieldErrors.organization}</div>}
                </div>
                <div>
                  <label htmlFor="email" style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 600, color: isFestivalStyle ? 'var(--text-dark)' : 'white' }}>
                    Work Email
                  </label>
                  <input 
                    type="email" 
                    id="email"
                    className={`form-input ${partnerFieldErrors.email ? 'error' : ''}`}
                    placeholder="your.email@organization.com" 
                    name="email" 
                    aria-required="true"
                    aria-invalid={partnerFieldErrors.email ? 'true' : 'false'}
                    onChange={() => {
                      if (partnerFieldErrors.email) setPartnerFieldErrors((p) => ({ ...p, email: undefined }));
                    }}
                  />
                  {partnerFieldErrors.email && <div className="form-error-text">{partnerFieldErrors.email}</div>}
                </div>
                <div>
                  <label htmlFor="annualAttendees" style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 600, color: isFestivalStyle ? 'var(--text-dark)' : 'white' }}>
                    Annual Attendees
                  </label>
                  <CustomDropdown
                    options={attendeeOptions}
                    value={annualAttendees}
                    onChange={(val) => {
                      setAnnualAttendees(val);
                      if (partnerFieldErrors.annualAttendees) setPartnerFieldErrors((p) => ({ ...p, annualAttendees: undefined }));
                    }}
                    placeholder="Select Annual Attendees"
                    isFestivalStyle={isFestivalStyle}
                    className={partnerFieldErrors.annualAttendees ? 'error' : ''}
                  />
                  <input type="hidden" name="annualAttendees" value={annualAttendees} />
                  {partnerFieldErrors.annualAttendees && <div className="form-error-text">{partnerFieldErrors.annualAttendees}</div>}
                </div>
                <div style={{ gridColumn: 'span 2', marginTop: '10px' }}>
                  <button type="submit" className="btn-gradient" style={{ width: '100%', fontSize: '1.1rem', padding: '16px' }}>
                    {isFestivalStyle ? 'Apply for Festival Partnership' : 'Apply for Access'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>
      </div>

      <SiteFooter />
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={null}>
      <HomeContent />
    </Suspense>
  );
}

'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import LandingHeader from '../components/LandingHeader';
import LandingFooter from '../components/LandingFooter';

export default function LandingPage() {
  const masterFlowWrapperRef = useRef<HTMLDivElement>(null);

  // Content
  const content = {
    eventName: 'Luxembourg Bachata Festival',
    eventDate: 'Feb 2026',
    heroTitle: 'IMIN helps dancers go to festivals together.',
    heroSubtitle: "Let's go together.",
    heroDescription: 'For dancers who want to go, but don\'t want to figure everything out alone. Answer a few quick questions and get added to a small messenger group with dancers heading to the same festival.',
    barrierTitle: 'Why Dancers Wait',
    barrierDescription: 'Most dancers buy their tickets in the last 1-3 months - not because they doubt the festival, but because they\'re still figuring out who they\'ll go with and how it will work.',
    barrierCards: [
      { emoji: '🚗', title: 'A Ride To Share', description: 'Travel costs are high. Finding someone to split gas or share a train ride makes the trip possible.' },
      { emoji: '🏠', title: 'Accommodation', description: 'Hotels are expensive alone. You need trustworthy people to split an Airbnb or share a room with.' },
      { emoji: '🥂', title: 'The Social Side', description: 'Pre-parties, workshop buddies, and a crew to dance with. It\'s about fun company, not just logistics.' },
    ],
    finalCallTitle: "Let's go together.",
    finalCallDescription: 'You\'re just a few clicks away from going to the Luxembourg Bachata Festival with new teammates.',
    promoText: '✨ You also get 5% off the Full Pass with our promo.',
  };

  useEffect(() => {
    // Parallax blob animation
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
              let color = percentage < 0.1 ? '#14B8A6' : '#EC4899';
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
  }, []);

  return (
    <div className="festival-style">
      {/* Ambient Background with Blobs */}
      <div className="ambient-light" aria-hidden="true">
        <div className="blob blob-1" id="blob1"></div>
        <div className="blob blob-2" id="blob2"></div>
      </div>

      {/* Hero Background Layer */}
      <div className="hero-bg-layer"></div>
      <div className="hero-overlay"></div>

      <LandingHeader />

      <div className="container">
        {/* Hero Section */}
        <section id="hero" className="hero landing-hero" style={{ minHeight: '90vh', padding: '140px 0 60px 0', position: 'relative', overflow: 'visible' }}>
          <div className="hero-content" style={{ zIndex: 5, maxWidth: '800px', textAlign: 'center' }}>
            <h1 style={{ fontSize: '3.5rem', fontWeight: 800, lineHeight: 1.1, marginBottom: '25px', letterSpacing: '-0.02em', color: 'var(--text-dark)' }}>
              <span className="text-gradient">{content.heroTitle}</span>
            </h1>
            <p style={{ fontSize: '1.15rem', color: '#475569', maxWidth: '550px', margin: '0 auto 35px', fontWeight: 500 }}>
              {content.heroDescription}
            </p>
            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <Link href="/events?style=festival" className="btn-gradient">Join now & find your squad</Link>
            </div>

            <div style={{ marginTop: '35px', display: 'flex', gap: '20px', flexWrap: 'wrap', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-dark)', justifyContent: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: 'var(--ocean-teal)', fontSize: '1.3rem', fontWeight: 900 }}>✓</span> Free to join
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: 'var(--ocean-teal)', fontSize: '1.3rem', fontWeight: 900 }}>✓</span> No app to download
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: 'var(--ocean-teal)', fontSize: '1.3rem', fontWeight: 900 }}>✓</span> Telegram Groups
              </div>
            </div>
          </div>
          <div className="phone-perspective">
            <div className="hero-glow"></div>
            <div className="iphone-wrapper face-left">
              <div className="iphone-body"></div>
              <div className="iphone-frame"></div>
              <div className="iphone-screen">
                <Image
                  src="/assets/placeholders/festival-eventsimin.png"
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

      {/* Barriers Section */}
      <section id="barriers" style={{ padding: '80px 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '900px', margin: '0 auto' }}>
            <span className="section-tag">THE BARRIER</span>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-dark)', marginBottom: '20px' }}>{content.barrierTitle}</h2>
            <h3 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '50px', lineHeight: '1.3' }}>
              Before committing, dancers usually need:
            </h3>
          </div>

          <div className="markets-grid" style={{ marginTop: '50px' }}>
            {content.barrierCards.map((card, idx) => {
              const placeholderImages = [
                '/assets/carpool.jpg',
                '/assets/accom.jpg',
                '/assets/preparties.jpg',
              ];
              return (
                <div
                  key={idx}
                  className="market-card"
                  style={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <div style={{ width: '100%', height: '220px', position: 'relative', overflow: 'hidden' }}>
                    <Image
                      src={placeholderImages[idx] || '/assets/placeholder.jpg'}
                      alt={card.title}
                      fill
                      style={{ objectFit: 'cover' }}
                      unoptimized
                    />
                  </div>
                  <div className="market-content">
                    <h3>{card.emoji} {card.title}</h3>
                    <p>{card.description}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ textAlign: 'center', marginTop: '50px', fontWeight: 700, color: 'var(--primary-purple)' }}>
            Once these pieces are in place, the decision becomes easy.
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
              fill="#14B8A6"
              filter="blur(50px)"
              opacity="0.6"
            />
          </svg>
        </div>

        {/* Flow Steps Section */}
        <section id="how-it-works" className="flow-section" style={{ paddingTop: '50px' }}>
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: '80px' }}>
              <span className="section-tag" style={{ background: '#E879F9', color: 'white', border: 'none' }}>HOW IT WORKS</span>
            </div>

            <div className="flow-row">
              <div className="flow-phone-wrap">
                <div className="flow-glow glow-1"></div>
                <div className="iphone-wrapper face-right">
                  <div className="iphone-body"></div>
                  <div className="iphone-frame"></div>
                  <div className="iphone-screen">
                    <Image
                      src="/assets/choose.jpg"
                      alt="Choose your festival"
                      className="screen-content"
                      fill
                      style={{ objectFit: 'cover' }}
                      unoptimized
                    />
                  </div>
                </div>
              </div>
              <div className="flow-text" style={{ maxWidth: '450px' }}>
                <div className="flow-step-num">01</div>
                <h3 className="flow-title">Choose your festival</h3>
                <p className="flow-desc">Select the festival you&apos;re hesitating to go to and proceed to next step.</p>
              </div>
            </div>

            <div className="flow-row right-img">
              <div className="flow-phone-wrap">
                <div className="flow-glow glow-2"></div>
                <div className="iphone-wrapper face-left">
                  <div className="iphone-body"></div>
                  <div className="iphone-frame"></div>
                  <div className="iphone-screen">
                    <Image
                      src="/assets/placeholders/festival-regisimin.png"
                      alt="Form"
                      className="screen-content"
                      fill
                      style={{ objectFit: 'cover' }}
                      unoptimized
                    />
                  </div>
                </div>
              </div>
              <div className="flow-text" style={{ maxWidth: '450px' }}>
                <div className="flow-step-num">02</div>
                <h3 className="flow-title">Tell us what&apos;s your needs</h3>
                <p className="flow-desc">A ride or a place to stay? A pre-party, or class partners? We collect your needs to find the right squad.</p>
              </div>
            </div>

            <div className="flow-row">
              <div className="flow-phone-wrap">
                <div className="flow-glow glow-3"></div>
                <div className="iphone-wrapper face-right">
                  <div className="iphone-body"></div>
                  <div className="iphone-frame"></div>
                  <div className="iphone-screen">
                    <Image
                      src="/assets/placeholders/festival-telegramimin.png"
                      alt="Chat"
                      className="screen-content"
                      fill
                      style={{ objectFit: 'cover' }}
                      unoptimized
                    />
                  </div>
                </div>
              </div>
              <div className="flow-text" style={{ maxWidth: '450px' }}>
                <div className="flow-step-num">03</div>
                <h3 className="flow-title">Get matched with the right people</h3>
                <p className="flow-desc">We add you to a small Telegram group of dancers based on your specific needs.</p>
              </div>
            </div>

            <div className="flow-row right-img">
              <div className="flow-phone-wrap">
                <div className="flow-glow glow-4"></div>
                <div className="iphone-wrapper face-left">
                  <div className="iphone-body"></div>
                  <div className="iphone-frame"></div>
                  <div className="iphone-screen">
                    <video 
                      className="screen-content" 
                      autoPlay 
                      loop 
                      muted 
                      playsInline 
                      poster="/assets/placeholders/festival-partyvideo-poster.jpg"
                    >
                      <source src="/assets/placeholders/festival-partyvideo.mp4" type="video/mp4" />
                    </video>
                  </div>
                </div>
              </div>
              <div className="flow-text" style={{ maxWidth: '450px' }}>
                <div className="flow-step-num">04</div>
                <h3 className="flow-title">Make a plan, then go</h3>
                <p className="flow-desc">Once you have people to share the trip with, the decision to buy a festival ticket becomes easy.</p>

                <div style={{ marginTop: '30px' }}>
                  <Link href="/events?style=festival" className="btn-gradient" style={{ boxShadow: '0 10px 20px rgba(236, 72, 153, 0.4)' }}>Join & Enjoy</Link>
                </div>

                <div style={{ marginTop: '20px', fontSize: '0.9rem', color: 'var(--vivid-pink)', fontWeight: 600 }}>
                  {content.promoText}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="why-this-works" className="container" style={{ padding: '50px 0' }}>
          <div className="glass-card why-this-works-card">
            <div className="why-this-works-grid">
              <div className="why-this-works-text">
                <span className="section-tag" style={{ background: '#E879F9', color: 'white', border: 'none' }}>WHY IT WORKS</span>
                <h2 style={{ fontSize: '2.5rem', marginBottom: '20px', marginTop: '10px', lineHeight: '1.2' }}>This isn&apos;t just another group chat.</h2>
              </div>
              <div className="why-this-works-list">
                <div style={{ background: '#E879F9', color: 'white', display: 'inline-block', padding: '8px 16px', borderRadius: '8px', fontWeight: 700, marginBottom: '20px', fontSize: '0.9rem' }}>Our groups are:</div>
                <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                  <li style={{ marginBottom: '16px', display: 'flex', alignItems: 'flex-start', gap: '12px', fontWeight: 500, color: 'var(--text-dark)', lineHeight: '1.5' }}>
                    <span style={{ color: 'var(--vivid-pink)', fontWeight: 800, fontSize: '1.2rem', flexShrink: 0, marginTop: '2px' }}>✓</span>
                    <span>Matched by actual needs (Housing, Travel, Classes)</span>
                  </li>
                  <li style={{ marginBottom: '16px', display: 'flex', alignItems: 'flex-start', gap: '12px', fontWeight: 500, color: 'var(--text-dark)', lineHeight: '1.5' }}>
                    <span style={{ color: 'var(--vivid-pink)', fontWeight: 800, fontSize: '1.2rem', flexShrink: 0, marginTop: '2px' }}>✓</span>
                    <span>Small, smartly organized squads (Max 6-8 people)</span>
                  </li>
                  <li style={{ marginBottom: '16px', display: 'flex', alignItems: 'flex-start', gap: '12px', fontWeight: 500, color: 'var(--text-dark)', lineHeight: '1.5' }}>
                    <span style={{ color: 'var(--vivid-pink)', fontWeight: 800, fontSize: '1.2rem', flexShrink: 0, marginTop: '2px' }}>✓</span>
                    <span>Real dancers are your group members</span>
                  </li>
                  <li style={{ marginBottom: '16px', display: 'flex', alignItems: 'flex-start', gap: '12px', fontWeight: 500, color: 'var(--text-dark)', lineHeight: '1.5' }}>
                    <span style={{ color: 'var(--vivid-pink)', fontWeight: 800, fontSize: '1.2rem', flexShrink: 0, marginTop: '2px' }}>✓</span>
                    <span>Focused on making plans, not endless chatting</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section id="join" style={{ padding: '100px 0' }}>
          <div className="container">
            <div id="contact-form-card" className="glass-card form-target" style={{ maxWidth: '700px', margin: '0 auto', border: '1px solid var(--glass-border)', textAlign: 'center' }}>
              <span className="section-tag" style={{ background: 'var(--text-dark)', color: 'white' }}>FINAL CALL</span>
              <h2 style={{ fontSize: '3rem', fontWeight: 800, lineHeight: 1.1, marginBottom: '20px', color: 'var(--text-dark)' }}>{content.finalCallTitle}</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '40px', fontSize: '1.1rem' }}>
                {content.finalCallDescription}
              </p>

              <Link href="/events?style=festival" className="btn-gradient" style={{ fontSize: '1.2rem', width: '100%', padding: '20px', display: 'block', textAlign: 'center' }}>
                Join the Team — IMIN
              </Link>
            </div>
          </div>
        </section>
      </div>

      <LandingFooter />
    </div>
  );
}

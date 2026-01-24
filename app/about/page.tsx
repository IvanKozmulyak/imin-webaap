'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';

function AboutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const style = searchParams?.get('style');
  const isFestivalStyle = style === 'festival';

  const switchMode = () => {
    router.push(isFestivalStyle ? '/about' : '/about?style=festival');
  };

  const team = [
    { name: 'Bogdan Shostak', role: 'Product & Partnerships', imageSrc: '/assets/team/team-1.jpeg' },
    { name: 'Ivan Kozmuliak', role: 'Engineering & AI', imageSrc: '/assets/team/team-2.jpg' },
    { name: 'Mykyta Khodakivskyi', role: 'Community & Operations', imageSrc: '/assets/team/team-3.jpeg' },
  ];

  return (
    <div className={isFestivalStyle ? 'festival-style' : ''}>
      {/* Mode Switcher */}
      <button
        onClick={switchMode}
        className="mode-switcher"
        aria-label={isFestivalStyle ? 'Switch to Nightlife' : 'Switch to Festival'}
      >
        <span className="switcher-indicator"></span>
        <span className="switcher-text">{isFestivalStyle ? 'Switch to Nightlife' : 'Switch to Festival'}</span>
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

      <main className="container" style={{ paddingTop: '60px', paddingBottom: '80px' }}>
        {/* Intro */}
        <section className="glass-card" style={{ padding: '60px 40px', textAlign: 'center' }}>
          <span className="section-tag">ABOUT US</span>
          <h1 style={{ fontSize: '3rem', fontWeight: 900, letterSpacing: '-0.02em', margin: '18px 0 14px 0', color: isFestivalStyle ? 'var(--text-dark)' : 'white' }}>
            Building the social infrastructure for live experiences.
          </h1>
          <p style={{ maxWidth: '860px', margin: '0 auto', color: 'var(--text-muted)', fontSize: '1.15rem', lineHeight: 1.7 }}>
            IMIN helps people go from “I have no one to go with” to showing up with a squad. For organizers, we turn hesitant solo traffic into confident groups—driving ticket sales and
            creating better nights (and weekends) for everyone.
          </p>
        </section>

        {/* Team */}
        <section style={{ padding: '50px 0 0 0' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <span className="section-tag">THE TEAM</span>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: isFestivalStyle ? 'var(--text-dark)' : undefined }}>Meet the people behind IMIN</h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: '820px', margin: '14px auto 0 auto', lineHeight: 1.7 }}>
              A small, high-ownership team building the tools that turn solo attendees into squads—across nightlife and multi-day events.
            </p>
          </div>

          <div className="markets-grid">
            {team.map((member) => (
              <div className="market-card" key={member.name}>
                <Image
                  src={member.imageSrc}
                  alt={`${member.name} headshot`}
                  width={800}
                  height={320}
                  className="market-img about-team-img"
                  unoptimized
                  style={{ objectFit: 'cover', objectPosition: '50% 20%' }}
                />
                <div className="market-content">
                  <h3>{member.name}</h3>
                  <p>{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

export default function AboutPage() {
  return (
    <Suspense fallback={null}>
      <AboutContent />
    </Suspense>
  );
}


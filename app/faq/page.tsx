'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';

type FaqItem = {
  question: string;
  answer: string;
};

function getFaqItems(isFestivalStyle: boolean): FaqItem[] {
  return [
    {
      question: isFestivalStyle ? 'Do you handle international travel?' : 'How does the integration work?',
      answer: isFestivalStyle
        ? 'Yes. Our concierge can suggest flight options, coordinate transfers, and help squads plan arrival/meetup logistics for destination events.'
        : 'You place a unique IMIN Smart Link in your bio, email, or campaign. We handle squad formation and send people forward with the confidence (and context) to convert.',
    },
    {
      question: isFestivalStyle ? 'How does the integration work?' : 'Does this work for small events?',
      answer: isFestivalStyle
        ? 'No heavy integration is required. You share a Smart Link; attendees join a flow that forms squads and organizes the social + logistics layer.'
        : 'Yes—any event where “going solo” is a friction point can benefit. Our strongest results come from repeat or high-volume events where squad momentum compounds.',
    },
    {
      question: 'How do you form squads?',
      answer:
        'We match people using quick signals (age range, vibe, interests, location/availability) and keep groups small so they actually coordinate and show up.',
    },
    {
      question: 'Can attendees opt out or change squads?',
      answer:
        'Yes. People can leave a squad at any time, and we provide paths to re-match if the timing or vibe isn’t right. Consent and comfort come first.',
    },
    {
      question: 'Is the data secure?',
      answer:
        'Yes. We only collect what’s needed to form squads and run the experience. We don’t sell personal data to third parties and we design with privacy-by-default.',
    },
    {
      question: 'How do you prevent spam or fake profiles?',
      answer:
        'We use verification steps and behavior signals to reduce spam. We also design group experiences to discourage bad actors (clear norms, friction for abuse, and easy reporting).',
    },
    {
      question: 'What platforms do you support?',
      answer:
        'Today we run squads primarily via Telegram group chats, with automation to facilitate intros, coordination, and next steps. More channels can be added per partner needs.',
    },
    {
      question: 'How fast can we launch?',
      answer:
        'Typically within days. You’ll get a Smart Link, suggested positioning copy, and a quick onboarding checklist—then we start sending traffic into squads.',
    },
    {
      question: 'What’s the pricing model?',
      answer:
        'Performance-based. We earn on incremental value created through our flow—no value, no fee. Terms depend on volume and the partnership scope.',
    },
    {
      question: isFestivalStyle ? 'Do you help with accommodation and shared logistics?' : 'Do you help people actually meet up on the night?',
      answer: isFestivalStyle
        ? 'Yes. For multi-day experiences we help squads coordinate travel plans and shared stays, turning “too complicated solo” into a simple group plan.'
        : 'Yes. We facilitate introductions and coordination so squads can align on arrival time, meetup points, and last-mile logistics—reducing the anxiety that blocks entry.',
    },
  ];
}

function FaqContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const style = searchParams?.get('style');
  const isFestivalStyle = style === 'festival';

  const switchMode = () => {
    router.push(isFestivalStyle ? '/faq' : '/faq?style=festival');
  };

  const items = getFaqItems(isFestivalStyle);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
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

      <main style={{ paddingTop: '60px' }}>
        {/* FAQ */}
        <section className="faq-section" style={{ paddingTop: '0' }}>
          <div className="container faq-container">
            <div style={{ textAlign: 'center', marginBottom: '60px' }}>
              <span className="section-tag">COMMON QUESTIONS</span>
              <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: isFestivalStyle ? 'var(--text-dark)' : undefined }}>
                Everything You Need To Know
              </h2>
            </div>

            {items.map((item, idx) => (
              <div
                key={item.question}
                className={`faq-item ${activeFaq === idx ? 'faq-active' : ''}`}
                onClick={() => toggleFaq(idx)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') toggleFaq(idx);
                }}
              >
                <div className="faq-question">
                  <span>{item.question}</span>
                  <span className="faq-icon">+</span>
                </div>
                <div className="faq-answer">{item.answer}</div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

export default function FaqPage() {
  return (
    <Suspense fallback={null}>
      <FaqContent />
    </Suspense>
  );
}


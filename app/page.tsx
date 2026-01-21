'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  const [attendees, setAttendees] = useState(50000);
  const [revenue, setRevenue] = useState(600000);
  const masterFlowWrapperRef = useRef<HTMLDivElement>(null);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  useEffect(() => {
    // Calculator update
    const recovered = Math.round(attendees * 0.24 * 50);
    setRevenue(recovered);
  }, [attendees]);

  useEffect(() => {
    // Parallax blob animation
    const handleScroll = () => {
      const scrollPos = window.scrollY;
      const blob1 = document.getElementById('blob1');
      const blob2 = document.getElementById('blob2');
      if (blob1) blob1.style.transform = `translate(0, ${scrollPos * 0.2}px)`;
      if (blob2) blob2.style.transform = `translate(0, ${scrollPos * 0.15}px)`;

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
          let color = percentage < 0.1 ? '#00FF94' : '#FF8F00';
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
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const formatRevenue = (value: number) => {
    if (value >= 1000000) {
      return '$' + (value / 1000000).toFixed(1) + 'M';
    }
    return '$' + Math.round(value / 1000) + 'k';
  };

  return (
    <>
      {/* Ambient Background with Blobs */}
      <div className="ambient-light" aria-hidden="true">
        <div className="blob blob-1" id="blob1"></div>
        <div className="blob blob-2" id="blob2"></div>
      </div>

      {/* Header */}
      <header style={{ padding: '30px 0', position: 'absolute', width: '100%', top: 0, zIndex: 10 }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/" className="logo">
            <Image
              src="/assets/logo.svg"
              alt="IMIN Logo"
              width={80}
              height={40}
              priority
              style={{ height: 'auto' }}
            />
          </Link>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <a href="#partner" className="btn-gradient" style={{ fontSize: '0.9rem', padding: '12px 28px' }}>
              Partner Access
            </a>
          </div>
        </div>
      </header>

      <div className="container">
        {/* Hero Section */}
        <section className="hero">
          <div className="hero-content" style={{ zIndex: 5 }}>
            <span className="section-tag">Market Opportunity 2026</span>
            <h1>
              UNITING PEOPLE TO<br />
              <span className="text-green">POWER YOUR EVENT.</span>
            </h1>
            <p>
              24% of your traffic leaves because they have &quot;no one to go with.&quot; We act as the &quot;Social Infrastructure&quot; that bundles them into squads and drives them to your checkout.
            </p>
            <div className="hero-actions" style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
              <a href="#partner" className="btn-gradient">Start Integrating</a>
              <a href="#calc" className="btn-outline">Calculate ROI</a>
            </div>
          </div>
          <div className="phone-perspective">
            <div className="hero-glow"></div>
            <div className="iphone-wrapper face-left">
              <div className="iphone-body"></div>
              <div className="iphone-frame"></div>
              <div className="iphone-screen">
                <Image
                  src="/assets/placeholders/eventsimin.png"
                  alt="IMIN App"
                  className="screen-content"
                  fill
                  style={{ objectFit: 'cover' }}
                />
              </div>
            </div>
          </div>
        </section>
      </div>

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
              fill="#00FF94"
              filter="blur(50px)"
              opacity="0.6"
            />
          </svg>
        </div>

        {/* ROI Calculator Section */}
        <section id="calc" className="container">
          <div className="calc-grid">
            <div>
              <span className="section-tag" style={{ background: 'rgba(59, 130, 246, 0.1)', borderColor: 'var(--glow-blue)', color: 'var(--glow-blue)' }}>
                ROI CALCULATOR
              </span>
              <h2 style={{ fontSize: '2.5rem', lineHeight: '1.1', marginBottom: '20px' }}>
                Calculate Your <br />
                <span className="text-green">Lost Revenue.</span>
              </h2>
              <p style={{ color: 'var(--text-muted)' }}>
                Move the slider to match your annual attendance. See exactly how much money is walking away because they have &quot;no one to go with.&quot;
              </p>
              <label style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', display: 'block', marginTop: '40px', fontSize: '0.9rem', letterSpacing: '1px' }}>
                ANNUAL ATTENDEES
              </label>
              <div id="attendee-val" className="text-green" style={{ fontWeight: 700, fontSize: '3rem', lineHeight: '1', marginBottom: '20px' }}>
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
              <div id="revenue-val" style={{ fontSize: '6rem', fontWeight: 900, color: 'white', lineHeight: '1', textShadow: '0 0 40px rgba(0, 255, 148, 0.3)' }}>
                {formatRevenue(revenue)}
              </div>
              <p style={{ fontSize: '1.2rem', color: 'white', marginTop: '20px', fontWeight: 500 }}>
                Based on a <span style={{ color: 'var(--glow-green)', fontWeight: 700 }}>+24%</span> uplift in ticket sales.
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
              <h2 style={{ fontSize: '3rem' }}>How We Fill The Floor.</h2>
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
                      src="/assets/placeholders/linkscreen.png"
                      alt="Link"
                      className="screen-content"
                      fill
                      style={{ objectFit: 'cover' }}
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
                      src="/assets/placeholders/regisimin.png"
                      alt="Form"
                      className="screen-content"
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                </div>
              </div>
              <div className="flow-text">
                <div className="flow-step-num">02</div>
                <h3 className="flow-title">The Vibe Check</h3>
                <p className="flow-desc">We capture user data (Age, Music Taste, Vibe) and perform a social verification.</p>
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
                      src="/assets/placeholders/telegramimin.png"
                      alt="Chat"
                      className="screen-content"
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                </div>
              </div>
              <div className="flow-text">
                <div className="flow-step-num">03</div>
                <h3 className="flow-title">The Squad Sale</h3>
                <p className="flow-desc">A private Telegram group is formed. Our AI Bot facilitates introductions and pushes a &quot;Group Buy&quot; button.</p>
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
                    <video className="screen-content" autoPlay loop muted playsInline poster="/assets/placeholders/partyvideo-poster.jpg">
                      <source src="/assets/placeholders/partyvideo.mp4" type="video/mp4" />
                    </video>
                  </div>
                </div>
              </div>
              <div className="flow-text">
                <div className="flow-step-num">04</div>
                <h3 className="flow-title">The Experience</h3>
                <p className="flow-desc">Attendees arrive together, reducing entry anxiety. Squads stay longer and spend more.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Economics Section */}
        <section id="economics" className="container" style={{ padding: '100px 0' }}>
          <div className="bento-grid">
            <div className="glass-card">
              <span className="section-tag" style={{ background: 'rgba(0, 255, 148, 0.1)', borderColor: 'var(--glow-green)' }}>
                PRIORITY #1
              </span>
              <h2 style={{ fontSize: '2.5rem', marginBottom: '20px' }}>Ticket Sales.</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '30px' }}>
                We recover the &quot;Lost Audience.&quot; By bundling solo users into squads, we convert hesitant traffic into bulk ticket sales.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ fontSize: '3rem' }}>🎟️</div>
                <div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'white' }}>+24%</div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Volume Uplift</div>
                </div>
              </div>
            </div>
            <div className="glass-card">
              <span className="section-tag" style={{ background: 'rgba(139, 92, 246, 0.1)', borderColor: 'var(--glow-purple)', color: 'var(--glow-purple)' }}>
                PRIORITY #2
              </span>
              <h2 style={{ fontSize: '2.5rem', marginBottom: '20px' }}>On-Site Spend.</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '30px' }}>
                Solo attendees leave early. Squads stay late, buy rounds of drinks, and utilize upsells.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ fontSize: '3rem' }}>🍹</div>
                <div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'white' }}>+30%</div>
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
              <span className="section-tag" style={{ color: 'var(--glow-purple)', borderColor: 'var(--glow-purple)' }}>
                MEET THE AGENT
              </span>
              <h2 style={{ fontSize: '3rem', lineHeight: '1.1', marginBottom: '30px' }}>
                More Than A Chat.<br />A Concierge.
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '40px' }}>
                Our AI Bot acts like a savvy team member inside the squad chat.
              </p>
              <ul style={{ listStyle: 'none', color: 'var(--text-muted)' }}>
                <li style={{ marginBottom: '20px', display: 'flex', gap: '15px' }}>
                  <span style={{ color: 'var(--glow-green)' }}>✓</span>
                  <strong>Human-Like Persona:</strong> Uses slang and memes.
                </li>
                <li style={{ marginBottom: '20px', display: 'flex', gap: '15px' }}>
                  <span style={{ color: 'var(--glow-green)' }}>✓</span>
                  <strong>Logistics Solver:</strong> Organizes carpooling.
                </li>
                <li style={{ marginBottom: '20px', display: 'flex', gap: '15px' }}>
                  <span style={{ color: 'var(--glow-green)' }}>✓</span>
                  <strong>Revenue Upsell:</strong> Suggests partner hotels.
                </li>
              </ul>
            </div>
            <div className="chat-interface">
              <div className="chat-header">
                <div className="bot-avatar">IM</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>IMIN Squad Host</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--glow-green)' }}>Online • AI Agent</div>
                </div>
              </div>
              <div className="chat-bubble bubble-bot">Yo Squad! ⚡ Looks like 3 of you are coming from downtown. Need a ride?</div>
              <div className="chat-bubble bubble-user">Yeah, parking is tight there.</div>
              <div className="chat-bubble bubble-bot">Smart. I can organize a carpool or grab a 5-seater Uber for you guys?</div>
              <div className="chat-bubble bubble-action">
                <span>🚖</span> Setup Carpool Group
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="faq-section">
          <div className="container faq-container">
            <div style={{ textAlign: 'center', marginBottom: '60px' }}>
              <span className="section-tag">COMMON QUESTIONS</span>
              <h2 style={{ fontSize: '2.5rem', fontWeight: 800 }}>Everything You Need To Know</h2>
            </div>

            <div className={`faq-item ${activeFaq === 0 ? 'faq-active' : ''}`} onClick={() => toggleFaq(0)}>
              <div className="faq-question">
                <span>How does the integration work?</span>
                <span className="faq-icon">+</span>
              </div>
              <div className="faq-answer">
                We provide a unique URL (Smart Link) that you place in your Instagram bio or email campaigns. There is no technical installation required on your website. We handle the entire squad formation and payment process on our platform, then redirect the final squad to your checkout.
              </div>
            </div>

            <div className={`faq-item ${activeFaq === 1 ? 'faq-active' : ''}`} onClick={() => toggleFaq(1)}>
              <div className="faq-question">
                <span>Does this work for small events?</span>
                <span className="faq-icon">+</span>
              </div>
              <div className="faq-answer">
                Yes. While our system is optimized for festivals and large club nights (1000+ capacity), it works effectively for any event where &quot;going solo&quot; is a friction point. Our Founding Partner program, however, is prioritized for venues with 10k+ annual attendees.
              </div>
            </div>

            <div className={`faq-item ${activeFaq === 2 ? 'faq-active' : ''}`} onClick={() => toggleFaq(2)}>
              <div className="faq-question">
                <span>Is the data secure?</span>
                <span className="faq-icon">+</span>
              </div>
              <div className="faq-answer">
                Absolutely. We are fully GDPR compliant. We only collect necessary data to form squads (age, gender, music preference) and verify identity. We do not sell user data to third parties.
              </div>
            </div>

            <div className={`faq-item ${activeFaq === 3 ? 'faq-active' : ''}`} onClick={() => toggleFaq(3)}>
              <div className="faq-question">
                <span>What is the pricing model?</span>
                <span className="faq-icon">+</span>
              </div>
              <div className="faq-answer">
                We operate on a performance basis. We take a small commission only on the *incremental* tickets sold through our platform. If we don&apos;t sell, you don&apos;t pay.
              </div>
            </div>
          </div>
        </section>

        {/* Partner Form Section */}
        <section id="partner" style={{ padding: '80px 0 120px 0' }}>
          <div className="container">
            <div id="contact-form-card" className="glass-card form-target" style={{ maxWidth: '900px', margin: '0 auto', border: '1px solid var(--glow-green)', textAlign: 'center' }}>
              <span className="section-tag" style={{ background: 'var(--glow-green)', color: 'black' }}>
                FOUNDING PARTNER PROGRAM
              </span>
              <h2 style={{ fontSize: '3rem', fontWeight: 800, lineHeight: '1', marginBottom: '20px' }}>FILL YOUR VENUE.</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '40px' }}>
                We are opening 50 spots for our Launch Cohort (Q1 2026).
              </p>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const data = {
                    organization: formData.get('organization') as string,
                    email: formData.get('email') as string,
                    annualAttendees: formData.get('annualAttendees') as string,
                  };
                  try {
                    const response = await fetch('/api/partner-request', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(data),
                    });
                    if (response.ok) {
                      alert('Thank you! We\'ll get back to you soon.');
                      (e.target as HTMLFormElement).reset();
                    } else {
                      alert('Failed to send request. Please try again.');
                    }
                  } catch (error) {
                    alert('An error occurred. Please try again.');
                  }
                }}
                style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', textAlign: 'left' }}
              >
                <div style={{ gridColumn: 'span 2' }}>
                  <input type="text" className="form-input" placeholder="Organization Name" name="organization" required />
                </div>
                <div>
                  <input type="email" className="form-input" placeholder="Work Email" name="email" required />
                </div>
                <div>
                  <select className="form-input" name="annualAttendees" style={{ background: 'rgba(0,0,0,0.3)' }}>
                    <option value="10k - 50k Attendees">10k - 50k Attendees</option>
                    <option value="50k - 200k Attendees">50k - 200k Attendees</option>
                  </select>
                </div>
                <div style={{ gridColumn: 'span 2', marginTop: '10px' }}>
                  <button type="submit" className="btn-gradient" style={{ width: '100%', fontSize: '1.1rem' }}>
                    Apply for Access
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer>
        <div className="container">
          <div className="footer-grid">
            <div className="footer-col">
              <a href="#" className="footer-logo">
                IM<span className="text-green">IN</span>
              </a>
              <p className="footer-desc">
                The social infrastructure layer for the experience economy. We turn solo traffic into squad sales.
              </p>
              <div className="social-links">
                <div className="social-icon">𝕏</div>
                <div className="social-icon">In</div>
                <div className="social-icon">Ig</div>
              </div>
            </div>
            <div className="footer-col">
              <h4>PRODUCT</h4>
              <ul>
                <li><a href="#calc">ROI Calculator</a></li>
                <li><a href="#economics">Economics</a></li>
                <li><a href="#bot">AI Agent</a></li>
                <li><a href="#partner">Partner Program</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>COMPANY</h4>
              <ul>
                <li><a href="#">About Us</a></li>
                <li><a href="#">Careers</a> <span style={{ fontSize: '0.7rem', background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px', marginLeft: '5px' }}>Hiring</span></li>
                <li><a href="#">Contact</a></li>
                <li><a href="#">Press Kit</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>LEGAL</h4>
              <ul>
                <li><Link href="/terms">Privacy Policy</Link></li>
                <li><Link href="/terms">Terms of Service</Link></li>
                <li><a href="#">Cookie Policy</a></li>
                <li><a href="#">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <div>© 2026 IMIN Partners Inc. All rights reserved.</div>
          </div>
        </div>
      </footer>
    </>
  );
}

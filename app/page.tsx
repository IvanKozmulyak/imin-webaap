import Link from 'next/link'
import Image from 'next/image'
import PartnerAccessSection from './components/PartnerAccessSection'

export default function Home() {
  return (
    <>
      {/* Ambient Background with Blobs */}
      <div className="ambient-light" aria-hidden="true">
        <Image
          src="/assets/background.png"
          alt=""
          fill
          style={{ objectFit: 'cover' }}
          priority
          quality={90}
        />
        <div className="blob blob-1" />
        <div className="blob blob-2" />
      </div>

      {/* Header */}
      <header>
        <div className="container">
          <nav>
            <Link href="/" className="logo">
              <Image
                src="/assets/logo.svg"
                alt="IMIN Logo"
                width={40}
                height={20}
                priority
              />
            </Link>
            <Link href="/register" className="btn-gradient">
              Get Access
            </Link>
          </nav>
        </div>
      </header>

      <div className="container">
        {/* Hero Section */}
        <section className="hero">
          <span className="section-label">{'// SOCIAL INFRASTRUCTURE'}</span>
          <h1>
            <span style={{ whiteSpace: 'nowrap' }}>TURN ABANDONED CHECKOUTS</span>
            <br />
            INTO <span style={{ color: '#A855F7' }}>SQUAD SALES.</span>
          </h1>
          <p>
            Every event loses highly-interested attendees because they have &quot;no one to go with.&quot; We turn that social friction into 5-pack group sales.
          </p>

          <div>
            <Link href="/register" className="btn-gradient">
              Partner with us
            </Link>
            <a href="#how" className="btn-ghost">
              See the flow
            </a>
          </div>
        </section>

        {/* Divider */}
        <div className="section-divider" />

        {/* Problem Section */}
        <span className="section-label">{'// THE PROBLEM'}</span>
        <div className="bento-grid">
          <div className="glass-card card-featured">
            <h3 style={{ fontSize: '1.5rem', marginBottom: '15px' }}>The &quot;Solo&quot; Leak</h3>
            <div className="stat-big">24%</div>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-gray)' }}>
              of potential attendees abandon checkout because they lack a group.
            </p>
            <p style={{ marginTop: '20px', color: 'white', borderLeft: '2px solid #A855F7', paddingLeft: '15px' }}>
              <strong>IMIN fixes this.</strong> We create the social infrastructure so they don&apos;t have to. You get the sale, they get the squad.
            </p>
          </div>
          <div className="glass-card card-vertical">
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ color: 'var(--text-gray)', fontFamily: 'var(--font-mono)' }}>AVG CART VALUE</h4>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'white' }}>5x</div>
            </div>
            <div>
              <h4 style={{ color: 'var(--text-gray)', fontFamily: 'var(--font-mono)' }}>BAR SPEND</h4>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'white' }}>+30%</div>
              <p style={{ fontSize: '0.85rem', color: '#888' }}>Squads stay longer & drink more.</p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="section-divider" />

        {/* Solution Section */}
        <span className="section-label">{'// THE SOLUTION'}</span>
        <div style={{ marginBottom: '100px' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '20px', letterSpacing: '-0.02em' }}>
            Infrastructure, Not an App.
          </h2>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-gray)', marginBottom: '60px', maxWidth: '800px' }}>
            We don&apos;t compete for your traffic. We sit on top of your existing ticketing stack as a &quot;Social Layer&quot; to convert solo traffic.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '30px' }}>
            {/* Step 01 */}
            <div className="glass-card" style={{ position: 'relative' }}>
              <div className="step-number">01</div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '12px', fontFamily: 'var(--font-mono)', color: '#A855F7' }}>
                ACQUISITION
              </h3>
              <h4 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '12px' }}>
                We Catch Traffic
              </h4>
              <p style={{ color: 'var(--text-gray)' }}>
                We use your traffic from social media to find solo seekers. <span style={{ color: '#A855F7' }}>Zero extra cost for you.</span>
              </p>
            </div>

            {/* Step 02 */}
            <div className="glass-card" style={{ position: 'relative' }}>
              <div className="step-number">02</div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '12px', fontFamily: 'var(--font-mono)', color: '#A855F7' }}>
                MATCHING
              </h3>
              <h4 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '12px' }}>
                Instant Squad
              </h4>
              <p style={{ color: 'var(--text-gray)' }}>
                We connect 5 solo attendees into a squad for the your events.
              </p>
            </div>

            {/* Step 03 */}
            <div className="glass-card" style={{ position: 'relative' }}>
              <div className="step-number">03</div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '12px', fontFamily: 'var(--font-mono)', color: '#A855F7' }}>
                CONVERSION
              </h3>
              <h4 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '12px' }}>
                Group Buy
              </h4>
              <p style={{ color: 'var(--text-gray)' }}>
                The squad motivates each other. <span style={{ color: '#A855F7' }}>&quot;Not sure&quot; turns into &quot;Sold Ticket&quot; instantly.</span>
              </p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="section-divider" />

        {/* The Economics Section */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginBottom: '100px', alignItems: 'center' }}>
          {/* Left: Economics Benefits */}
          <div>
            <span className="section-label" style={{ color: '#A855F7', textAlign: 'center' }}>
              {'// THE ECONOMICS'}
            </span>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '30px', letterSpacing: '-0.02em' }}>
              Why Squads Pay More.
            </h2>
            
            <ul style={{ listStyle: 'none', color: 'white' }}>
              <li style={{ marginBottom: '24px', display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                <span style={{ color: '#A855F7', fontSize: '1.5rem', lineHeight: '1' }}>✓</span>
                <div>
                  <strong style={{ fontSize: '1.1rem', display: 'block', marginBottom: '4px' }}>CAC:</strong>
                  <span style={{ color: 'var(--text-gray)' }}>We bring the users. </span>
                  <span style={{ color: '#A855F7' }}> Pay only for results.</span>
                </div>
              </li>
              <li style={{ marginBottom: '24px', display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                <span style={{ color: '#A855F7', fontSize: '1.5rem', lineHeight: '1' }}>✓</span>
                <div>
                  <strong style={{ fontSize: '1.1rem', display: 'block', marginBottom: '4px' }}>3x LTV:</strong>
                  <span style={{ color: 'var(--text-gray)' }}>Social connection creates retention. </span>
                  <span style={{ color: '#A855F7' }}>Friends come back together.</span>
                </div>
              </li>
              <li style={{ marginBottom: '0', display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                <span style={{ color: '#A855F7', fontSize: '1.5rem', lineHeight: '1' }}>✓</span>
                <div>
                  <strong style={{ fontSize: '1.1rem', display: 'block', marginBottom: '4px' }}>Upsell Ready:</strong>
                  <span style={{ color: 'var(--text-gray)' }}>Groups buy bottle service, tables, and group packages.</span>
                </div>
              </li>
            </ul>
          </div>

          {/* Right: Market Stats Card */}
          <div className="glass-card">
            <h4 style={{ color: 'var(--text-gray)', fontFamily: 'var(--font-mono)', fontSize: '0.9rem', marginBottom: '20px' }}>
              GLOBAL NIGHTLIFE MARKET
            </h4>
            <div style={{ fontSize: '4rem', fontWeight: 800, color: 'white', marginBottom: '30px', lineHeight: '1' }}>
              $98.6B
            </div>
            
            {/* Progress Bar */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ 
                width: '100%', 
                height: '36px', 
                background: 'rgba(255, 255, 255, 0.1)', 
                borderRadius: '12px',
                overflow: 'hidden',
                display: 'flex'
              }}>
                <div style={{ 
                  flex: '0.78', 
                  background: 'rgba(255, 255, 255, 0.2)', 
                  height: '100%' 
                }} />
                <div style={{ 
                  flex: '0.22', 
                  background: '#A855F7', 
                  height: '100%' 
                }} />
              </div>
            </div>
            
            {/* Labels */}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
              <span style={{ color: 'var(--text-gray)' }}>Current Market</span>
              <span style={{ color: '#A855F7', fontWeight: 600 }}>$21.9B Unlocked Revenue</span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="section-divider" />

        {/* Bar Economics Section */}
        <div style={{ marginBottom: '100px' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <span className="section-label" style={{ color: '#A855F7' }}>
              {'// REVENUE LOGIC'}
            </span>
            <h2 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '20px', letterSpacing: '-0.02em' }}>
              The Multiplier <span style={{ color: '#A855F7' }}>Effect</span>
            </h2>
          </div>

          {/* Comparison Cards */}
          <div className="bar-economics-comparison">
            {/* Left Card: Solo Path */}
            <div className="glass-card bar-economics-card" style={{ border: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px' }}>
                <div style={{ color: 'var(--text-gray)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                  THE SOLO PATH
                </div>
                <span style={{ 
                  padding: '4px 12px', 
                  background: 'rgba(255, 255, 255, 0.1)', 
                  borderRadius: '4px', 
                  fontSize: '0.7rem', 
                  color: 'var(--text-gray)',
                  fontFamily: 'var(--font-mono)'
                }}>
                  1 PAX
                </span>
              </div>
              <div style={{ fontSize: '3.5rem', fontWeight: 800, color: 'white', marginBottom: '10px', lineHeight: '1' }}>
                1 Drink
              </div>
              <div style={{ color: 'var(--text-gray)', marginBottom: '30px', fontSize: '0.95rem' }}>
                Average duration: 2 hours
              </div>
              <div style={{ flex: 1 }} /> {/* Spacer */}
              <div style={{ height: '1px', borderTop: '1px dashed rgba(255, 255, 255, 0.2)', marginBottom: '30px' }} />
              <div style={{ color: 'var(--text-gray)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', marginBottom: '10px' }}>
                TOTAL OUTPUT
              </div>
              <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'white' }}>
                1 Unit Sold
              </div>
            </div>

            {/* Right Card: IMIN Squad Path */}
            <div className="glass-card bar-economics-card" style={{ border: '2px solid #A855F7', boxShadow: '0 0 40px rgba(168, 85, 247, 0.4)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px' }}>
                <div style={{ color: 'var(--text-gray)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                  THE <span style={{ color: '#A855F7', fontWeight: 700 }}>IMIN</span> SQUAD PATH
                </div>
                <span style={{ 
                  padding: '4px 12px', 
                  background: '#A855F7', 
                  borderRadius: '4px', 
                  fontSize: '0.7rem', 
                  color: 'white',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700
                }}>
                  5 PAX
                </span>
              </div>
              <div style={{ fontSize: '4rem', fontWeight: 800, color: 'white', marginBottom: '10px', lineHeight: '1' }}>
                3 Rounds
              </div>
              <div style={{ color: 'var(--text-gray)', marginBottom: '24px', fontSize: '0.95rem' }}>
                Average duration: 2+ hours
              </div>
              
              {/* Key Factors */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '30px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00FF94' }} />
                  <span style={{ color: 'white', fontSize: '0.9rem' }}>Higher Retention</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#A855F7' }} />
                  <span style={{ color: 'white', fontSize: '0.9rem' }}>Social Pressure</span>
                </div>
              </div>

              <div style={{ height: '1px', borderTop: '1px dashed rgba(255, 255, 255, 0.2)', marginBottom: '30px' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                  <div style={{ color: 'var(--text-gray)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', marginBottom: '10px' }}>
                    TOTAL OUTPUT
                  </div>
                  <div style={{ fontSize: '2.75rem', fontWeight: 800, color: '#00FF94' }}>
                    15 Unit Sold
                  </div>
                </div>
                <span style={{ 
                  padding: '6px 12px', 
                  background: '#00FF94', 
                  borderRadius: '6px', 
                  fontSize: '0.85rem', 
                  color: '#000',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700
                }}>
                  +1400% Revenue
                </span>
              </div>
            </div>
          </div>

          {/* Partner Access Section */}
          <PartnerAccessSection />
        </div>

        {/* Divider */}
        <div className="section-divider" />

        {/* THE SYSTEM Section - KEPT FROM CURRENT PAGE */}
        <section id="how">
          <span className="section-label">{'// THE SYSTEM'}</span>
          <div className="bento-grid">
            <div className="glass-card" style={{ position: 'relative' }}>
              <div className="step-number">01</div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '15px' }}>Browse Event</h3>
              <p style={{ color: 'var(--text-gray)' }}>
                Select the party, festival, or club night you want to attend from our curated list.
              </p>
            </div>
            <div className="glass-card" style={{ position: 'relative' }}>
              <div className="step-number">02</div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '15px' }}>Join Squad</h3>
              <p style={{ color: 'var(--text-gray)' }}>
                One click adds you to a temporary group of 5 solo attendees.
              </p>
            </div>
            <div className="glass-card" style={{ position: 'relative' }}>
              <div className="step-number">03</div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '15px' }}>Buy Ticket</h3>
              <p style={{ color: 'var(--text-gray)' }}>
                Connect with your crew on Telegram and use the shared link to book your tickets together.
              </p>
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="section-divider" />

        {/* Social Contract Section */}
        <div className="glass-card" style={{ marginBottom: '100px', textAlign: 'center' }}>
          <span className="section-label" style={{ marginBottom: '10px' }}>
            {'// THE SOCIAL CONTRACT'}
          </span>
          <h2 style={{ fontSize: '2rem', marginBottom: '20px' }}>ELIMINATING THE &quot;NO-SHOW&quot;.</h2>
          <p style={{ color: 'var(--text-gray)', maxWidth: '700px', margin: '0 auto 30px auto' }}>
            Solo attendees have the highest flake rate. They wake up, feel lazy, and don&apos;t go.
            <strong> IMIN Squads introduce accountability.</strong> When 4 other people are waiting for you in a Telegram chat, you show up.
          </p>
          <div style={{ display: 'inline-block', padding: '10px 20px', border: '1px solid #00FF94', color: '#00FF94', borderRadius: '50px', fontWeight: 700 }}>
            IMIN SHOW-UP RATE: 96%
          </div>
        </div>

        {/* Divider */}
        <div className="section-divider" />

        {/* DEPLOY ON Section - KEPT FROM CURRENT PAGE */}
        <span className="section-label">{'// DEPLOY ON'}</span>
        <div className="slash-container">
          <div className="slash-card" role="button" tabIndex={0} aria-label="Techno / Raves">
            <div
              className="slash-bg"
              style={{
                backgroundImage: "url('/assets/event-types/techno-raves.jpg')",
              }}
            />
            <div className="slash-content">
              <span className="slash-text">Techno / Raves</span>
            </div>
          </div>
          <div className="slash-card" role="button" tabIndex={0} aria-label="Festivals">
            <div
              className="slash-bg"
              style={{
                backgroundImage: "url('/assets/event-types/festivals.jpg')",
              }}
            />
            <div className="slash-content">
              <span className="slash-text">Festivals</span>
            </div>
          </div>
          <div className="slash-card" role="button" tabIndex={0} aria-label="Rooftop">
            <div
              className="slash-bg"
              style={{
                backgroundImage: "url('/assets/event-types/rooftop.jpg')",
              }}
            />
            <div className="slash-content">
              <span className="slash-text">Rooftop</span>
            </div>
          </div>
          <div className="slash-card" role="button" tabIndex={0} aria-label="Night Clubs">
            <div
              className="slash-bg"
              style={{
                backgroundImage: "url('/assets/event-types/night-clubs.jpg')",
              }}
            />
            <div className="slash-content">
              <span className="slash-text">Night Clubs</span>
            </div>
          </div>
          <div className="slash-card" role="button" tabIndex={0} aria-label="Pop-ups">
            <div
              className="slash-bg"
              style={{
                backgroundImage: "url('/assets/event-types/pop-ups.jpg')",
              }}
            />
            <div className="slash-content">
              <span className="slash-text">Pop-ups</span>
            </div>
          </div>
          <div className="slash-card" role="button" tabIndex={0} aria-label="Underground">
            <div
              className="slash-bg"
              style={{
                backgroundImage: "url('/assets/event-types/underground.jpg')",
              }}
            />
            <div className="slash-content">
              <span className="slash-text">Underground</span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="section-divider" />

        {/* TRUST & VIBE Section - KEPT FROM CURRENT PAGE */}
        <span className="section-label">{'// TRUST & VIBE'}</span>
        <div className="trust-grid">
          <div className="trust-card" style={{ position: 'relative' }}>
            <Image
              src="/assets/trust/real-profiles.avif"
              alt="Party scene"
              className="trust-card-image"
              fill
              style={{ objectFit: 'cover' }}
            />
            <div className="trust-overlay">
              <h3>Real Profiles</h3>
            </div>
          </div>
          <div className="trust-card">
            <Image
              src="/assets/trust/mixed-groups.avif"
              alt="Friends having fun"
              className="trust-card-image"
              fill
              style={{ objectFit: 'cover' }}
            />
            <div className="trust-overlay">
              <h3>Mixed Groups</h3>
            </div>
          </div>
          <div className="trust-card" style={{ position: 'relative' }}>
            <Image
              src="/assets/trust/respect-first.avif"
              alt="Crowd at event"
              className="trust-card-image"
              fill
              style={{ objectFit: 'cover' }}
            />
            <div className="trust-overlay">
              <h3>Respect First</h3>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer>
          {/* Important Notice - KEPT FROM CURRENT PAGE */}
          <div className="disclaimer-card">
            <div className="disclaimer-header">
              <h4 className="disclaimer-title">Important Notice</h4>
            </div>
            <p className="disclaimer-text">
              IMIN is a social connection tool. We do not organize the events listed. We are not liable for third-party venues or individual user behavior.
            </p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
            <div>
              <div className="logo" style={{ fontSize: '1.2rem', marginBottom: '10px' }}>
                IMIN
              </div>
              <p>© 2026 IMIN.WTF</p>
            </div>
            <div style={{ display: 'flex', gap: '24px' }}>
              <a href="https://www.instagram.com/imin.wtf/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                Instagram
              </a>
              <Link href="/terms" aria-label="Terms">
                Terms
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}

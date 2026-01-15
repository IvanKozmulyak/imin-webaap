import Link from 'next/link'
import Image from 'next/image'
import PartnerSection from './components/PartnerSection'

export default function Home() {
  return (
    <>
      {/* Background Image */}
      <div className="ambient-light" aria-hidden="true">
        <Image
          src="/assets/background.png"
          alt=""
          fill
          style={{ objectFit: 'cover' }}
          priority
          quality={90}
        />
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
            FIND YOUR PEOPLE
            <br />
            FOR EVENTS.
          </h1>
          <p>
            Don&apos;t let &quot;I have no one to go with&quot; stop you. We match you into squads of 5 for anywhere the music is loud.
          </p>

          <div>
            <Link href="/register" className="btn-gradient">
              Join a Squad
            </Link>
            <a href="#how" className="btn-ghost">
              How it works
            </a>
          </div>
        </section>

        {/* Problem Section */}
        <span className="section-label">{'// THE PROBLEM'}</span>
        <div className="bento-grid">
          <div className="glass-card card-featured">
            <h3 style={{ fontSize: '1.5rem', marginBottom: '15px' }}>The &quot;Solo&quot; Barrier</h3>
            <div className="stat-big">24%</div>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-gray)' }}>
              of interested people don&apos;t attend events because they have &quot;no one to go with&quot;.
            </p>
            <p style={{ marginTop: '20px', color: 'white' }}>
              We fix this. No awkwardness. No random crowds. Just a squad ready to party.
            </p>
          </div>
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
              <div className="stat-icon-box" style={{ width: '60px', height: '60px', fontSize: '1.8rem' }} aria-hidden="true">
                🎵
              </div>
              <h3 style={{ fontSize: '1.5rem', margin: 0 }}>Not a Dating App</h3>
            </div>
            <p style={{ marginTop: '0', color: 'var(--text-gray)' }}>
              We are here for the music and the moment. These are platonic squads to enjoy the night.
            </p>
          </div>
        </div>

        {/* How It Works Section */}
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

        {/* Event Types Section */}
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

        {/* Trust Section */}
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

        {/* Partner Section */}
        <PartnerSection />

        {/* Footer */}
        <footer>
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

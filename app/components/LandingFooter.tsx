'use client';

import Link from 'next/link';

export default function LandingFooter() {
  const handleScrollTo = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const headerOffset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <footer style={{ borderTop: '1px solid #E2E8F0', background: '#F8FAFC', padding: '60px 0 40px', marginTop: '100px', color: 'var(--text-dark)' }}>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '40px' }}>
          <div style={{ maxWidth: '400px' }}>
            <Link href="/" className="footer-logo" style={{ fontWeight: 900, fontSize: '1.5rem', textDecoration: 'none', color: 'var(--text-dark)' }}>
              IM<span className="text-gradient">IN</span>
            </Link>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '15px' }}>
              Supporting festivals to make your experience more joyful. We connect the dots so you can connect on the dancefloor.
            </p>
            <div className="social-links" style={{ marginTop: '20px', display: 'flex', gap: '15px' }}>
              <a
                href="https://www.instagram.com/imin.wtf/"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon"
                aria-label="Instagram"
                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '50%', background: 'white', border: '1px solid #E2E8F0', color: 'var(--text-dark)', transition: 'all 0.3s' }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.98-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.98-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"
                    fill="currentColor"
                  />
                </svg>
              </a>
            </div>
          </div>
          <div>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '15px' }}>SECTIONS</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ marginBottom: '10px' }}>
                <button
                  onClick={() => handleScrollTo('hero')}
                  style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textDecoration: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left', width: '100%' }}
                >
                  Home
                </button>
              </li>
              <li style={{ marginBottom: '10px' }}>
                <button
                  onClick={() => handleScrollTo('barriers')}
                  style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textDecoration: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left', width: '100%' }}
                >
                  Why Dancers Wait
                </button>
              </li>
              <li style={{ marginBottom: '10px' }}>
                <button
                  onClick={() => handleScrollTo('how-it-works')}
                  style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textDecoration: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left', width: '100%' }}
                >
                  How It Works
                </button>
              </li>
              <li style={{ marginBottom: '10px' }}>
                <button
                  onClick={() => handleScrollTo('why-this-works')}
                  style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textDecoration: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left', width: '100%' }}
                >
                  Why It Works
                </button>
              </li>
              <li style={{ marginBottom: '10px' }}>
                <button
                  onClick={() => handleScrollTo('join')}
                  style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textDecoration: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left', width: '100%' }}
                >
                  Join Now
                </button>
              </li>
            </ul>
          </div>
          <div>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '15px' }}>LEGAL & SAFETY</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ marginBottom: '10px' }}>
                <Link href="/landing/terms" style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textDecoration: 'none' }}>Terms of Use</Link>
              </li>
            </ul>
          </div>
        </div>
        <div style={{ marginTop: '40px', textAlign: 'right' }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: '100%', lineHeight: '1.5', marginLeft: 'auto', marginRight: 0 }}>
            IMIN provides social matching services. We are not a travel agency and do not organize the events. Users are responsible for their own safety and transactions within the squads. Always verify identity before transferring money.
          </p>
        </div>
        <div style={{ borderTop: '1px solid #E2E8F0', marginTop: '40px', paddingTop: '20px', textAlign: 'center', color: '#94A3B8', fontSize: '0.8rem' }}>
          &copy; 2026 IMIN. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

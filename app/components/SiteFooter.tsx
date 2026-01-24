'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

function withStyle(basePath: string, isFestivalStyle: boolean) {
  if (!isFestivalStyle) return basePath;

  const [path, hash] = basePath.split('#');
  const url = new URL(path.startsWith('http') ? path : `https://local${path}`);
  url.searchParams.set('style', 'festival');
  return `${url.pathname}${url.search}${hash ? `#${hash}` : ''}`;
}

export default function SiteFooter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isFestivalStyle = searchParams?.get('style') === 'festival';

  const homeHref = withStyle('/', isFestivalStyle);
  const aboutHref = withStyle('/about', isFestivalStyle);
  const faqHref = withStyle('/faq', isFestivalStyle);
  const contactHref = withStyle('/contact', isFestivalStyle);
  const termsHref = withStyle('/terms', isFestivalStyle);

  const roiHref = withStyle('/#calc', isFestivalStyle);
  const economicsHref = withStyle('/#economics', isFestivalStyle);
  const aiAgentHref = withStyle('/#bot', isFestivalStyle);
  const partnerProgramHref = withStyle('/#partner', isFestivalStyle);

  return (
    <footer>
      <div className="container">
        <div className="footer-grid">
          <div className="footer-col footer-col-main">
            <a href="#" className="footer-logo" style={{ color: isFestivalStyle ? 'var(--text-dark)' : undefined }}>
              IM{isFestivalStyle ? <span className="text-gradient">IN</span> : <span className="text-green">IN</span>}
            </a>
            <p className="footer-desc">The social infrastructure layer for the experience economy. We turn solo traffic into squad sales.</p>
            <div className="social-links">
              <a
                href="https://www.instagram.com/imin.wtf/"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon"
                aria-label="Instagram"
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

          <div className="footer-col">
            <h4>PRODUCT</h4>
            <ul>
              <li><Link href={roiHref}>ROI Calculator</Link></li>
              <li><Link href={economicsHref}>Economics</Link></li>
              <li><Link href={aiAgentHref}>AI Agent</Link></li>
              <li><Link href={partnerProgramHref}>Partner Program</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>PAGES</h4>
            <ul>
              <li><Link href={homeHref}>Home</Link></li>
              <li><Link href={aboutHref}>About</Link></li>
              <li><Link href={faqHref}>FAQ</Link></li>
              <li><Link href={contactHref}>Contact</Link></li>
              <li><Link href={termsHref}>Terms</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>SOLUTIONS</h4>
            <ul>
              <li>
                <button
                  onClick={() => router.push('/')}
                  className={`footer-switcher-link ${!isFestivalStyle ? 'active' : ''}`}
                >
                  Nightlife & Clubs
                </button>
              </li>
              <li>
                <button
                  onClick={() => router.push('/?style=festival')}
                  className={`footer-switcher-link ${isFestivalStyle ? 'active' : ''}`}
                >
                  Festivals & Travel
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <div>© 2026 IMIN Partners Inc. All rights reserved.</div>
        </div>
      </div>
    </footer>
  );
}


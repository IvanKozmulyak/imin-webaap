'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

type HeaderLink = {
  label: string;
  href: string;
};

function withStyle(basePath: string, isFestivalStyle: boolean) {
  if (!isFestivalStyle) return basePath;

  // Preserve existing query if any, then add style=festival
  const [path, hash] = basePath.split('#');
  const url = new URL(path.startsWith('http') ? path : `https://local${path}`);
  url.searchParams.set('style', 'festival');

  return `${url.pathname}${url.search}${hash ? `#${hash}` : ''}`;
}

export default function SiteHeader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isFestivalStyle = searchParams?.get('style') === 'festival';
  const logoSrc = isFestivalStyle ? '/assets/logo-black.svg' : '/assets/logo.svg';
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const pageLinks: HeaderLink[] = [
    { label: 'Home', href: '/' },
    { label: 'Events', href: '/events' },
    { label: 'About', href: '/about' },
    { label: 'FAQ', href: '/faq' },
    { label: 'Terms', href: '/terms' },
    { label: 'Contact', href: '/contact' },
  ];

  const links = pageLinks.map((l) => ({
    ...l,
    href: withStyle(l.href, isFestivalStyle),
  }));

  // Founding Partner Program section lives on the Home page
  const partnerHref = withStyle('/#partner', isFestivalStyle);
  const homeHref = withStyle('/', isFestivalStyle);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname, isFestivalStyle]);

  useEffect(() => {
    if (!isMenuOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isMenuOpen]);

  return (
    <header className="site-header">
      <div className="container site-header-container">
        <div className="site-header-pill">
          <Link href={homeHref} className="site-header-logo" aria-label="IMIN Home">
            <Image
              src={logoSrc}
              alt="IMIN"
              width={44}
              height={22}
              priority
              style={{ height: 'auto' }}
            />
          </Link>

          <nav className="site-header-nav" aria-label="Primary">
            {links.map((l) => (
              <Link key={l.label} href={l.href} className="site-header-link">
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="site-header-cta">
            <Link href={partnerHref} className="site-header-cta-btn">
              Partner Access
            </Link>
          </div>

          <button
            type="button"
            className="site-header-menu-btn"
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMenuOpen ? 'true' : 'false'}
            onClick={() => setIsMenuOpen((v) => !v)}
          >
            <span className="site-header-menu-icon" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
          </button>

          {isMenuOpen && (
            <>
              <button
                type="button"
                className="site-header-backdrop"
                aria-label="Close menu"
                onClick={() => setIsMenuOpen(false)}
              />
              <div className="site-header-mobile-menu" role="dialog" aria-label="Menu">
                <div className="site-header-mobile-links">
                  {links.map((l) => (
                    <Link
                      key={l.label}
                      href={l.href}
                      className="site-header-mobile-link"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {l.label}
                    </Link>
                  ))}
                </div>
                <Link href={partnerHref} className="site-header-mobile-cta" onClick={() => setIsMenuOpen(false)}>
                  Partner Access
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}


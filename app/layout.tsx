import type { Metadata } from 'next';
import { Barlow_Condensed, DM_Sans, DM_Mono } from 'next/font/google';
import './globals.css';

const display = Barlow_Condensed({
  weight: ['600', '700', '800'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-display',
});

const sans = DM_Sans({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

const mono = DM_Mono({
  weight: ['400', '500'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
});

const SITE_URL = 'https://imin.wtf';
const title = 'IMIN — The two-sided platform for nightlife';
// ≤160 chars so Google shows it whole.
const description =
  'IMIN runs the night for organizers — AI marketing, ticketing and posters in one dashboard — and helps people find an event, and someone to go with.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title,
  description,
  applicationName: 'IMIN',
  alternates: { canonical: '/' },
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    url: '/',
    siteName: 'IMIN',
    locale: 'en_US',
    title,
    description,
    // og:image comes from app/opengraph-image.tsx (PNG — crawlers ignore SVG).
  },
  twitter: { card: 'summary_large_image', title, description },
  icons: { icon: '/assets/favicon.svg' },
  // Search Console HTML-tag verification; the tag is omitted while the env var is unset.
  verification: { google: process.env.GOOGLE_SITE_VERIFICATION },
};

// Only facts that are already on the page.
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: 'IMIN',
      url: `${SITE_URL}/`,
      logo: `${SITE_URL}/icon.png`,
      description,
      founder: [
        {
          '@type': 'Person',
          name: 'Bohdan Shostak',
          jobTitle: 'CEO',
          sameAs: 'https://www.linkedin.com/in/bohdan-shostak-653006212/',
        },
        {
          '@type': 'Person',
          name: 'Ivan Kozmulyak',
          jobTitle: 'CTO',
          sameAs: 'https://www.linkedin.com/in/ivan-kozmulyak-a72b2120a/',
        },
      ],
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: `${SITE_URL}/`,
      name: 'IMIN',
      publisher: { '@id': `${SITE_URL}/#organization` },
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${sans.variable} ${mono.variable}`}
    >
      <body>
        {/* ponytail: no-JS fallback — reveal elements start opacity:0 and are shown by the IO hook; without JS they'd stay invisible */}
        <noscript>
          <style
            dangerouslySetInnerHTML={{
              __html: '.reveal{opacity:1!important;transform:none!important}',
            }}
          />
        </noscript>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}

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

const description =
  'The operating system that runs the night for organizers — and the app that helps people find an event, and someone to go with. Live product, one paying client, raising our first round.';

export const metadata: Metadata = {
  metadataBase: new URL('https://imin.wtf'),
  title: 'IMIN — The two-sided platform for nightlife',
  description,
  openGraph: {
    title: 'IMIN — The two-sided platform for nightlife',
    description,
    images: ['/assets/og-image.svg'],
  },
  icons: { icon: '/assets/favicon.svg' },
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
        {children}
      </body>
    </html>
  );
}

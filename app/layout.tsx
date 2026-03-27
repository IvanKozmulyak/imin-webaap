import type { Metadata, Viewport } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import Script from 'next/script'
import { getActiveProvider } from '@/lib/constants/analytics'
import './globals.css'

const inter = Inter({
  weight: ['400', '500', '600', '800'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

const jetbrainsMono = JetBrains_Mono({
  weight: ['500', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
})

export const metadata: Metadata = {
  title: 'IMIN | The Social Infrastructure',
  description: 'Find your people for events. Don\'t let "I have no one to go with" stop you. We match you into squads of 5 for anywhere the music is loud.',
  icons: {
    icon: [
      { url: '/assets/logo.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/assets/logo.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/assets/logo.svg',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const analyticsProvider = getActiveProvider();
  
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        {/* Plausible Analytics - Privacy-friendly, no cookie required */}
        {analyticsProvider === 'plausible' && (
          <>
            <Script 
              defer 
              strategy="afterInteractive"
              src="https://plausible.io/js/script.js"
              data-domain="imin.wtf"
            />
          </>
        )}
        {/* PostHog Analytics - Full feature analytics platform */}
        {analyticsProvider === 'posthog' && (
          <Script
            id="posthog-init"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.async=!0,p.src=s.api_host+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r),e._i=[],e.init=function(t,e,o,n,p,r){p=o.createElement("script"),p.type="text/javascript",p.async=!0,p.src=s.api_host+"/static/array.js",(n=o.getElementsByTagName("script")[0]).parentNode.insertBefore(p,n),g(e,e.identify),g(e.capture),g(e.register)(t,{})},i(e)}(window,document,window.posthog||[]);
              `
            }}
          />
        )}
      </head>
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans`}>{children}</body>
    </html>
  )
}

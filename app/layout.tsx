import type { Metadata, Viewport } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
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
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans`}>{children}</body>
    </html>
  )
}

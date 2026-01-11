import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'
import './globals.css'

const poppins = Poppins({
  weight: ['400', '500'],
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'IM IN - Event Matching System',
  description: 'Event matching system for grouping users by common languages',
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={poppins.className}>{children}</body>
    </html>
  )
}

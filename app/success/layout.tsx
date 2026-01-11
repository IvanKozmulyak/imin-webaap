import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Registration Success - IM IN',
  description: 'Your registration was successful! Get ready to connect with your crew.',
}

export default function SuccessLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

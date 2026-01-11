import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Register for Event - IM IN',
  description: 'Register for an upcoming event and connect with people',
}

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

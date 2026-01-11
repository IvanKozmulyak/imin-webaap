import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'IM IN - Event Matching System',
  description: 'IM IN Event Matching System - Connect with people who want to meet you',
}

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-4">Imin Event Matching System</h1>
      <p className="text-lg text-gray-600">API is ready to use</p>
    </main>
  )
}

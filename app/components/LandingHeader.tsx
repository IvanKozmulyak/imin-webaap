'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function LandingHeader() {
  return (
    <header style={{ padding: '30px 0', position: 'absolute', width: '100%', top: 0, zIndex: 10 }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/landing" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
          <Image
            src="/assets/logo.svg"
            alt="IMIN"
            width={44}
            height={22}
            priority
            style={{ height: 'auto' }}
          />
        </Link>
        <Link href="/events?style=festival" className="btn-outline" style={{ fontSize: '0.85rem', padding: '10px 24px' }}>
          Join Squad
        </Link>
      </div>
    </header>
  );
}

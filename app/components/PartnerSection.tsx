'use client';

import { useState } from 'react';
import PartnerModal from './PartnerModal';

export default function PartnerSection() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <section className="partner-section">
        <div className="partner-layout">
          <div>
            <span className="section-label" style={{ color: '#00FF94' }}>
              // FOR ORGANIZERS
            </span>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1.1, marginBottom: '20px' }}>
              THE BRIDGE TO
              <br />
              UNLOCKED REVENUE.
            </h2>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-gray)', marginBottom: '30px' }}>
              We don&apos;t compete for attention. We integrate with you to capture the &quot;Solo&quot; segment that usually drops out. We bundle solo fans into squads and bridge them directly to your ticket checkout.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn-ghost"
              style={{ marginLeft: 0, borderColor: '#00FF94', color: '#00FF94' }}
            >
              Become a Partner
            </button>
          </div>

          <div className="glass-card partner-card">
            <h3 style={{ marginBottom: '20px' }}>Infrastructure Impact</h3>
            <div className="business-stat">
              <span>Audience Unlocked</span>
              <span>+24%</span>
            </div>
            <div className="business-stat">
              <span>Ad Spend (CAC)</span>
              <span>$0</span>
            </div>
            <div className="business-stat">
              <span>Lifetime Value (LTV)</span>
              <span>3x</span>
            </div>
            <div className="business-stat" style={{ borderBottom: 'none' }}>
              <span>Integration</span>
              <span>Native</span>
            </div>
          </div>
        </div>
      </section>

      <PartnerModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}

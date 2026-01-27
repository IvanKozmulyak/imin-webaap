'use client';

import Link from 'next/link';
import LandingHeader from '../../components/LandingHeader';
import LandingFooter from '../../components/LandingFooter';

export default function LandingTermsPage() {
  return (
    <div className="festival-style">
      {/* Ambient Background with Blobs */}
      <div className="ambient-light" aria-hidden="true">
        <div className="blob blob-1" id="blob1"></div>
        <div className="blob blob-2" id="blob2"></div>
      </div>

      {/* Festival Background Layer */}
      <div className="hero-bg-layer"></div>
      <div className="hero-overlay"></div>

      <LandingHeader />

      <main className="container" style={{ paddingTop: '120px', paddingBottom: '80px' }}>
        <div className="terms-page">
          <div className="glass-card" style={{ padding: '50px 40px' }}>
            <h1 className="terms-page-title">TERMS AND CONDITIONS</h1>
            <p className="terms-page-date">Last Updated: 09.01.2026</p>

            <div className="terms-page-content">
              <section className="terms-section-item">
                <h2>1. INTRODUCTION</h2>
                <p>
                  Welcome to IMIN (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). By accessing our website (imin.wtf) and using our services to connect with party groups, you agree to be bound by these Terms. If you do not agree, please do not use our service.
                </p>
              </section>

              <section className="terms-section-item">
                <h2>2. THE SERVICE</h2>
                <p>
                  IMIN is a social matching service that:
                </p>
                <ul>
                  <li>Collects user preferences for nightlife and events.</li>
                  <li>Groups users based on these preferences.</li>
                  <li>Redirects users to third-party platforms (e.g., Telegram) to facilitate communication.</li>
                  <li>Redirects users to third-party ticket vendors for event access.</li>
                </ul>
                <p>
                  <strong>WE DO NOT ORGANIZE THE EVENTS.</strong> We are solely a matching service. We are not responsible for the quality, safety, or cancellation of the events you attend.
                </p>
              </section>

              <section className="terms-section-item">
                <h2>3. ELIGIBILITY</h2>
                <p>By using IMIN, you confirm that:</p>
                <ul>
                  <li><strong>Age:</strong> You are at least 18 years old (or the legal drinking age in your jurisdiction).</li>
                  <li><strong>Capacity:</strong> You have the legal capacity to enter into binding contracts.</li>
                  <li><strong>Legality:</strong> You are not barred from using social services under the laws of your jurisdiction.</li>
                </ul>
              </section>

              <section className="terms-section-item">
                <h2>4. USER CONDUCT & SAFETY (CRITICAL)</h2>
                <p>You acknowledge that IMIN connects you with strangers for social activities.</p>
                <ul>
                  <li><strong>Zero Tolerance:</strong> We have zero tolerance for harassment, hate speech, violence, or illegal behavior within the groups we facilitate.</li>
                  <li><strong>Personal Responsibility:</strong> You are solely responsible for your interactions with other users. We do not conduct criminal background checks on users.</li>
                  <li><strong>Safety:</strong> You agree to take necessary precautions in all interactions, especially when meeting offline.</li>
                </ul>
              </section>

              <section className="terms-section-item">
                <h2>5. LIABILITY DISCLAIMER (USE AT YOUR OWN RISK)</h2>
                <p>To the maximum extent permitted by law, IMIN is <strong>NOT LIABLE</strong> for:</p>
                <ul>
                  <li><strong>Personal Injury:</strong> Any bodily injury, emotional distress, or damages arising from your meetings with other users or attendance at events.</li>
                  <li><strong>Event Issues:</strong> Refusal of entry by club/event organizers, lost tickets, or event cancellations.</li>
                  <li><strong>Third-Party Acts:</strong> The conduct, whether online or offline, of any other user of the service.</li>
                </ul>
              </section>

              <section className="terms-section-item">
                <h2>6. TICKETS AND PAYMENTS</h2>
                <ul>
                  <li>IMIN may redirect you to third-party ticket sellers. Any purchase is a contract solely between you and the ticket seller.</li>
                  <li>IMIN does not process refunds for third-party event tickets.</li>
                </ul>
              </section>

              <section className="terms-section-item">
                <h2>7. DATA PRIVACY & THIRD-PARTY PLATFORMS</h2>
                <ul>
                  <li><strong>Data Processing:</strong> By using the service, you agree to our processing of your data (Name, Age, Preferences, Contact Info) to facilitate the matching process.</li>
                  <li><strong>Telegram:</strong> You acknowledge that group chats are hosted on Telegram, a third-party platform. By joining a group, you agree to Telegram&apos;s Terms of Service and understand that your profile information may be visible to other group members.</li>
                </ul>
              </section>

              <section className="terms-section-item">
                <h2>8. TERMINATION</h2>
                <p>
                  We reserve the right to ban you from our service and remove you from any associated groups (Telegram/WhatsApp) at our sole discretion, without notice, if you violate these Terms.
                </p>
              </section>

              <section className="terms-section-item">
                <h2>9. GOVERNING LAW</h2>
                <p>
                  These Terms are governed by the laws of France, Grand-Est.
                </p>
              </section>
            </div>

            <div className="terms-page-footer">
              <Link href="/landing" className="btn-gradient">
                Back to Landing
              </Link>
            </div>
          </div>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}

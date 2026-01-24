'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
import CustomDropdown, { DropdownOption } from '../components/CustomDropdown';

function ContactContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const isFestivalStyle = searchParams?.get('style') === 'festival';

  const switchMode = () => {
    router.push(isFestivalStyle ? '/contact' : '/contact?style=festival');
  };

  const [showSuccess, setShowSuccess] = useState(false);
  const [annualAttendees, setAnnualAttendees] = useState<string>('');
  const [fieldErrors, setFieldErrors] = useState<{
    organization?: string;
    email?: string;
    annualAttendees?: string;
    message?: string;
  }>({});

  const attendeeOptions: DropdownOption[] = [
    { value: '10k - 50k Attendees', label: '10k - 50k Attendees' },
    { value: '50k - 200k Attendees', label: '50k - 200k Attendees' },
    { value: '200k+ Attendees', label: '200k+ Attendees' },
  ];

  return (
    <div className={isFestivalStyle ? 'festival-style' : ''}>
      {/* Mode Switcher */}
      <button
        onClick={switchMode}
        className="mode-switcher"
        aria-label={isFestivalStyle ? 'Switch to Nightlife' : 'Switch to Festival'}
      >
        <span className="switcher-indicator"></span>
        <span className="switcher-text">{isFestivalStyle ? 'Switch to Nightlife' : 'Switch to Festival'}</span>
      </button>

      {/* Ambient Background with Blobs */}
      <div className="ambient-light" aria-hidden="true">
        <div className="blob blob-1" id="blob1"></div>
        <div className="blob blob-2" id="blob2"></div>
      </div>

      {/* Festival Background Layer */}
      {isFestivalStyle && (
        <>
          <div className="hero-bg-layer"></div>
          <div className="hero-overlay"></div>
        </>
      )}

      <SiteHeader />

      <main className="container contact-page" style={{ paddingTop: '70px', paddingBottom: '90px' }}>
        {/* Success modal */}
        {showSuccess && (
          <div className="partner-success-overlay" onClick={() => setShowSuccess(false)}>
            <div className="partner-success-modal" onClick={(e) => e.stopPropagation()}>
              <button
                className="partner-success-close"
                onClick={() => setShowSuccess(false)}
                aria-label="Close"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
              <div className="partner-success-content">
                <div className="partner-success-icon">
                  <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
                    <path d="M8 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '12px', color: isFestivalStyle ? 'var(--text-dark)' : 'white' }}>
                  Message sent
                </h2>
                <p style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '26px', lineHeight: '1.6' }}>
                  Thanks — we’ll get back to you shortly.
                </p>
                <button
                  onClick={() => setShowSuccess(false)}
                  className="btn-gradient"
                  style={{ padding: '14px 32px', fontSize: '1rem' }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="contact-grid">
          {/* Left */}
          <section className="contact-left">
            <span className="contact-pill">GET IN TOUCH</span>
            <h1 className="contact-title" style={{ color: isFestivalStyle ? 'var(--text-dark)' : 'white' }}>
              Let&apos;s start the
              <br />
              conversation.
            </h1>
            <p className="contact-subtitle">
              Interested in integrating IMIN into your ticketing platform? Or maybe you have a question about our community tools. Fill out the form and we&apos;ll be in touch.
            </p>

            <div className="contact-meta">
              <div className="contact-meta-block">
                <div className="contact-meta-label">EMAIL US</div>
                <a className="contact-meta-value" href="mailto:hello@imin.app">
                  hello@imin.app
                </a>
              </div>

              <div className="contact-meta-block">
                <div className="contact-meta-label">SOCIALS</div>
                <div className="contact-socials">
                  <a className="contact-social-link" href="https://www.instagram.com/imin.wtf/" target="_blank" rel="noopener noreferrer">
                    Instagram
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* Right */}
          <section className="contact-right">
            <div className="contact-card glass-card" style={{ padding: '34px 34px' }}>
              <form
                className="contact-form"
                noValidate
                onSubmit={async (e) => {
                  e.preventDefault();
                  const form = e.currentTarget as HTMLFormElement;
                  const formData = new FormData(form);

                  const organization = (formData.get('organization') as string) || '';
                  const email = (formData.get('email') as string) || '';
                  const message = (formData.get('message') as string) || '';

                  const nextErrors: typeof fieldErrors = {};
                  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

                  if (!organization.trim()) nextErrors.organization = 'Please enter your organization name.';
                  if (!email.trim() || !emailRegex.test(email.trim())) nextErrors.email = 'Please enter a valid email address.';
                  if (!annualAttendees) nextErrors.annualAttendees = 'Please select annual attendees.';
                  if (!message.trim()) nextErrors.message = 'Please enter a short message.';

                  if (Object.keys(nextErrors).length > 0) {
                    setFieldErrors(nextErrors);
                    return;
                  }

                  setFieldErrors({});

                  try {
                    const response = await fetch('/api/partner-request', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        organization,
                        email,
                        annualAttendees,
                        message,
                      }),
                    });

                    if (response.ok) {
                      form.reset();
                      setAnnualAttendees('');
                      setFieldErrors({});
                      setShowSuccess(true);
                      return;
                    }

                    const data = await response.json().catch(() => null);
                    setFieldErrors({ email: data?.error || 'Failed to send request. Please try again.' });
                  } catch (error) {
                    setFieldErrors({ email: 'An error occurred. Please try again.' });
                  }
                }}
              >
                <div className="contact-field">
                  <label className="contact-label" htmlFor="name">
                    Organization
                  </label>
                  <input
                    id="name"
                    name="organization"
                    className={`form-input ${fieldErrors.organization ? 'error' : ''}`}
                    placeholder="e.g., Your Venue Name"
                    aria-required="true"
                    aria-invalid={fieldErrors.organization ? 'true' : 'false'}
                    onChange={() => {
                      if (fieldErrors.organization) setFieldErrors((p) => ({ ...p, organization: undefined }));
                    }}
                  />
                  {fieldErrors.organization && <div className="form-error-text">{fieldErrors.organization}</div>}
                </div>

                <div className="contact-field">
                  <label className="contact-label" htmlFor="email">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    className={`form-input ${fieldErrors.email ? 'error' : ''}`}
                    placeholder="you@company.com"
                    aria-required="true"
                    aria-invalid={fieldErrors.email ? 'true' : 'false'}
                    onChange={() => {
                      if (fieldErrors.email) setFieldErrors((p) => ({ ...p, email: undefined }));
                    }}
                  />
                  {fieldErrors.email && <div className="form-error-text">{fieldErrors.email}</div>}
                </div>

                <div className="contact-field">
                  <label className="contact-label" htmlFor="annualAttendees">
                    Annual Attendees
                  </label>
                  <CustomDropdown
                    options={attendeeOptions}
                    value={annualAttendees}
                    onChange={(val) => {
                      setAnnualAttendees(val);
                      if (fieldErrors.annualAttendees) setFieldErrors((p) => ({ ...p, annualAttendees: undefined }));
                    }}
                    placeholder="Select Annual Attendees"
                    isFestivalStyle={isFestivalStyle}
                    className={fieldErrors.annualAttendees ? 'error' : ''}
                  />
                  <input type="hidden" id="annualAttendees" name="annualAttendees" value={annualAttendees} />
                  {fieldErrors.annualAttendees && <div className="form-error-text">{fieldErrors.annualAttendees}</div>}
                </div>

                <div className="contact-field">
                  <label className="contact-label" htmlFor="message">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    className={`form-input contact-textarea ${fieldErrors.message ? 'error' : ''}`}
                    placeholder="Tell us about your event or question..."
                    aria-required="true"
                    aria-invalid={fieldErrors.message ? 'true' : 'false'}
                    onChange={() => {
                      if (fieldErrors.message) setFieldErrors((p) => ({ ...p, message: undefined }));
                    }}
                  />
                  {fieldErrors.message && <div className="form-error-text">{fieldErrors.message}</div>}
                </div>

                <button type="submit" className="contact-submit">
                  Send Message
                </button>
              </form>
            </div>
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

export default function ContactPage() {
  return (
    <Suspense fallback={null}>
      <ContactContent />
    </Suspense>
  );
}


'use client';

import { useState, FormEvent } from 'react';

export default function PartnerAccessSection() {
  const [formData, setFormData] = useState({
    organization: '',
    email: '',
    annualAttendees: 'Under 10,000',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const response = await fetch('/api/partner-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          organization: formData.organization,
          email: formData.email,
          message: `Annual Attendees: ${formData.annualAttendees}`,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setFormData({
          organization: '',
          email: '',
          annualAttendees: 'Under 10,000',
        });
        setTimeout(() => {
          setSuccess(false);
        }, 5000);
      } else {
        setError(data.error || 'Failed to send request. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="partner-access-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', marginBottom: '100px', alignItems: 'center' }}>
      {/* Left: Text Content */}
      <div>
        <span className="section-label" style={{ color: '#00FF94', border: '1px solid #00FF94', padding: '4px 12px', borderRadius: '4px', display: 'inline-block', marginBottom: '20px' }}>
          {'// PARTNER ACCESS'}
        </span>
        <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '24px', letterSpacing: '-0.02em', lineHeight: '1.2' }}>
          Ready to Fill Your Venue?
        </h2>
        <p style={{ color: 'var(--text-gray)', marginBottom: '30px', fontSize: '1.1rem', lineHeight: '1.6' }}>
          We are selectively onboarding event organizers for the 2026 season. Apply now to secure your integration slot.
        </p>
        
        <ul style={{ listStyle: 'none', color: 'white' }}>
          <li style={{ marginBottom: '20px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <span style={{ color: '#00FF94', fontSize: '1.2rem', marginTop: '2px' }}>✓</span>
            <span style={{ fontSize: '1rem' }}>Zero Integration Cost for first 50 partners.</span>
          </li>
          <li style={{ marginBottom: '20px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <span style={{ color: '#00FF94', fontSize: '1.2rem', marginTop: '2px' }}>✓</span>
            <span style={{ fontSize: '1rem' }}>Full Data Dashboard of attendee demographics.</span>
          </li>
          <li style={{ marginBottom: '0', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <span style={{ color: '#00FF94', fontSize: '1.2rem', marginTop: '2px' }}>✓</span>
            <span style={{ fontSize: '1rem' }}>24/7 Support for your first event.</span>
          </li>
        </ul>
      </div>

      {/* Right: Application Form */}
      <div className="glass-card" style={{ padding: '40px' }}>
        {success ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ 
              width: '60px', 
              height: '60px', 
              background: '#00FF94', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              margin: '0 auto 20px',
              fontSize: '2rem',
              color: '#000'
            }}>
              ✓
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '10px' }}>Thank You!</h3>
            <p style={{ color: 'var(--text-gray)' }}>We&apos;ll get back to you soon.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {error && (
              <div style={{ 
                background: 'rgba(255, 68, 68, 0.1)', 
                border: '1px solid rgba(255, 68, 68, 0.3)', 
                borderRadius: '12px', 
                padding: '12px 16px', 
                color: '#ff6b6b',
                fontSize: '0.9rem'
              }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label htmlFor="organization" style={{ 
                color: 'var(--text-white)', 
                fontSize: '0.9rem', 
                fontWeight: 500,
                fontFamily: 'var(--font-mono)',
                letterSpacing: '0.5px'
              }}>
                Organization / Venue Name
              </label>
              <input
                type="text"
                id="organization"
                name="organization"
                value={formData.organization}
                onChange={handleChange}
                required
                placeholder="e.g. Fabric London"
                className="form-input"
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label htmlFor="email" style={{ 
                color: 'var(--text-white)', 
                fontSize: '0.9rem', 
                fontWeight: 500,
                fontFamily: 'var(--font-mono)',
                letterSpacing: '0.5px'
              }}>
                Work Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="name@company.com"
                className="form-input"
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label htmlFor="annualAttendees" style={{ 
                color: 'var(--text-white)', 
                fontSize: '0.9rem', 
                fontWeight: 500,
                fontFamily: 'var(--font-mono)',
                letterSpacing: '0.5px'
              }}>
                Estimated Annual Attendees
              </label>
              <select
                id="annualAttendees"
                name="annualAttendees"
                value={formData.annualAttendees}
                onChange={handleChange}
                className="form-input"
                style={{ 
                  appearance: 'none',
                  backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 12 12\'%3E%3Cpath fill=\'%23ffffff\' d=\'M6 9L1 4h10z\'/%3E%3C/svg%3E")',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 14px center',
                  paddingRight: '40px'
                }}
              >
                <option value="Under 10,000">Under 10,000</option>
                <option value="10,000 - 50,000">10,000 - 50,000</option>
                <option value="50,000 - 100,000">50,000 - 100,000</option>
                <option value="100,000 - 500,000">100,000 - 500,000</option>
                <option value="500,000+">500,000+</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={submitting}
              style={{
                width: '100%',
                padding: '16px 32px',
                background: 'white',
                color: '#000',
                border: 'none',
                borderRadius: '50px',
                fontWeight: 600,
                fontSize: '1rem',
                cursor: submitting ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                opacity: submitting ? 0.6 : 1,
                marginTop: '8px'
              }}
              onMouseEnter={(e) => {
                if (!submitting) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 255, 255, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {submitting ? 'Applying...' : 'Apply for Partnership'}
            </button>

            <p style={{ 
              color: 'var(--text-gray)', 
              fontSize: '0.85rem', 
              textAlign: 'center',
              marginTop: '8px'
            }}>
              Limited spots available for Q1 2026.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

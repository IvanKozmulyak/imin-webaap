'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { EventDto } from '@/lib/types/event';
import { LanguageDto } from '@/lib/types/language';
import { EventRegistrationRequestDto } from '@/lib/types/registration';
import EventsSplashScreen from '@/app/components/EventsSplashScreen';

function RegisterContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const eventId = searchParams?.get('eventId');
  const style = searchParams?.get('style');
  const fromEvents = searchParams?.get('fromEvents');
  const isFestivalStyle = style === 'festival';
  const [showSplash, setShowSplash] = useState(false);

  const switchMode = () => {
    if (!eventId) return;
    const newStyle = isFestivalStyle ? '' : 'festival';
    const newUrl = `/register?eventId=${eventId}${newStyle ? `&style=${newStyle}` : ''}`;
    router.push(newUrl);
  };

  const [event, setEvent] = useState<EventDto | null>(null);
  const [languages, setLanguages] = useState<LanguageDto[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [isLoadingEvent, setIsLoadingEvent] = useState(true);
  
  const [formData, setFormData] = useState<EventRegistrationRequestDto>({
    name: '',
    email: '',
    age: 0,
    sex: '',
    languagesISpeak: [],
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [telegramInviteLink, setTelegramInviteLink] = useState<string | null>(null);

  // Debug: Log state changes
  useEffect(() => {
    console.log('Submit success state:', submitSuccess);
    console.log('Telegram invite link state:', telegramInviteLink);
  }, [submitSuccess, telegramInviteLink]);

  useEffect(() => {
    // Check if user has already accepted the splash screen
    const splashAccepted = localStorage.getItem('events-splash-accepted');
    // Only show splash if user didn't come from events page and hasn't accepted before
    if (!splashAccepted && !fromEvents) {
      setShowSplash(true);
    }
    
    if (eventId) {
      fetchEventData();
      fetchLanguages();
    }
  }, [eventId, fromEvents]);

  useEffect(() => {
    // Parallax blob animation with performance optimization
    let ticking = false;
    let rafId: number | null = null;

    const handleScroll = () => {
      if (!ticking) {
        rafId = requestAnimationFrame(() => {
          const scrollPos = window.scrollY;
          const blob1 = document.getElementById('blob1');
          const blob2 = document.getElementById('blob2');
          if (blob1) blob1.style.transform = `translate3d(0, ${scrollPos * 0.2}px, 0)`;
          if (blob2) blob2.style.transform = `translate3d(0, ${scrollPos * 0.15}px, 0)`;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, []);

  const fetchEventData = async () => {
    setIsLoadingEvent(true);
    try {
      const response = await fetch(`/api/events/${eventId}`);
      if (response.ok) {
        const data = await response.json();
        setEvent(data);
      } else {
        setSubmitError('Event not found');
      }
    } catch (error) {
      console.error('Error fetching event:', error);
      setSubmitError('Failed to load event information');
    } finally {
      setIsLoadingEvent(false);
    }
  };

  const fetchLanguages = async () => {
    try {
      const response = await fetch('/api/languages');
      if (response.ok) {
        const data = await response.json();
        setLanguages(data);
      }
    } catch (error) {
      console.error('Error fetching languages:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      day: date.getDate().toString().padStart(2, '0'),
      month: date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
      full: date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      }),
    };
  };

  const getTimeRange = (from: string, to: string) => {
    const fromDate = new Date(from);
    const toDate = new Date(to);
    const fromTime = fromDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
    const toTime = toDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
    return `${fromTime} - ${toTime}`;
  };

  const handleInputChange = (field: keyof EventRegistrationRequestDto, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear field error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const toggleLanguage = (languageCode: string) => {
    setFormData((prev) => {
      const currentLanguages = prev.languagesISpeak;
      const newLanguages = currentLanguages.includes(languageCode)
        ? currentLanguages.filter((lang) => lang !== languageCode)
        : [...currentLanguages, languageCode];
      
      return {
        ...prev,
        languagesISpeak: newLanguages,
      };
    });
    // Clear field error when user selects a language
    if (fieldErrors.languagesISpeak) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.languagesISpeak;
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setFieldErrors({});

    // Validate form
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Email must be valid';
    }
    if (!formData.age || formData.age < 1) {
      errors.age = 'Age must be a positive number';
    }
    if (!formData.sex.trim()) {
      errors.sex = 'Sex is required';
    }
    if (formData.languagesISpeak.length === 0) {
      errors.languagesISpeak = 'Please select at least one language';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`/api/events/${eventId}/registrations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const responseData = await response.json();
      console.log('Full registration response:', responseData);
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (response.ok) {
        // The API returns the registration object directly
        const registration = responseData;
        console.log('Registration data:', registration);
        console.log('Telegram invite link from response:', registration?.telegramInviteLink);
        console.log('Type of telegramInviteLink:', typeof registration?.telegramInviteLink);
        
        setSubmitSuccess(true);
        // Set telegram link - handle null, undefined, and empty string
        const link = registration?.telegramInviteLink;
        const validLink = link && typeof link === 'string' && link.trim() !== '' ? link : null;
        console.log('Valid telegram link:', validLink);
        setTelegramInviteLink(validLink);
      } else {
        // Handle API validation errors
        if (responseData.errors && typeof responseData.errors === 'object') {
          setFieldErrors(responseData.errors);
        } else if (responseData.fieldErrors && typeof responseData.fieldErrors === 'object') {
          setFieldErrors(responseData.fieldErrors);
        } else {
          setSubmitError(responseData.message || responseData.error || 'Failed to submit registration');
        }
      }
    } catch (error) {
      console.error('Error submitting registration:', error);
      setSubmitError('Failed to submit registration. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!eventId) {
    return (
      <div className={isFestivalStyle ? 'festival-style' : ''}>
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px 20px',
            color: isFestivalStyle ? 'var(--text-dark)' : 'white',
            textAlign: 'center',
            background: isFestivalStyle
              ? 'var(--bg-base)'
              : 'linear-gradient(180deg, var(--bg-dark) 0%, #0a0a1a 100%)',
          }}
        >
          <h1 style={{ fontSize: '2rem', marginBottom: '20px', fontWeight: 800 }}>
            Event Not Found
          </h1>
          <p style={{ marginBottom: '30px', opacity: 0.8 }}>
            Please select an event to register.
          </p>
          <Link
            href={`/events${isFestivalStyle ? '?style=festival' : ''}`}
            style={{
              padding: '12px 24px',
              background: isFestivalStyle
                ? 'linear-gradient(135deg, var(--primary-purple), var(--vivid-pink))'
                : 'linear-gradient(135deg, var(--glow-purple), var(--glow-blue))',
              color: 'white',
              borderRadius: '12px',
              textDecoration: 'none',
              fontWeight: 600,
            }}
          >
            Browse Events
          </Link>
        </div>
      </div>
    );
  }

  if (isLoadingEvent) {
    return (
      <div className={isFestivalStyle ? 'festival-style' : ''}>
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

        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px 20px',
            color: isFestivalStyle ? 'var(--text-dark)' : 'white',
            textAlign: 'center',
            background: isFestivalStyle
              ? 'var(--bg-base)'
              : 'linear-gradient(180deg, var(--bg-dark) 0%, #0a0a1a 100%)',
          }}
        >
          <div style={{
            width: '60px',
            height: '60px',
            border: `4px solid ${isFestivalStyle ? 'rgba(124, 58, 237, 0.2)' : 'rgba(255, 255, 255, 0.2)'}`,
            borderTop: `4px solid ${isFestivalStyle ? 'var(--primary-purple)' : 'var(--glow-green)'}`,
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginBottom: '20px',
          }} />
          <p style={{ 
            color: isFestivalStyle ? 'var(--text-dark)' : 'white',
            fontSize: '1.1rem',
            fontWeight: 500,
          }}>
            Loading event information...
          </p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className={isFestivalStyle ? 'festival-style' : ''}>
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px 20px',
            color: isFestivalStyle ? 'var(--text-dark)' : 'white',
            textAlign: 'center',
            background: isFestivalStyle
              ? 'var(--bg-base)'
              : 'linear-gradient(180deg, var(--bg-dark) 0%, #0a0a1a 100%)',
          }}
        >
          <h1 style={{ fontSize: '2rem', marginBottom: '20px', fontWeight: 800 }}>
            Event Not Found
          </h1>
          <p style={{ marginBottom: '30px', opacity: 0.8 }}>
            {submitError || 'The event you are looking for could not be found.'}
          </p>
          <Link
            href={`/events${isFestivalStyle ? '?style=festival' : ''}`}
            style={{
              padding: '12px 24px',
              background: isFestivalStyle
                ? 'linear-gradient(135deg, var(--primary-purple), var(--vivid-pink))'
                : 'linear-gradient(135deg, var(--glow-purple), var(--glow-blue))',
              color: 'white',
              borderRadius: '12px',
              textDecoration: 'none',
              fontWeight: 600,
            }}
          >
            Browse Events
          </Link>
        </div>
      </div>
    );
  }

  const handleSplashAgree = () => {
    setShowSplash(false);
  };

  const dateInfo = formatDate(event.fromDateTime);
  const timeRange = getTimeRange(event.fromDateTime, event.toDateTime);

  return (
    <div className={isFestivalStyle ? 'festival-style' : ''}>
      {/* Splash Screen */}
      {showSplash && (
        <EventsSplashScreen 
          onAgree={handleSplashAgree} 
          isFestivalStyle={isFestivalStyle}
        />
      )}
      {/* Mode Switcher */}
      {eventId && (
        <button
          onClick={switchMode}
          className="mode-switcher"
          aria-label={isFestivalStyle ? 'Switch to Nightlife' : 'Switch to Festival'}
        >
          <span className="switcher-indicator"></span>
          <span className="switcher-text">
            {isFestivalStyle ? 'Switch to Nightlife' : 'Switch to Festival'}
          </span>
        </button>
      )}

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

      <main
        style={{
          minHeight: '100vh',
          paddingTop: '40px',
          paddingBottom: '40px',
          background: isFestivalStyle
            ? 'var(--bg-base)'
            : 'linear-gradient(180deg, var(--bg-dark) 0%, #0a0a1a 100%)',
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 20px',
          }}
        >
          {/* Event Information Section */}
          <div
            style={{
              marginBottom: '60px',
              background: isFestivalStyle
                ? 'white'
                : 'rgba(255, 255, 255, 0.03)',
              borderRadius: '24px',
              overflow: 'hidden',
              border: isFestivalStyle
                ? '1px solid rgba(0, 0, 0, 0.1)'
                : '1px solid rgba(255, 255, 255, 0.08)',
              boxShadow: isFestivalStyle
                ? '0 20px 40px rgba(124, 58, 237, 0.05)'
                : '0 8px 32px rgba(0, 0, 0, 0.3)',
            }}
          >
            {/* Event Image */}
            {event.imageUrl && (
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  height: '400px',
                  overflow: 'hidden',
                }}
              >
                <Image
                  src={event.imageUrl}
                  alt={event.name}
                  fill
                  style={{ objectFit: 'cover' }}
                  unoptimized
                />
              </div>
            )}

            {/* Event Details */}
            <div style={{ padding: '40px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  marginBottom: '24px',
                }}
              >
                <div
                  style={{
                    background: isFestivalStyle
                      ? 'linear-gradient(135deg, var(--primary-purple), var(--vivid-pink))'
                      : 'linear-gradient(135deg, var(--glow-purple), var(--glow-blue))',
                    borderRadius: '16px',
                    padding: '16px 20px',
                    color: 'white',
                    fontWeight: 700,
                    textAlign: 'center',
                    minWidth: '80px',
                  }}
                >
                  <div style={{ fontSize: '1.5rem', lineHeight: 1 }}>
                    {dateInfo.day}
                  </div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>
                    {dateInfo.month}
                  </div>
                </div>
                <div>
                  <h1
                    style={{
                      fontSize: '2rem',
                      fontWeight: 800,
                      marginBottom: '8px',
                      color: isFestivalStyle ? 'var(--text-dark)' : 'white',
                    }}
                  >
                    {event.name}
                  </h1>
                  <p
                    style={{
                      color: isFestivalStyle ? 'var(--text-muted)' : 'rgba(255, 255, 255, 0.7)',
                      fontSize: '0.9rem',
                    }}
                  >
                    {dateInfo.full} • {timeRange}
                  </p>
                </div>
              </div>

              {event.location && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '20px',
                    color: isFestivalStyle ? 'var(--text-dark)' : 'rgba(255, 255, 255, 0.8)',
                  }}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M10 10C11.3807 10 12.5 8.88071 12.5 7.5C12.5 6.11929 11.3807 5 10 5C8.61929 5 7.5 6.11929 7.5 7.5C7.5 8.88071 8.61929 10 10 10Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M10 18.3333C13.3333 13.3333 16.6667 10.1515 16.6667 7.5C16.6667 4.57143 14.4286 2.33333 11.5 2.33333C8.57143 2.33333 6.33333 4.57143 6.33333 7.5C6.33333 10.1515 9.66667 13.3333 13 18.3333"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                  </svg>
                  <span>{event.location}</span>
                </div>
              )}

              {event.description && (
                <p
                  style={{
                    color: isFestivalStyle ? 'var(--text-dark)' : 'rgba(255, 255, 255, 0.8)',
                    lineHeight: 1.6,
                    marginTop: '20px',
                  }}
                >
                  {event.description}
                </p>
              )}
            </div>
          </div>

          {/* Registration Form */}
          {submitSuccess ? (
            <div
              style={{
                background: isFestivalStyle
                  ? 'white'
                  : 'rgba(255, 255, 255, 0.03)',
                borderRadius: '24px',
                padding: '60px 40px',
                textAlign: 'center',
                border: isFestivalStyle
                  ? '1px solid rgba(0, 0, 0, 0.1)'
                  : '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <div
                style={{
                  fontSize: '3rem',
                  marginBottom: '20px',
                  color: isFestivalStyle ? 'var(--primary-purple)' : 'var(--glow-green)',
                }}
              >
                ✓
              </div>
              <h2
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 800,
                  marginBottom: '12px',
                  color: isFestivalStyle ? 'var(--text-dark)' : 'white',
                }}
              >
                Registration Successful!
              </h2>
              <p
                style={{
                  color: isFestivalStyle ? 'var(--text-muted)' : 'rgba(255, 255, 255, 0.7)',
                  marginBottom: telegramInviteLink ? '32px' : '0',
                }}
              >
                {telegramInviteLink
                  ? 'Join your event group on Telegram to connect with other attendees!'
                  : 'Your registration has been confirmed.'}
              </p>
              {telegramInviteLink ? (
                <a
                  href={telegramInviteLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-block',
                    padding: '16px 32px',
                    background: isFestivalStyle
                      ? 'linear-gradient(135deg, var(--primary-purple), var(--vivid-pink))'
                      : 'linear-gradient(135deg, var(--glow-purple), var(--glow-blue))',
                    color: 'white',
                    borderRadius: '12px',
                    textDecoration: 'none',
                    fontSize: '1rem',
                    fontWeight: 700,
                    transition: 'all 0.2s',
                    boxShadow: isFestivalStyle
                      ? '0 10px 25px rgba(236, 72, 153, 0.3)'
                      : '0 8px 20px rgba(139, 92, 246, 0.3)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = isFestivalStyle
                      ? '0 15px 35px rgba(236, 72, 153, 0.4)'
                      : '0 12px 28px rgba(139, 92, 246, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = isFestivalStyle
                      ? '0 10px 25px rgba(236, 72, 153, 0.3)'
                      : '0 8px 20px rgba(139, 92, 246, 0.3)';
                  }}
                >
                  Join Telegram Group
                </a>
              ) : (
                <div
                  style={{
                    marginTop: '24px',
                    padding: '12px 24px',
                    background: isFestivalStyle
                      ? 'rgba(124, 58, 237, 0.1)'
                      : 'rgba(139, 92, 246, 0.1)',
                    borderRadius: '8px',
                    color: isFestivalStyle ? 'var(--primary-purple)' : 'rgba(255, 255, 255, 0.8)',
                    fontSize: '0.9rem',
                  }}
                >
                  Telegram group link will be available soon.
                </div>
              )}
            </div>
          ) : (
            <div
              style={{
                background: isFestivalStyle
                  ? 'white'
                  : 'rgba(255, 255, 255, 0.03)',
                borderRadius: '24px',
                padding: '40px',
                border: isFestivalStyle
                  ? '1px solid rgba(0, 0, 0, 0.1)'
                  : '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: isFestivalStyle
                  ? '0 20px 40px rgba(124, 58, 237, 0.05)'
                  : '0 8px 32px rgba(0, 0, 0, 0.3)',
              }}
            >
              <h2
                style={{
                  fontSize: '1.75rem',
                  fontWeight: 800,
                  marginBottom: '32px',
                  color: isFestivalStyle ? 'var(--text-dark)' : 'white',
                }}
              >
                Register for Event
              </h2>

              {submitError && (
                <div
                  style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '12px',
                    padding: '16px',
                    marginBottom: '24px',
                    color: '#ef4444',
                  }}
                >
                  {submitError}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* Name Field */}
                <div style={{ marginBottom: '24px' }}>
                  <label
                    htmlFor="name"
                    style={{
                      display: 'block',
                      marginBottom: '8px',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      color: isFestivalStyle ? 'var(--text-dark)' : 'white',
                    }}
                  >
                    Name <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '14px 18px',
                      background: isFestivalStyle
                        ? 'rgba(0, 0, 0, 0.03)'
                        : 'rgba(255, 255, 255, 0.05)',
                      border: fieldErrors.name
                        ? '1px solid #ef4444'
                        : isFestivalStyle
                        ? '1px solid rgba(0, 0, 0, 0.1)'
                        : '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      color: isFestivalStyle ? 'var(--text-dark)' : 'white',
                      fontSize: '0.95rem',
                      outline: 'none',
                      transition: 'all 0.2s',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = isFestivalStyle
                        ? 'var(--primary-purple)'
                        : 'var(--glow-purple)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = fieldErrors.name
                        ? '#ef4444'
                        : isFestivalStyle
                        ? 'rgba(0, 0, 0, 0.1)'
                        : 'rgba(255, 255, 255, 0.1)';
                    }}
                    placeholder="Enter your name"
                    disabled={submitting}
                  />
                  {fieldErrors.name && (
                    <div
                      style={{
                        marginTop: '6px',
                        fontSize: '0.85rem',
                        color: '#ef4444',
                      }}
                    >
                      {fieldErrors.name}
                    </div>
                  )}
                </div>

                {/* Email Field */}
                <div style={{ marginBottom: '24px' }}>
                  <label
                    htmlFor="email"
                    style={{
                      display: 'block',
                      marginBottom: '8px',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      color: isFestivalStyle ? 'var(--text-dark)' : 'white',
                    }}
                  >
                    Email <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '14px 18px',
                      background: isFestivalStyle
                        ? 'rgba(0, 0, 0, 0.03)'
                        : 'rgba(255, 255, 255, 0.05)',
                      border: fieldErrors.email
                        ? '1px solid #ef4444'
                        : isFestivalStyle
                        ? '1px solid rgba(0, 0, 0, 0.1)'
                        : '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      color: isFestivalStyle ? 'var(--text-dark)' : 'white',
                      fontSize: '0.95rem',
                      outline: 'none',
                      transition: 'all 0.2s',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = isFestivalStyle
                        ? 'var(--primary-purple)'
                        : 'var(--glow-purple)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = fieldErrors.email
                        ? '#ef4444'
                        : isFestivalStyle
                        ? 'rgba(0, 0, 0, 0.1)'
                        : 'rgba(255, 255, 255, 0.1)';
                    }}
                    placeholder="you@example.com"
                    disabled={submitting}
                  />
                  {fieldErrors.email && (
                    <div
                      style={{
                        marginTop: '6px',
                        fontSize: '0.85rem',
                        color: '#ef4444',
                      }}
                    >
                      {fieldErrors.email}
                    </div>
                  )}
                </div>

                {/* Age Field */}
                <div style={{ marginBottom: '24px' }}>
                  <label
                    htmlFor="age"
                    style={{
                      display: 'block',
                      marginBottom: '8px',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      color: isFestivalStyle ? 'var(--text-dark)' : 'white',
                    }}
                  >
                    Age <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    id="age"
                    type="number"
                    min="1"
                    value={formData.age || ''}
                    onChange={(e) =>
                      handleInputChange('age', parseInt(e.target.value) || 0)
                    }
                    style={{
                      width: '100%',
                      padding: '14px 18px',
                      background: isFestivalStyle
                        ? 'rgba(0, 0, 0, 0.03)'
                        : 'rgba(255, 255, 255, 0.05)',
                      border: fieldErrors.age
                        ? '1px solid #ef4444'
                        : isFestivalStyle
                        ? '1px solid rgba(0, 0, 0, 0.1)'
                        : '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      color: isFestivalStyle ? 'var(--text-dark)' : 'white',
                      fontSize: '0.95rem',
                      outline: 'none',
                      transition: 'all 0.2s',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = isFestivalStyle
                        ? 'var(--primary-purple)'
                        : 'var(--glow-purple)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = fieldErrors.age
                        ? '#ef4444'
                        : isFestivalStyle
                        ? 'rgba(0, 0, 0, 0.1)'
                        : 'rgba(255, 255, 255, 0.1)';
                    }}
                    placeholder="Enter your age"
                    disabled={submitting}
                  />
                  {fieldErrors.age && (
                    <div
                      style={{
                        marginTop: '6px',
                        fontSize: '0.85rem',
                        color: '#ef4444',
                      }}
                    >
                      {fieldErrors.age}
                    </div>
                  )}
                </div>

                {/* Sex Field */}
                <div style={{ marginBottom: '24px' }}>
                  <label
                    htmlFor="sex"
                    style={{
                      display: 'block',
                      marginBottom: '8px',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      color: isFestivalStyle ? 'var(--text-dark)' : 'white',
                    }}
                  >
                    Sex <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <select
                    id="sex"
                    value={formData.sex}
                    onChange={(e) => handleInputChange('sex', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '14px 18px',
                      background: isFestivalStyle
                        ? 'rgba(0, 0, 0, 0.03)'
                        : 'rgba(255, 255, 255, 0.05)',
                      border: fieldErrors.sex
                        ? '1px solid #ef4444'
                        : isFestivalStyle
                        ? '1px solid rgba(0, 0, 0, 0.1)'
                        : '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      color: isFestivalStyle ? 'var(--text-dark)' : 'white',
                      fontSize: '0.95rem',
                      outline: 'none',
                      transition: 'all 0.2s',
                      cursor: 'pointer',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = isFestivalStyle
                        ? 'var(--primary-purple)'
                        : 'var(--glow-purple)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = fieldErrors.sex
                        ? '#ef4444'
                        : isFestivalStyle
                        ? 'rgba(0, 0, 0, 0.1)'
                        : 'rgba(255, 255, 255, 0.1)';
                    }}
                    disabled={submitting}
                  >
                    <option value="">Select sex</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer-not-to-say">Prefer not to say</option>
                  </select>
                  {fieldErrors.sex && (
                    <div
                      style={{
                        marginTop: '6px',
                        fontSize: '0.85rem',
                        color: '#ef4444',
                      }}
                    >
                      {fieldErrors.sex}
                    </div>
                  )}
                </div>

                {/* Languages Field */}
                <div style={{ marginBottom: '32px' }}>
                  <label
                    style={{
                      display: 'block',
                      marginBottom: '12px',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      color: isFestivalStyle ? 'var(--text-dark)' : 'white',
                    }}
                  >
                    Language(s) I speak <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '12px',
                    }}
                  >
                    {languages.map((language) => {
                      const isSelected = formData.languagesISpeak.includes(
                        language.code
                      );
                      return (
                        <button
                          key={language.id}
                          type="button"
                          onClick={() => toggleLanguage(language.code)}
                          disabled={submitting}
                          style={{
                            padding: '10px 20px',
                            borderRadius: '12px',
                            border: isSelected
                              ? isFestivalStyle
                                ? '2px solid var(--primary-purple)'
                                : '2px solid var(--glow-purple)'
                              : isFestivalStyle
                              ? '1px solid rgba(0, 0, 0, 0.1)'
                              : '1px solid rgba(255, 255, 255, 0.2)',
                            background: isSelected
                              ? isFestivalStyle
                                ? 'rgba(124, 58, 237, 0.1)'
                                : 'rgba(139, 92, 246, 0.2)'
                              : isFestivalStyle
                              ? 'rgba(0, 0, 0, 0.03)'
                              : 'rgba(255, 255, 255, 0.05)',
                            color: isSelected
                              ? isFestivalStyle
                                ? 'var(--primary-purple)'
                                : 'white'
                              : isFestivalStyle
                              ? 'var(--text-dark)'
                              : 'rgba(255, 255, 255, 0.8)',
                            fontWeight: isSelected ? 600 : 500,
                            fontSize: '0.9rem',
                            cursor: submitting ? 'not-allowed' : 'pointer',
                            transition: 'all 0.2s',
                            opacity: submitting ? 0.6 : 1,
                          }}
                          onMouseEnter={(e) => {
                            if (!submitting && !isSelected) {
                              e.currentTarget.style.background = isFestivalStyle
                                ? 'rgba(124, 58, 237, 0.05)'
                                : 'rgba(255, 255, 255, 0.1)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.background = isFestivalStyle
                                ? 'rgba(0, 0, 0, 0.03)'
                                : 'rgba(255, 255, 255, 0.05)';
                            }
                          }}
                        >
                          {language.name}
                        </button>
                      );
                    })}
                  </div>
                  {fieldErrors.languagesISpeak && (
                    <div
                      style={{
                        marginTop: '6px',
                        fontSize: '0.85rem',
                        color: '#ef4444',
                      }}
                    >
                      {fieldErrors.languagesISpeak}
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    width: '100%',
                    padding: '16px',
                    background: isFestivalStyle
                      ? 'linear-gradient(135deg, var(--primary-purple), var(--vivid-pink))'
                      : 'linear-gradient(135deg, var(--glow-purple), var(--glow-blue))',
                    color: 'white',
                    borderRadius: '12px',
                    fontSize: '1rem',
                    fontWeight: 700,
                    border: 'none',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                    opacity: submitting ? 0.7 : 1,
                    boxShadow: isFestivalStyle
                      ? '0 10px 25px rgba(236, 72, 153, 0.3)'
                      : '0 8px 20px rgba(139, 92, 246, 0.3)',
                  }}
                  onMouseEnter={(e) => {
                    if (!submitting) {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = isFestivalStyle
                        ? '0 15px 35px rgba(236, 72, 153, 0.4)'
                        : '0 12px 28px rgba(139, 92, 246, 0.4)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!submitting) {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = isFestivalStyle
                        ? '0 10px 25px rgba(236, 72, 153, 0.3)'
                        : '0 8px 20px rgba(139, 92, 246, 0.3)';
                    }
                  }}
                >
                  {submitting ? 'Submitting...' : 'Submit Registration'}
                </button>
              </form>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterContent />
    </Suspense>
  );
}

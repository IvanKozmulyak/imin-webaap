'use client';

import { useEffect, useState, Suspense, useCallback } from 'react';
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
    country: '',
    city: '',
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [telegramInviteLink, setTelegramInviteLink] = useState<string | null>(null);

  type CitySuggestion = {
    id: string;
    name: string;
    fullName: string;
    country: string;
  };

  const [citySuggestions, setCitySuggestions] = useState<CitySuggestion[]>([]);
  const [isCityLoading, setIsCityLoading] = useState(false);
  const [cityLookupError, setCityLookupError] = useState<string | null>(null);
  const [isGenderDropdownOpen, setIsGenderDropdownOpen] = useState(false);

  // Debug: Log state changes
  useEffect(() => {
    console.log('Submit success state:', submitSuccess);
    console.log('Telegram invite link state:', telegramInviteLink);
  }, [submitSuccess, telegramInviteLink]);

  // Close gender dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('[data-gender-dropdown]')) {
        setIsGenderDropdownOpen(false);
      }
    };

    if (isGenderDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isGenderDropdownOpen]);

  const fetchEventData = useCallback(async () => {
    if (!eventId) return;
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
  }, [eventId]);

  const fetchLanguages = useCallback(async () => {
    try {
      const response = await fetch('/api/languages');
      if (response.ok) {
        const data = await response.json();
        setLanguages(data);
      }
    } catch (error) {
      console.error('Error fetching languages:', error);
    }
  }, []);

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
  }, [eventId, fromEvents, fetchEventData, fetchLanguages]);

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

  // Mapbox-powered city autocomplete
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

  useEffect(() => {
    if (!formData.city || !mapboxToken) {
      setCitySuggestions([]);
      setIsCityLoading(false);
      setCityLookupError(null);
      return;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(async () => {
      try {
        setIsCityLoading(true);
        setCityLookupError(null);

        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          formData.city || ''
        )}.json?access_token=${mapboxToken}&autocomplete=true&types=place&limit=5`;

        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) {
          throw new Error(`Mapbox error: ${res.statusText}`);
        }

        const data = await res.json();
        const suggestions: CitySuggestion[] =
          (data.features || []).map((feature: any) => {
            const countryContext =
              (feature.context || []).find((c: any) =>
                typeof c.id === 'string' && c.id.startsWith('country.')
              ) || feature;

            const countryName =
              countryContext && typeof countryContext.text === 'string'
                ? countryContext.text
                : '';

            return {
              id: feature.id,
              name: feature.text,
              fullName: feature.place_name,
              country: countryName,
            };
          }) ?? [];

        setCitySuggestions(suggestions);
      } catch (error: any) {
        if (error.name === 'AbortError') return;
        console.error('Error fetching city suggestions from Mapbox:', error);
        setCityLookupError('Could not load city suggestions. You can type your city manually.');
      } finally {
        setIsCityLoading(false);
      }
    }, 300); // debounce

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [formData.city, mapboxToken]);

  const handleCitySelect = (suggestion: CitySuggestion) => {
    setFormData((prev) => ({
      ...prev,
      city: suggestion.name,
      country: suggestion.country || prev.country || '',
    }));
    setCitySuggestions([]);
    if (fieldErrors.city) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.city;
        return newErrors;
      });
    }
  };

  const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
    { value: 'prefer-not-to-say', label: 'Prefer not to say' },
  ];

  const handleGenderSelect = (value: string) => {
    handleInputChange('sex', value);
    setIsGenderDropdownOpen(false);
    if (fieldErrors.sex) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.sex;
        return newErrors;
      });
    }
  };

  const getGenderLabel = (value: string) => {
    return genderOptions.find(opt => opt.value === value)?.label || 'Select...';
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
                  ? '#FFFBF7'
                  : 'rgba(255, 255, 255, 0.03)',
                borderRadius: '32px',
                padding: '48px',
                paddingTop: '52px',
                border: isFestivalStyle
                  ? '1px solid rgba(124, 58, 237, 0.15)'
                  : '1px solid rgba(255, 255, 255, 0.12)',
                boxShadow: isFestivalStyle
                  ? '0 25px 50px rgba(124, 58, 237, 0.08), 0 0 0 1px rgba(124, 58, 237, 0.05)'
                  : '0 20px 60px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(139, 92, 246, 0.1)',
                backdropFilter: 'blur(20px)',
                position: 'relative',
                overflow: 'hidden',
                isolation: 'isolate',
              }}
            >
              {/* Decorative gradient overlay - fixed height */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  maxHeight: '4px',
                  background: isFestivalStyle
                    ? 'linear-gradient(90deg, var(--primary-purple), var(--vivid-pink), var(--sunset-orange))'
                    : 'linear-gradient(90deg, var(--glow-purple), var(--glow-blue), var(--glow-green))',
                  borderRadius: '32px 32px 0 0',
                  zIndex: 1,
                  pointerEvents: 'none',
                }}
              />
              
              {/* Form content wrapper */}
              <div style={{ position: 'relative', zIndex: 2 }}>
                <h2
                  style={{
                    fontSize: '2rem',
                    fontWeight: 800,
                    marginBottom: '8px',
                    marginTop: '0',
                    background: isFestivalStyle
                      ? 'linear-gradient(135deg, var(--primary-purple), var(--vivid-pink))'
                      : 'linear-gradient(135deg, var(--glow-purple), var(--glow-blue))',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    letterSpacing: '-0.02em',
                  }}
                >
                  Register for Event
                </h2>
              <p
                style={{
                  fontSize: '0.95rem',
                  color: isFestivalStyle ? 'var(--text-muted)' : 'rgba(255, 255, 255, 0.7)',
                  marginBottom: '40px',
                  fontWeight: 400,
                }}
              >
                Join the community and connect with fellow attendees
              </p>

              {submitError && (
                <div
                  style={{
                    background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.12), rgba(220, 38, 38, 0.08))',
                    border: '2px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '16px',
                    padding: '16px 20px',
                    marginBottom: '28px',
                    color: '#ef4444',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.15)',
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span style={{ fontWeight: 600 }}>{submitError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* Name Field */}
                <div style={{ marginBottom: '28px', position: 'relative' }}>
                  <label
                    htmlFor="name"
                    style={{
                      display: 'block',
                      marginBottom: '10px',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: isFestivalStyle ? 'var(--text-dark)' : 'rgba(255, 255, 255, 0.95)',
                      letterSpacing: '0.01em',
                    }}
                  >
                    Full Name <span style={{ color: '#ef4444', marginLeft: '2px' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '16px 20px 16px 48px',
                        background: isFestivalStyle
                          ? 'rgba(0, 0, 0, 0.02)'
                          : 'rgba(255, 255, 255, 0.06)',
                        border: fieldErrors.name
                          ? '2px solid #ef4444'
                          : isFestivalStyle
                          ? '2px solid rgba(124, 58, 237, 0.15)'
                          : '2px solid rgba(255, 255, 255, 0.12)',
                        borderRadius: '16px',
                        color: isFestivalStyle ? 'var(--text-dark)' : 'white',
                        fontSize: '0.95rem',
                        outline: 'none',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        boxShadow: fieldErrors.name
                          ? '0 0 0 4px rgba(239, 68, 68, 0.1)'
                          : '0 2px 8px rgba(0, 0, 0, 0.05)',
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = isFestivalStyle
                          ? 'var(--primary-purple)'
                          : 'var(--glow-purple)';
                        e.currentTarget.style.boxShadow = isFestivalStyle
                          ? '0 0 0 4px rgba(124, 58, 237, 0.15), 0 4px 12px rgba(124, 58, 237, 0.2)'
                          : '0 0 0 4px rgba(139, 92, 246, 0.2), 0 4px 12px rgba(139, 92, 246, 0.3)';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = fieldErrors.name
                          ? '#ef4444'
                          : isFestivalStyle
                          ? 'rgba(124, 58, 237, 0.15)'
                          : 'rgba(255, 255, 255, 0.12)';
                        e.currentTarget.style.boxShadow = fieldErrors.name
                          ? '0 0 0 4px rgba(239, 68, 68, 0.1)'
                          : '0 2px 8px rgba(0, 0, 0, 0.05)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                      placeholder="John Doe"
                      disabled={submitting}
                    />
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      style={{
                        position: 'absolute',
                        left: '16px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: isFestivalStyle ? 'var(--primary-purple)' : 'rgba(139, 92, 246, 0.6)',
                        pointerEvents: 'none',
                      }}
                    >
                      <path
                        d="M10 9C11.6569 9 13 7.65685 13 6C13 4.34315 11.6569 3 10 3C8.34315 3 7 4.34315 7 6C7 7.65685 8.34315 9 10 9Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        fill="none"
                      />
                      <path
                        d="M3 17C3 13.6863 5.68629 11 9 11H11C14.3137 11 17 13.6863 17 17"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        fill="none"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                  {fieldErrors.name && (
                    <div
                      style={{
                        marginTop: '8px',
                        fontSize: '0.85rem',
                        color: '#ef4444',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {fieldErrors.name}
                    </div>
                  )}
                </div>

                {/* Email Field */}
                <div style={{ marginBottom: '28px', position: 'relative' }}>
                  <label
                    htmlFor="email"
                    style={{
                      display: 'block',
                      marginBottom: '10px',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: isFestivalStyle ? 'var(--text-dark)' : 'rgba(255, 255, 255, 0.95)',
                      letterSpacing: '0.01em',
                    }}
                  >
                    Email Address <span style={{ color: '#ef4444', marginLeft: '2px' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '16px 20px 16px 48px',
                        background: isFestivalStyle
                          ? 'rgba(0, 0, 0, 0.02)'
                          : 'rgba(255, 255, 255, 0.06)',
                        border: fieldErrors.email
                          ? '2px solid #ef4444'
                          : isFestivalStyle
                          ? '2px solid rgba(124, 58, 237, 0.15)'
                          : '2px solid rgba(255, 255, 255, 0.12)',
                        borderRadius: '16px',
                        color: isFestivalStyle ? 'var(--text-dark)' : 'white',
                        fontSize: '0.95rem',
                        outline: 'none',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        boxShadow: fieldErrors.email
                          ? '0 0 0 4px rgba(239, 68, 68, 0.1)'
                          : '0 2px 8px rgba(0, 0, 0, 0.05)',
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = isFestivalStyle
                          ? 'var(--primary-purple)'
                          : 'var(--glow-purple)';
                        e.currentTarget.style.boxShadow = isFestivalStyle
                          ? '0 0 0 4px rgba(124, 58, 237, 0.15), 0 4px 12px rgba(124, 58, 237, 0.2)'
                          : '0 0 0 4px rgba(139, 92, 246, 0.2), 0 4px 12px rgba(139, 92, 246, 0.3)';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = fieldErrors.email
                          ? '#ef4444'
                          : isFestivalStyle
                          ? 'rgba(124, 58, 237, 0.15)'
                          : 'rgba(255, 255, 255, 0.12)';
                        e.currentTarget.style.boxShadow = fieldErrors.email
                          ? '0 0 0 4px rgba(239, 68, 68, 0.1)'
                          : '0 2px 8px rgba(0, 0, 0, 0.05)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                      placeholder="you@example.com"
                      disabled={submitting}
                    />
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      style={{
                        position: 'absolute',
                        left: '16px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: isFestivalStyle ? 'var(--primary-purple)' : 'rgba(139, 92, 246, 0.6)',
                        pointerEvents: 'none',
                      }}
                    >
                      <path
                        d="M2.5 6.25L10 1.25L17.5 6.25V15.8333C17.5 16.2754 17.3244 16.6993 17.0118 17.0118C16.6993 17.3244 16.2754 17.5 15.8333 17.5H4.16667C3.72464 17.5 3.30072 17.3244 2.98816 17.0118C2.67559 16.6993 2.5 16.2754 2.5 15.8333V6.25Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M7.5 17.5V10H12.5V17.5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  {fieldErrors.email && (
                    <div
                      style={{
                        marginTop: '8px',
                        fontSize: '0.85rem',
                        color: '#ef4444',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {fieldErrors.email}
                    </div>
                  )}
                </div>

                {/* Age and Sex in a row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '28px' }}>
                  {/* Age Field */}
                  <div style={{ position: 'relative' }}>
                    <label
                      htmlFor="age"
                      style={{
                        display: 'block',
                        marginBottom: '10px',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        color: isFestivalStyle ? 'var(--text-dark)' : 'rgba(255, 255, 255, 0.95)',
                        letterSpacing: '0.01em',
                      }}
                    >
                      Age <span style={{ color: '#ef4444', marginLeft: '2px' }}>*</span>
                    </label>
                    <div style={{ position: 'relative' }}>
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
                          padding: '16px 20px 16px 48px',
                          background: isFestivalStyle
                            ? 'rgba(0, 0, 0, 0.02)'
                            : 'rgba(255, 255, 255, 0.06)',
                          border: fieldErrors.age
                            ? '2px solid #ef4444'
                            : isFestivalStyle
                            ? '2px solid rgba(124, 58, 237, 0.15)'
                            : '2px solid rgba(255, 255, 255, 0.12)',
                          borderRadius: '16px',
                          color: isFestivalStyle ? 'var(--text-dark)' : 'white',
                          fontSize: '0.95rem',
                          outline: 'none',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          boxShadow: fieldErrors.age
                            ? '0 0 0 4px rgba(239, 68, 68, 0.1)'
                            : '0 2px 8px rgba(0, 0, 0, 0.05)',
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = isFestivalStyle
                            ? 'var(--primary-purple)'
                            : 'var(--glow-purple)';
                          e.currentTarget.style.boxShadow = isFestivalStyle
                            ? '0 0 0 4px rgba(124, 58, 237, 0.15), 0 4px 12px rgba(124, 58, 237, 0.2)'
                            : '0 0 0 4px rgba(139, 92, 246, 0.2), 0 4px 12px rgba(139, 92, 246, 0.3)';
                          e.currentTarget.style.transform = 'translateY(-1px)';
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = fieldErrors.age
                            ? '#ef4444'
                            : isFestivalStyle
                            ? 'rgba(124, 58, 237, 0.15)'
                            : 'rgba(255, 255, 255, 0.12)';
                          e.currentTarget.style.boxShadow = fieldErrors.age
                            ? '0 0 0 4px rgba(239, 68, 68, 0.1)'
                            : '0 2px 8px rgba(0, 0, 0, 0.05)';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }}
                        placeholder="25"
                        disabled={submitting}
                      />
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        style={{
                          position: 'absolute',
                          left: '16px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: isFestivalStyle ? 'var(--primary-purple)' : 'rgba(139, 92, 246, 0.6)',
                          pointerEvents: 'none',
                        }}
                      >
                        <path
                          d="M10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2ZM10 16C6.68629 16 4 13.3137 4 10C4 6.68629 6.68629 4 10 4C13.3137 4 16 6.68629 16 10C16 13.3137 13.3137 16 10 16Z"
                          fill="currentColor"
                        />
                        <path
                          d="M10 6V10L13 13"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                    {fieldErrors.age && (
                      <div
                        style={{
                          marginTop: '8px',
                          fontSize: '0.85rem',
                          color: '#ef4444',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {fieldErrors.age}
                      </div>
                    )}
                  </div>

                  {/* Gender Field - Custom Dropdown */}
                  <div style={{ position: 'relative' }} data-gender-dropdown>
                    <label
                      htmlFor="sex"
                      style={{
                        display: 'block',
                        marginBottom: '10px',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        color: isFestivalStyle ? 'var(--text-dark)' : 'rgba(255, 255, 255, 0.95)',
                        letterSpacing: '0.01em',
                      }}
                    >
                      Gender <span style={{ color: '#ef4444', marginLeft: '2px' }}>*</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <button
                        type="button"
                        onClick={() => !submitting && setIsGenderDropdownOpen(!isGenderDropdownOpen)}
                        disabled={submitting}
                        style={{
                          width: '100%',
                          padding: '16px 20px 16px 48px',
                          background: isFestivalStyle
                            ? 'rgba(0, 0, 0, 0.02)'
                            : 'rgba(255, 255, 255, 0.06)',
                          border: fieldErrors.sex
                            ? '2px solid #ef4444'
                            : isGenderDropdownOpen
                            ? isFestivalStyle
                              ? '2px solid var(--primary-purple)'
                              : '2px solid var(--glow-purple)'
                            : isFestivalStyle
                            ? '2px solid rgba(124, 58, 237, 0.15)'
                            : '2px solid rgba(255, 255, 255, 0.12)',
                          borderRadius: '16px',
                          color: formData.sex
                            ? (isFestivalStyle ? 'var(--text-dark)' : 'white')
                            : (isFestivalStyle ? 'var(--text-muted)' : 'rgba(255, 255, 255, 0.6)'),
                          fontSize: '0.95rem',
                          outline: 'none',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          cursor: submitting ? 'not-allowed' : 'pointer',
                          boxShadow: fieldErrors.sex
                            ? '0 0 0 4px rgba(239, 68, 68, 0.1)'
                            : isGenderDropdownOpen
                            ? isFestivalStyle
                              ? '0 0 0 4px rgba(124, 58, 237, 0.15), 0 4px 12px rgba(124, 58, 237, 0.2)'
                              : '0 0 0 4px rgba(139, 92, 246, 0.2), 0 4px 12px rgba(139, 92, 246, 0.3)'
                            : '0 2px 8px rgba(0, 0, 0, 0.05)',
                          textAlign: 'left',
                          transform: isGenderDropdownOpen ? 'translateY(-1px)' : 'translateY(0)',
                        }}
                        onMouseEnter={(e) => {
                          if (!submitting && !isGenderDropdownOpen) {
                            e.currentTarget.style.borderColor = isFestivalStyle
                              ? 'var(--primary-purple)'
                              : 'var(--glow-purple)';
                            e.currentTarget.style.boxShadow = isFestivalStyle
                              ? '0 0 0 4px rgba(124, 58, 237, 0.1), 0 4px 12px rgba(124, 58, 237, 0.15)'
                              : '0 0 0 4px rgba(139, 92, 246, 0.15), 0 4px 12px rgba(139, 92, 246, 0.2)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isGenderDropdownOpen) {
                            e.currentTarget.style.borderColor = fieldErrors.sex
                              ? '#ef4444'
                              : isFestivalStyle
                              ? 'rgba(124, 58, 237, 0.15)'
                              : 'rgba(255, 255, 255, 0.12)';
                            e.currentTarget.style.boxShadow = fieldErrors.sex
                              ? '0 0 0 4px rgba(239, 68, 68, 0.1)'
                              : '0 2px 8px rgba(0, 0, 0, 0.05)';
                          }
                        }}
                      >
                        {getGenderLabel(formData.sex)}
                      </button>
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        style={{
                          position: 'absolute',
                          left: '16px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: isFestivalStyle ? 'var(--primary-purple)' : 'rgba(139, 92, 246, 0.6)',
                          pointerEvents: 'none',
                        }}
                      >
                        <path
                          d="M10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2Z"
                          fill="currentColor"
                          fillOpacity="0.1"
                        />
                        <path
                          d="M10 6C8.34315 6 7 7.34315 7 9C7 10.6569 8.34315 12 10 12C11.6569 12 13 10.6569 13 9C13 7.34315 11.6569 6 10 6Z"
                          fill="currentColor"
                        />
                      </svg>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 20 20"
                        fill="none"
                        style={{
                          position: 'absolute',
                          right: '16px',
                          top: '50%',
                          transform: `translateY(-50%) rotate(${isGenderDropdownOpen ? '180deg' : '0deg'})`,
                          color: isFestivalStyle ? 'var(--text-muted)' : 'rgba(255, 255, 255, 0.6)',
                          pointerEvents: 'none',
                          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        }}
                      >
                        <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>

                      {/* Dropdown Menu */}
                      {isGenderDropdownOpen && (
                        <div
                          style={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            right: 0,
                            marginTop: '8px',
                            background: isFestivalStyle
                              ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 251, 247, 0.98) 100%)'
                              : 'linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.98) 100%)',
                            backdropFilter: 'blur(20px)',
                            borderRadius: '16px',
                            border: isFestivalStyle
                              ? '1px solid rgba(124, 58, 237, 0.2)'
                              : '1px solid rgba(139, 92, 246, 0.3)',
                            boxShadow: isFestivalStyle
                              ? '0 20px 50px rgba(15, 23, 42, 0.15), 0 0 0 1px rgba(124, 58, 237, 0.1)'
                              : '0 25px 60px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(139, 92, 246, 0.2)',
                            zIndex: 30,
                            overflow: 'hidden',
                            animation: 'fadeInDown 0.2s ease-out',
                          }}
                        >
                          {genderOptions.map((option, index) => {
                            const isSelected = formData.sex === option.value;
                            return (
                              <button
                                key={option.value}
                                type="button"
                                onClick={() => handleGenderSelect(option.value)}
                                style={{
                                  width: '100%',
                                  textAlign: 'left',
                                  padding: '14px 18px',
                                  background: isSelected
                                    ? isFestivalStyle
                                      ? 'linear-gradient(90deg, rgba(124, 58, 237, 0.15), rgba(236, 72, 153, 0.1))'
                                      : 'linear-gradient(90deg, rgba(139, 92, 246, 0.25), rgba(59, 130, 246, 0.15))'
                                    : 'transparent',
                                  border: 'none',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s',
                                  borderTop: index > 0
                                    ? isFestivalStyle
                                      ? '1px solid rgba(124, 58, 237, 0.1)'
                                      : '1px solid rgba(139, 92, 246, 0.15)'
                                    : 'none',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                }}
                                onMouseEnter={(e) => {
                                  if (!isSelected) {
                                    e.currentTarget.style.background = isFestivalStyle
                                      ? 'linear-gradient(90deg, rgba(124, 58, 237, 0.1), rgba(236, 72, 153, 0.05))'
                                      : 'linear-gradient(90deg, rgba(139, 92, 246, 0.2), rgba(59, 130, 246, 0.1))';
                                    e.currentTarget.style.transform = 'translateX(4px)';
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (!isSelected) {
                                    e.currentTarget.style.background = 'transparent';
                                    e.currentTarget.style.transform = 'translateX(0)';
                                  }
                                }}
                              >
                                <span
                                  style={{
                                    fontSize: '0.95rem',
                                    fontWeight: isSelected ? 600 : 500,
                                    color: isSelected
                                      ? (isFestivalStyle ? 'var(--primary-purple)' : 'white')
                                      : (isFestivalStyle ? 'var(--text-dark)' : 'rgba(255, 255, 255, 0.9)'),
                                  }}
                                >
                                  {option.label}
                                </span>
                                {isSelected && (
                                  <svg
                                    width="18"
                                    height="18"
                                    viewBox="0 0 20 20"
                                    fill="none"
                                    style={{
                                      color: isFestivalStyle ? 'var(--primary-purple)' : 'var(--glow-purple)',
                                    }}
                                  >
                                    <path
                                      d="M16.7071 5.29289C17.0976 5.68342 17.0976 6.31658 16.7071 6.70711L8.70711 14.7071C8.31658 15.0976 7.68342 15.0976 7.29289 14.7071L3.29289 10.7071C2.90237 10.3166 2.90237 9.68342 3.29289 9.29289C3.68342 8.90237 4.31658 8.90237 4.70711 9.29289L8 12.5858L15.2929 5.29289C15.6834 4.90237 16.3166 4.90237 16.7071 5.29289Z"
                                      fill="currentColor"
                                    />
                                  </svg>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    {fieldErrors.sex && (
                      <div
                        style={{
                          marginTop: '8px',
                          fontSize: '0.85rem',
                          color: '#ef4444',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {fieldErrors.sex}
                      </div>
                    )}
                  </div>
                </div>

                {/* Location (Country & City with Mapbox autocomplete) */}
                <div style={{ marginBottom: '32px' }}>
                  <label
                    style={{
                      display: 'block',
                      marginBottom: '12px',
                      fontSize: '0.95rem',
                      fontWeight: 700,
                      color: isFestivalStyle ? 'var(--text-dark)' : 'rgba(255, 255, 255, 0.95)',
                      letterSpacing: '0.01em',
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                        <path
                          d="M10 10C11.3807 10 12.5 8.88071 12.5 7.5C12.5 6.11929 11.3807 5 10 5C8.61929 5 7.5 6.11929 7.5 7.5C7.5 8.88071 8.61929 10 10 10Z"
                          stroke={isFestivalStyle ? 'var(--primary-purple)' : 'var(--glow-purple)'}
                          strokeWidth="1.5"
                        />
                        <path
                          d="M10 18.3333C13.3333 13.3333 16.6667 10.1515 16.6667 7.5C16.6667 4.57143 14.4286 2.33333 11.5 2.33333C8.57143 2.33333 6.33333 4.57143 6.33333 7.5C6.33333 10.1515 9.66667 13.3333 13 18.3333"
                          stroke={isFestivalStyle ? 'var(--primary-purple)' : 'var(--glow-purple)'}
                          strokeWidth="1.5"
                        />
                      </svg>
                      Where are you coming from?
                    </span>
                  </label>

                  {/* City Field with suggestions */}
                  <div style={{ marginBottom: '16px', position: 'relative' }}>
                    <label
                      htmlFor="city"
                      style={{
                        display: 'block',
                        marginBottom: '10px',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        color: isFestivalStyle ? 'var(--text-dark)' : 'rgba(255, 255, 255, 0.95)',
                        letterSpacing: '0.01em',
                      }}
                    >
                      City
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        id="city"
                        type="text"
                        value={formData.city || ''}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '16px 20px 16px 48px',
                          background: isFestivalStyle
                            ? 'rgba(0, 0, 0, 0.02)'
                            : 'rgba(255, 255, 255, 0.06)',
                          border: fieldErrors.city
                            ? '2px solid #ef4444'
                            : isFestivalStyle
                            ? '2px solid rgba(124, 58, 237, 0.15)'
                            : '2px solid rgba(255, 255, 255, 0.12)',
                          borderRadius: '16px',
                          color: isFestivalStyle ? 'var(--text-dark)' : 'white',
                          fontSize: '0.95rem',
                          outline: 'none',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          boxShadow: fieldErrors.city
                            ? '0 0 0 4px rgba(239, 68, 68, 0.1)'
                            : '0 2px 8px rgba(0, 0, 0, 0.05)',
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = isFestivalStyle
                            ? 'var(--primary-purple)'
                            : 'var(--glow-purple)';
                          e.currentTarget.style.boxShadow = isFestivalStyle
                            ? '0 0 0 4px rgba(124, 58, 237, 0.15), 0 4px 12px rgba(124, 58, 237, 0.2)'
                            : '0 0 0 4px rgba(139, 92, 246, 0.2), 0 4px 12px rgba(139, 92, 246, 0.3)';
                          e.currentTarget.style.transform = 'translateY(-1px)';
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = fieldErrors.city
                            ? '#ef4444'
                            : isFestivalStyle
                            ? 'rgba(124, 58, 237, 0.15)'
                            : 'rgba(255, 255, 255, 0.12)';
                          e.currentTarget.style.boxShadow = fieldErrors.city
                            ? '0 0 0 4px rgba(239, 68, 68, 0.1)'
                            : '0 2px 8px rgba(0, 0, 0, 0.05)';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }}
                        placeholder={
                          mapboxToken
                            ? 'Start typing your city...'
                            : 'Enter your city'
                        }
                        disabled={submitting}
                        autoComplete="off"
                      />
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        style={{
                          position: 'absolute',
                          left: '16px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: isFestivalStyle ? 'var(--primary-purple)' : 'rgba(139, 92, 246, 0.6)',
                          pointerEvents: 'none',
                        }}
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
                    </div>
                    {mapboxToken && (isCityLoading || citySuggestions.length > 0) && (
                      <div
                        style={{
                          position: 'absolute',
                          top: '100%',
                          left: 0,
                          right: 0,
                          marginTop: '8px',
                          background: isFestivalStyle
                            ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 251, 247, 0.98) 100%)'
                            : 'linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.98) 100%)',
                          backdropFilter: 'blur(20px)',
                          borderRadius: '16px',
                          border: isFestivalStyle
                            ? '1px solid rgba(124, 58, 237, 0.2)'
                            : '1px solid rgba(139, 92, 246, 0.3)',
                          boxShadow: isFestivalStyle
                            ? '0 20px 50px rgba(15, 23, 42, 0.15), 0 0 0 1px rgba(124, 58, 237, 0.1)'
                            : '0 25px 60px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(139, 92, 246, 0.2)',
                          zIndex: 20,
                          maxHeight: '240px',
                          overflowY: 'auto',
                        }}
                      >
                        {isCityLoading && (
                          <div
                            style={{
                              padding: '10px 14px',
                              fontSize: '0.85rem',
                              color: isFestivalStyle
                                ? 'var(--text-muted)'
                                : 'rgba(148, 163, 184, 0.9)',
                            }}
                          >
                            Searching cities...
                          </div>
                        )}
                        {!isCityLoading &&
                          citySuggestions.map((suggestion) => (
                            <button
                              key={suggestion.id}
                              type="button"
                              onClick={() => handleCitySelect(suggestion)}
                              style={{
                                width: '100%',
                                textAlign: 'left',
                                padding: '14px 18px',
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                borderRadius: '0',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = isFestivalStyle
                                  ? 'linear-gradient(90deg, rgba(124, 58, 237, 0.08), rgba(236, 72, 153, 0.05))'
                                  : 'linear-gradient(90deg, rgba(139, 92, 246, 0.2), rgba(59, 130, 246, 0.15))';
                                e.currentTarget.style.transform = 'translateX(4px)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.transform = 'translateX(0)';
                              }}
                            >
                              <div
                                style={{
                                  fontSize: '0.95rem',
                                  fontWeight: 600,
                                  color: isFestivalStyle ? 'var(--text-dark)' : 'white',
                                  marginBottom: '4px',
                                }}
                              >
                                {suggestion.name}
                              </div>
                              <div
                                style={{
                                  fontSize: '0.8rem',
                                  color: isFestivalStyle
                                    ? 'var(--text-muted)'
                                    : 'rgba(148, 163, 184, 0.85)',
                                }}
                              >
                                {suggestion.fullName}
                              </div>
                            </button>
                          ))}
                      </div>
                    )}
                    {cityLookupError && (
                      <div
                        style={{
                          marginTop: '6px',
                          fontSize: '0.8rem',
                          color: isFestivalStyle ? '#b91c1c' : '#fecaca',
                        }}
                      >
                        {cityLookupError}
                      </div>
                    )}
                    {fieldErrors.city && (
                      <div
                        style={{
                          marginTop: '6px',
                          fontSize: '0.85rem',
                          color: '#ef4444',
                        }}
                      >
                        {fieldErrors.city}
                      </div>
                    )}
                  </div>

                  {/* Country Field (auto-filled when selecting a city, but still editable) */}
                  <div>
                    <label
                      htmlFor="country"
                      style={{
                        display: 'block',
                        marginBottom: '10px',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        color: isFestivalStyle ? 'var(--text-dark)' : 'rgba(255, 255, 255, 0.95)',
                        letterSpacing: '0.01em',
                      }}
                    >
                      Country
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        id="country"
                        type="text"
                        value={formData.country || ''}
                        onChange={(e) => handleInputChange('country', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '16px 20px 16px 48px',
                          background: isFestivalStyle
                            ? 'rgba(0, 0, 0, 0.02)'
                            : 'rgba(255, 255, 255, 0.06)',
                          border: fieldErrors.country
                            ? '2px solid #ef4444'
                            : isFestivalStyle
                            ? '2px solid rgba(124, 58, 237, 0.15)'
                            : '2px solid rgba(255, 255, 255, 0.12)',
                          borderRadius: '16px',
                          color: isFestivalStyle ? 'var(--text-dark)' : 'white',
                          fontSize: '0.95rem',
                          outline: 'none',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          boxShadow: fieldErrors.country
                            ? '0 0 0 4px rgba(239, 68, 68, 0.1)'
                            : '0 2px 8px rgba(0, 0, 0, 0.05)',
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = isFestivalStyle
                            ? 'var(--primary-purple)'
                            : 'var(--glow-purple)';
                          e.currentTarget.style.boxShadow = isFestivalStyle
                            ? '0 0 0 4px rgba(124, 58, 237, 0.15), 0 4px 12px rgba(124, 58, 237, 0.2)'
                            : '0 0 0 4px rgba(139, 92, 246, 0.2), 0 4px 12px rgba(139, 92, 246, 0.3)';
                          e.currentTarget.style.transform = 'translateY(-1px)';
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = fieldErrors.country
                            ? '#ef4444'
                            : isFestivalStyle
                            ? 'rgba(124, 58, 237, 0.15)'
                            : 'rgba(255, 255, 255, 0.12)';
                          e.currentTarget.style.boxShadow = fieldErrors.country
                            ? '0 0 0 4px rgba(239, 68, 68, 0.1)'
                            : '0 2px 8px rgba(0, 0, 0, 0.05)';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }}
                        placeholder="Enter your country"
                        disabled={submitting}
                      />
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        style={{
                          position: 'absolute',
                          left: '16px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: isFestivalStyle ? 'var(--primary-purple)' : 'rgba(139, 92, 246, 0.6)',
                          pointerEvents: 'none',
                        }}
                      >
                        <rect x="2" y="4" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
                        <path d="M2 8H18" stroke="currentColor" strokeWidth="1.5" />
                        <circle cx="6" cy="10" r="1" fill="currentColor" />
                        <circle cx="10" cy="10" r="1" fill="currentColor" />
                        <circle cx="14" cy="10" r="1" fill="currentColor" />
                      </svg>
                    </div>
                    {fieldErrors.country && (
                      <div
                        style={{
                          marginTop: '8px',
                          fontSize: '0.85rem',
                          color: '#ef4444',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {fieldErrors.country}
                      </div>
                    )}
                  </div>
                </div>

                {/* Languages Field */}
                <div style={{ marginBottom: '36px' }}>
                  <label
                    style={{
                      display: 'block',
                      marginBottom: '14px',
                      fontSize: '0.95rem',
                      fontWeight: 700,
                      color: isFestivalStyle ? 'var(--text-dark)' : 'rgba(255, 255, 255, 0.95)',
                      letterSpacing: '0.01em',
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                        <path
                          d="M10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2Z"
                          stroke={isFestivalStyle ? 'var(--primary-purple)' : 'var(--glow-purple)'}
                          strokeWidth="1.5"
                        />
                        <path
                          d="M6 10L9 13L14 7"
                          stroke={isFestivalStyle ? 'var(--primary-purple)' : 'var(--glow-purple)'}
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      Language(s) I speak <span style={{ color: '#ef4444', marginLeft: '2px' }}>*</span>
                    </span>
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
                            padding: '12px 24px',
                            borderRadius: '14px',
                            border: isSelected
                              ? isFestivalStyle
                                ? '2px solid var(--primary-purple)'
                                : '2px solid var(--glow-purple)'
                              : isFestivalStyle
                              ? '2px solid rgba(124, 58, 237, 0.2)'
                              : '2px solid rgba(255, 255, 255, 0.15)',
                            background: isSelected
                              ? isFestivalStyle
                                ? 'linear-gradient(135deg, rgba(124, 58, 237, 0.15), rgba(236, 72, 153, 0.1))'
                                : 'linear-gradient(135deg, rgba(139, 92, 246, 0.25), rgba(59, 130, 246, 0.15))'
                              : isFestivalStyle
                              ? 'rgba(0, 0, 0, 0.02)'
                              : 'rgba(255, 255, 255, 0.06)',
                            color: isSelected
                              ? isFestivalStyle
                                ? 'var(--primary-purple)'
                                : 'white'
                              : isFestivalStyle
                              ? 'var(--text-dark)'
                              : 'rgba(255, 255, 255, 0.85)',
                            fontWeight: isSelected ? 700 : 600,
                            fontSize: '0.9rem',
                            cursor: submitting ? 'not-allowed' : 'pointer',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            opacity: submitting ? 0.6 : 1,
                            boxShadow: isSelected
                              ? isFestivalStyle
                                ? '0 4px 12px rgba(124, 58, 237, 0.2)'
                                : '0 4px 12px rgba(139, 92, 246, 0.3)'
                              : '0 2px 6px rgba(0, 0, 0, 0.05)',
                            transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                          }}
                          onMouseEnter={(e) => {
                            if (!submitting && !isSelected) {
                              e.currentTarget.style.background = isFestivalStyle
                                ? 'rgba(124, 58, 237, 0.08)'
                                : 'rgba(255, 255, 255, 0.1)';
                              e.currentTarget.style.transform = 'scale(1.05)';
                              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.background = isFestivalStyle
                                ? 'rgba(0, 0, 0, 0.02)'
                                : 'rgba(255, 255, 255, 0.06)';
                              e.currentTarget.style.transform = 'scale(1)';
                              e.currentTarget.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.05)';
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
                    padding: '18px 32px',
                    background: isFestivalStyle
                      ? 'linear-gradient(135deg, var(--primary-purple) 0%, var(--vivid-pink) 50%, var(--sunset-orange) 100%)'
                      : 'linear-gradient(135deg, var(--glow-purple) 0%, var(--glow-blue) 50%, var(--glow-green) 100%)',
                    backgroundSize: '200% 200%',
                    color: 'white',
                    borderRadius: '18px',
                    fontSize: '1.05rem',
                    fontWeight: 800,
                    border: 'none',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    opacity: submitting ? 0.7 : 1,
                    boxShadow: isFestivalStyle
                      ? '0 12px 32px rgba(236, 72, 153, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.1) inset'
                      : '0 12px 32px rgba(139, 92, 246, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1) inset',
                    position: 'relative',
                    overflow: 'hidden',
                    letterSpacing: '0.02em',
                  }}
                  onMouseEnter={(e) => {
                    if (!submitting) {
                      e.currentTarget.style.transform = 'translateY(-3px) scale(1.01)';
                      e.currentTarget.style.boxShadow = isFestivalStyle
                        ? '0 20px 45px rgba(236, 72, 153, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.15) inset'
                        : '0 20px 45px rgba(139, 92, 246, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.15) inset';
                      e.currentTarget.style.backgroundPosition = '100% 0';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!submitting) {
                      e.currentTarget.style.transform = 'translateY(0) scale(1)';
                      e.currentTarget.style.boxShadow = isFestivalStyle
                        ? '0 12px 32px rgba(236, 72, 153, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.1) inset'
                        : '0 12px 32px rgba(139, 92, 246, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1) inset';
                      e.currentTarget.style.backgroundPosition = '0% 0';
                    }
                  }}
                >
                  <span style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                    {submitting ? (
                      <>
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="none"
                          style={{ animation: 'spin 1s linear infinite' }}
                        >
                          <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2" strokeDasharray="32" strokeDashoffset="24" opacity="0.3" />
                          <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2" strokeDasharray="32" strokeDashoffset="24" strokeLinecap="round" />
                        </svg>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <span>Submit Registration</span>
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                          <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </>
                    )}
                  </span>
                  {/* Shine effect */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: '-100%',
                      width: '100%',
                      height: '100%',
                      background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
                      transition: 'left 0.5s',
                    }}
                    onMouseEnter={(e) => {
                      if (!submitting) {
                        e.currentTarget.style.left = '100%';
                      }
                    }}
                  />
                </button>
              </form>
              </div>
              {/* End form content wrapper */}
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

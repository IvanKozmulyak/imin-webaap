'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { EventDto } from '@/lib/types/event';

type ViewMode = 'grid' | 'map';

function EventsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const style = searchParams?.get('style');
  const isFestivalStyle = style === 'festival';

  const [events, setEvents] = useState<EventDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [filteredEvents, setFilteredEvents] = useState<EventDto[]>([]);

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    // Filter events based on search
    const filtered = events.filter(event =>
      event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredEvents(filtered);
  }, [events, searchQuery]);

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

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events/upcoming');
      if (response.ok) {
        const data = await response.json();
        // The API returns events array directly, not wrapped in data property
        const eventsArray = Array.isArray(data) ? data : [];
        setEvents(eventsArray);
        console.log('Fetched events:', eventsArray.length);
      } else {
        console.error('Failed to fetch events:', response.status, response.statusText);
        const errorData = await response.json().catch(() => ({}));
        console.error('Error details:', errorData);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    if (isFestivalStyle) {
      router.push('/events');
    } else {
      router.push('/events?style=festival');
    }
  };

  const formatDate = (fromDateTime: string) => {
    const date = new Date(fromDateTime);
    return {
      day: date.getDate().toString().padStart(2, '0'),
      month: date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
      full: date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      })
    };
  };

  const getTimeRange = (fromDateTime: string, toDateTime: string) => {
    const fromDate = new Date(fromDateTime);
    const toDate = new Date(toDateTime);
    const startTime = fromDate.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
    const endTime = toDate.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
    return `${startTime} - ${endTime}`;
  };

  const getInterestedCount = (eventId: string) => {
    // Mock data - in real app, this would come from API
    return Math.floor(Math.random() * 50) + 5;
  };


  const getEventAvatars = (count: number) => {
    // Mock avatars - in real app, these would be actual user avatars
    return Array.from({ length: Math.min(count, 5) }, (_, i) => ({
      id: i,
      url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`,
    }));
  };


  return (
    <div className={isFestivalStyle ? 'festival-style' : ''}>
      {/* Mode Switcher */}
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

      <main className="events-main" style={{ 
        minHeight: '100vh',
        padding: '40px 20px 80px',
        position: 'relative',
        zIndex: 1,
      }}>
        <div className="container" style={{ 
          maxWidth: '1400px',
          margin: '0 auto',
          width: '100%',
        }}>
          {/* Page Title */}
          <div style={{ 
            marginBottom: '50px',
            paddingTop: '20px',
            textAlign: 'center',
          }}>
            <h1 style={{
              fontSize: 'clamp(2rem, 5vw, 3rem)',
              fontWeight: 800,
              marginBottom: '12px',
              color: isFestivalStyle ? 'var(--text-dark)' : 'white',
              letterSpacing: '-0.03em',
              lineHeight: 1.1,
            }}>
              Big Events. Small Circles.
            </h1>
            <p style={{
              fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
              color: isFestivalStyle ? 'var(--text-muted)' : 'rgba(255, 255, 255, 0.7)',
              fontWeight: 400,
            }}>
              Skip the crowd anxiety. Grab a spot and enjoy the event together.
            </p>
          </div>

          {/* Search & Control Bar */}
          <div className="events-controls" style={{ 
            display: 'flex', 
            gap: '20px', 
            marginBottom: '50px',
            alignItems: 'center',
            flexWrap: 'wrap',
          }}>
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="events-search-input"
              style={{
                flex: '1',
                minWidth: '250px',
                padding: '14px 20px',
                borderRadius: '12px',
                border: isFestivalStyle 
                  ? '1px solid rgba(0, 0, 0, 0.1)' 
                  : '1px solid rgba(255, 255, 255, 0.2)',
                background: isFestivalStyle 
                  ? 'rgba(255, 255, 255, 0.8)' 
                  : 'rgba(255, 255, 255, 0.05)',
                color: isFestivalStyle ? 'var(--text-dark)' : 'white',
                fontSize: '1rem',
                fontFamily: 'var(--font-main)',
                width: '100%',
              }}
            />
            <div className="view-toggle" style={{
              display: 'flex',
              background: isFestivalStyle 
                ? 'rgba(255, 255, 255, 0.9)' 
                : 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              borderRadius: '12px',
              padding: '4px',
              border: isFestivalStyle 
                ? '1px solid rgba(0, 0, 0, 0.1)' 
                : '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: isFestivalStyle 
                ? '0 1px 3px rgba(0, 0, 0, 0.1)' 
                : '0 4px 20px rgba(0, 0, 0, 0.1)',
            }}>
              <button
                onClick={() => setViewMode('grid')}
                style={{
                  padding: '10px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  background: viewMode === 'grid' 
                    ? (isFestivalStyle 
                        ? 'linear-gradient(135deg, var(--primary-purple), var(--vivid-pink))' 
                        : 'linear-gradient(135deg, var(--glow-green), var(--glow-blue))')
                    : 'transparent',
                  color: viewMode === 'grid' 
                    ? 'white' 
                    : (isFestivalStyle ? 'var(--text-dark)' : 'rgba(255, 255, 255, 0.7)'),
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  flex: 1,
                  justifyContent: 'center',
                }}
              >
                <svg 
                  width="16" 
                  height="16" 
                  viewBox="0 0 16 16" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect x="2" y="2" width="5" height="5" rx="1" fill="currentColor"/>
                  <rect x="9" y="2" width="5" height="5" rx="1" fill="currentColor"/>
                  <rect x="2" y="9" width="5" height="5" rx="1" fill="currentColor"/>
                  <rect x="9" y="9" width="5" height="5" rx="1" fill="currentColor"/>
                </svg>
                <span>Grid</span>
              </button>
              <button
                onClick={() => setViewMode('map')}
                style={{
                  padding: '10px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  background: viewMode === 'map' 
                    ? (isFestivalStyle 
                        ? 'linear-gradient(135deg, var(--primary-purple), var(--vivid-pink))' 
                        : 'linear-gradient(135deg, var(--glow-green), var(--glow-blue))')
                    : 'transparent',
                  color: viewMode === 'map' 
                    ? 'white' 
                    : (isFestivalStyle ? 'var(--text-dark)' : 'rgba(255, 255, 255, 0.7)'),
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  flex: 1,
                  justifyContent: 'center',
                }}
              >
                <svg 
                  width="16" 
                  height="16" 
                  viewBox="0 0 16 16" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path 
                    d="M2 2L8 6L14 2V14L8 10L2 14V2Z" 
                    stroke="currentColor" 
                    strokeWidth="1.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    fill="none"
                  />
                  <circle 
                    cx="8" 
                    cy="6" 
                    r="1.5" 
                    fill="currentColor"
                  />
                </svg>
                <span>Map</span>
              </button>
            </div>
          </div>

          {/* Events Feed */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: isFestivalStyle ? 'var(--text-dark)' : 'white' }}>
              Loading events...
            </div>
          ) : viewMode === 'grid' ? (
            <div className="events-feed">
              {/* Upcoming Events */}
              {filteredEvents.length > 0 ? (
                <section style={{ marginBottom: '60px' }}>
                  <h2 style={{
                    fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
                    fontWeight: 800,
                    marginBottom: '40px',
                    color: isFestivalStyle ? 'var(--text-dark)' : 'white',
                    letterSpacing: '-0.02em',
                  }}>
                    Upcoming Events
                  </h2>
                  <div className="events-grid" style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                    gap: '30px',
                  }}>
                    {filteredEvents.map(event => (
                      <EventCard 
                        key={event.id} 
                        event={event} 
                        isFestivalStyle={isFestivalStyle}
                        formatDate={formatDate}
                        getTimeRange={(from: string, to: string) => getTimeRange(from, to)}
                        getInterestedCount={getInterestedCount}
                        getEventAvatars={getEventAvatars}
                      />
                    ))}
                  </div>
                </section>
              ) : (
                <div style={{ textAlign: 'center', padding: '60px 0', color: isFestivalStyle ? 'var(--text-dark)' : 'white' }}>
                  No events found
                </div>
              )}
            </div>
          ) : (
            <div style={{
              height: '600px',
              background: isFestivalStyle 
                ? 'rgba(0, 0, 0, 0.05)' 
                : 'rgba(255, 255, 255, 0.05)',
              borderRadius: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isFestivalStyle ? 'var(--text-dark)' : 'white',
              border: isFestivalStyle 
                ? '1px solid rgba(0, 0, 0, 0.1)' 
                : '1px solid rgba(255, 255, 255, 0.1)',
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🗺️</div>
                <h2 style={{
                  fontSize: '2rem',
                  fontWeight: 800,
                  marginBottom: '10px',
                  color: isFestivalStyle ? 'var(--text-dark)' : 'white',
                }}>
                  Map View
                </h2>
                <p style={{
                  fontSize: '1.1rem',
                  color: isFestivalStyle ? 'var(--text-muted)' : 'rgba(255, 255, 255, 0.7)',
                }}>
                  Coming soon...
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// Event Card Component
function EventCard({ 
  event, 
  isFestivalStyle,
  formatDate,
  getTimeRange,
  getInterestedCount,
  getEventAvatars,
}: {
  event: EventDto;
  isFestivalStyle: boolean;
  formatDate: (dateString: string) => { day: string; month: string; full: string; time: string };
  getTimeRange: (from: string, to: string) => string;
  getInterestedCount: (eventId: string) => number;
  getEventAvatars: (count: number) => Array<{ id: number; url: string }>;
}) {
  const dateInfo = formatDate(event.fromDateTime);
  const interestedCount = getInterestedCount(event.id);
  const avatars = getEventAvatars(interestedCount);

  return (
    <Link 
      href={`/register?eventId=${event.id}${isFestivalStyle ? '&style=festival' : ''}`}
      className="event-card-link"
      style={{ textDecoration: 'none' }}
    >
      <div className="event-card-container" style={{
        background: isFestivalStyle 
          ? 'white' 
          : 'rgba(255, 255, 255, 0.05)',
        borderRadius: '20px',
        overflow: 'hidden',
        border: isFestivalStyle 
          ? '1px solid rgba(0, 0, 0, 0.1)' 
          : '1px solid rgba(255, 255, 255, 0.1)',
        transition: 'all 0.3s',
        cursor: 'pointer',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-5px)';
        e.currentTarget.style.boxShadow = isFestivalStyle
          ? '0 12px 40px rgba(124, 58, 237, 0.2)'
          : '0 12px 40px rgba(0, 255, 148, 0.2)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
      >
        {/* Zone A: Media */}
        <div style={{ position: 'relative', width: '100%', height: '240px', overflow: 'hidden' }}>
          {event.imageUrl ? (
            <Image
              src={event.imageUrl}
              alt={event.name}
              fill
              style={{ objectFit: 'cover' }}
              unoptimized
            />
          ) : (
            <div style={{
              width: '100%',
              height: '100%',
              background: isFestivalStyle
                ? 'linear-gradient(135deg, var(--primary-purple), var(--vivid-pink))'
                : 'linear-gradient(135deg, var(--glow-blue), var(--glow-purple))',
            }} />
          )}
          {/* Date Badge */}
          <div style={{
            position: 'absolute',
            top: '16px',
            left: '16px',
            background: isFestivalStyle ? 'white' : 'rgba(0, 0, 0, 0.8)',
            borderRadius: '12px',
            padding: '12px 16px',
            color: isFestivalStyle ? 'var(--text-dark)' : 'white',
            fontWeight: 700,
            textAlign: 'center',
            backdropFilter: 'blur(10px)',
          }}>
            <div style={{ fontSize: '1.5rem', lineHeight: 1 }}>{dateInfo.day}</div>
            <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>{dateInfo.month}</div>
          </div>
        </div>

        {/* Zone B: Information */}
        <div style={{ padding: '20px' }}>
          <h3 style={{
            fontSize: '1.5rem',
            fontWeight: 800,
            marginBottom: '12px',
            color: isFestivalStyle ? 'var(--text-dark)' : 'white',
            lineHeight: 1.2,
          }}>
            {event.name}
          </h3>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '12px',
            color: isFestivalStyle ? 'var(--text-muted)' : 'rgba(255, 255, 255, 0.7)',
            fontSize: '0.9rem',
          }}>
            <span>📍</span>
            <span>{event.location}</span>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '16px',
            color: isFestivalStyle ? 'var(--text-muted)' : 'rgba(255, 255, 255, 0.7)',
            fontSize: '0.9rem',
          }}>
            <span>🕐</span>
            <span>{getTimeRange(event.fromDateTime, event.toDateTime)}</span>
          </div>
        </div>

        {/* Zone C: Social Infrastructure */}
        <div style={{
          padding: '20px',
          borderTop: isFestivalStyle 
            ? '1px solid rgba(0, 0, 0, 0.1)' 
            : '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
            {/* Avatar Stack */}
            <div style={{ display: 'flex', marginLeft: '-8px' }}>
              {avatars.slice(0, 4).map((avatar, idx) => (
                <div
                  key={avatar.id}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    border: `2px solid ${isFestivalStyle ? 'white' : 'var(--bg-dark)'}`,
                    marginLeft: idx > 0 ? '-8px' : '0',
                    overflow: 'hidden',
                    background: isFestivalStyle 
                      ? 'rgba(0, 0, 0, 0.05)' 
                      : 'rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <Image
                    src={avatar.url}
                    alt={`Avatar ${idx + 1}`}
                    width={32}
                    height={32}
                    style={{ objectFit: 'cover' }}
                    unoptimized
                  />
                </div>
              ))}
            </div>
            <span style={{
              fontSize: '0.85rem',
              color: isFestivalStyle ? 'var(--text-muted)' : 'rgba(255, 255, 255, 0.7)',
              fontWeight: 500,
            }}>
              {interestedCount} people interested
            </span>
          </div>
          
          {/* Primary Action Button */}
          <button
            style={{
              padding: '10px 24px',
              borderRadius: '12px',
              border: 'none',
              background: isFestivalStyle
                ? 'linear-gradient(135deg, var(--primary-purple), var(--vivid-pink))'
                : 'linear-gradient(135deg, var(--glow-green), var(--glow-blue))',
              color: 'white',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'transform 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
            onClick={(e) => {
              e.preventDefault();
              window.location.href = `/register?eventId=${event.id}${isFestivalStyle ? '&style=festival' : ''}`;
            }}
          >
            I&apos;m In
          </button>
        </div>
      </div>
    </Link>
  );
}

export default function EventsPage() {
  return (
    <Suspense fallback={
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh',
        color: 'white'
      }}>
        Loading...
      </div>
    }>
      <EventsContent />
    </Suspense>
  );
}

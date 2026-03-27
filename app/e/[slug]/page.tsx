import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getEventBySlug, partneredEvents } from '@/lib/constants/events';
import SiteHeader from '../../components/SiteHeader';
import SiteFooter from '../../components/SiteFooter';

interface EventPageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Generate static params for all active events
export async function generateStaticParams() {
  return partneredEvents
    .filter((event) => event.active)
    .map((event) => ({
      slug: event.slug,
    }));
}

// Generate metadata for each event
export async function generateMetadata({ params }: EventPageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = getEventBySlug(slug);

  if (!event) {
    return {
      title: 'Event Not Found | IMIN',
    };
  }

  return {
    title: `${event.name} - Find Your Squad | IMIN`,
    description: event.description || `Don't go alone to ${event.name}. Join IMIN to find your squad of 5 and make new friends at the event.`,
    openGraph: {
      title: `Join the squad at ${event.name}!`,
      description: event.description,
      type: 'website',
    },
  };
}

export default async function EventLandingPage({ params }: EventPageProps) {
  const { slug } = await params;
  const event = getEventBySlug(slug);

  // If event not found, show 404
  if (!event) {
    notFound();
  }

  // Default values
  const accentColor = event.accentColor || '#10b981'; // emerald-500
  const heroTitle = event.heroTitle || `Going to ${event.name}?`;
  const heroSubtitle = event.heroSubtitle || 
    "Don't let 'I have no one to go with' stop you. Find Your Squad of 5 and make the event amazing.";
  const ctaText = event.ctaText || 'Find Your Squad';
  const ticketUrl = event.ticketUrl || 'https://t.me/imin_squad_bot';

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      <SiteHeader />

      {/* Event Hero Section */}
      <section className="pt-32 pb-24 px-4 relative overflow-hidden">
        {/* Animated background with event-specific accent */}
        <div className="absolute inset-0 -z-10">
          <div 
            className="absolute top-20 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20" 
            style={{ backgroundColor: accentColor }}
          ></div>
          <div 
            className="absolute bottom-20 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-10" 
            style={{ backgroundColor: accentColor }}
          ></div>
        </div>

        <div className="max-w-4xl mx-auto text-center">
          {/* Event Badge */}
          <div className="mb-6">
            <span 
              className="inline-block px-4 py-2 rounded-full text-sm font-medium border"
              style={{ 
                backgroundColor: `${accentColor}20`, 
                borderColor: `${accentColor}50`,
                color: accentColor 
              }}
            >
              🎉 Partnered with {event.organizer}
            </span>
          </div>

          {/* Event Name as Hero */}
          <h1 className="text-5xl md:text-6xl font-black mb-6 leading-tight">
            {heroTitle.split(event.name).map((part, i, arr) => (
              <span key={i}>
                {part}
                {i < arr.length - 1 && (
                  <span 
                    className="bg-clip-text text-transparent"
                    style={{
                      backgroundImage: `linear-gradient(to right, ${accentColor}, #22d3ee)`,
                    }}
                  >
                    {event.name}
                  </span>
                )}
              </span>
            ))}
          </h1>

          <p className="text-xl md:text-2xl text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            {heroSubtitle}
          </p>

          {/* Event Details */}
          {(event.date || event.venue || event.location) && (
            <div className="flex flex-wrap justify-center gap-6 mb-10 text-slate-400">
              {event.date && (
                <div className="flex items-center gap-2">
                  <span>📅</span>
                  <span>{event.date}</span>
                </div>
              )}
              {event.venue && (
                <div className="flex items-center gap-2">
                  <span>📍</span>
                  <span>{event.venue}</span>
                </div>
              )}
              {event.location && (
                <div className="flex items-center gap-2">
                  <span>🌍</span>
                  <span>{event.location}</span>
                </div>
              )}
            </div>
          )}

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="group inline-flex items-center justify-center px-8 py-4 text-lg font-bold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
              style={{ 
                backgroundColor: accentColor,
                boxShadow: `${accentColor}50`
              }}
            >
              {ctaText}
              <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <a
              href={ticketUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold rounded-lg border-2 transition-all duration-300 hover:bg-white/5"
              style={{ borderColor: accentColor, color: accentColor }}
            >
              Get Tickets
            </a>
          </div>

          {/* Trust indicator */}
          <p className="mt-6 text-sm text-slate-500">
            🔒 Join {Math.floor(Math.random() * 50 + 50)}+ solo-goers already matched
          </p>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 bg-slate-900/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center text-2xl" style={{ backgroundColor: `${accentColor}20` }}>
                1
              </div>
              <h3 className="text-xl font-bold mb-2">Sign Up</h3>
              <p className="text-slate-400">
                Register with your details and tell us about yourself. We match you with people like you.
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center text-2xl" style={{ backgroundColor: `${accentColor}20` }}>
                2
              </div>
              <h3 className="text-xl font-bold mb-2">Get Matched</h3>
              <p className="text-slate-400">
                We create a squad of 5 people going to the same event. Get matched based on language & interests.
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center text-2xl" style={{ backgroundColor: `${accentColor}20` }}>
                3
              </div>
              <h3 className="text-xl font-bold mb-2">Go Together</h3>
              <p className="text-slate-400">
                Chat with your squad before the event. Meet up, make friends, and enjoy together!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8">Don&apos;t Go Alone</h2>
          <div className="grid md:grid-cols-2 gap-6 text-left">
            <div className="p-6 rounded-xl bg-slate-800/50 border border-slate-700/50">
              <p className="text-slate-300 mb-4">&quot;I was nervous about going to my first conference alone. IMIN matched me with 4 awesome people and we had the best time!&quot;</p>
              <p className="text-sm text-slate-500">— Sarah T., TechConf attendee</p>
            </div>
            <div className="p-6 rounded-xl bg-slate-800/50 border border-slate-700/50">
              <p className="text-slate-300 mb-4">&quot;As an organizer, offering IMIN to our attendees increased satisfaction by 40%. They love the squad feature!&quot;</p>
              <p className="text-sm text-slate-500">— Event Organizer</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Find Your Squad?</h2>
          <p className="text-xl text-slate-300 mb-8">
            Join {Math.floor(Math.random() * 100 + 100)}+ people who&apos;ve already found their squad for events this month.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center justify-center px-10 py-5 text-xl font-bold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
            style={{ 
              backgroundColor: accentColor,
              boxShadow: `${accentColor}50`
            }}
          >
            Find Your Squad Now
            <svg className="w-6 h-6 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

// Generate dynamic OG images could be added here
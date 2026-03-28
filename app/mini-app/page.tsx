'use client';

import { useState, useEffect } from 'react';
import { initTelegramWebApp, getThemeColors, isRunningInTelegram, triggerHaptic } from '@/lib/telegram-webapp';

// Sample data - in production this would come from API
interface Event {
  id: string;
  title: string;
  date: string;
  venue: string;
  image: string;
  attendees: number;
  squadSize: number;
}

interface SquadMember {
  id: string;
  name: string;
  avatar: string;
  bio: string;
}

const sampleEvents: Event[] = [
  {
    id: '1',
    title: 'Tech Meetup Paris',
    date: 'March 29, 2026',
    venue: 'Le Marais Co-working',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400',
    attendees: 24,
    squadSize: 4,
  },
  {
    id: '2',
    title: 'Startup Pitch Night',
    date: 'March 30, 2026',
    venue: 'Station F',
    image: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=400',
    attendees: 45,
    squadSize: 5,
  },
  {
    id: '3',
    title: 'Language Exchange',
    date: 'March 31, 2026',
    venue: 'Café de Flore',
    image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400',
    attendees: 18,
    squadSize: 3,
  },
];

const sampleSquads: SquadMember[] = [
  {
    id: '1',
    name: 'Alex',
    avatar: '👨‍💻',
    bio: 'Product designer, love meeting new people!',
  },
  {
    id: '2',
    name: 'Marie',
    avatar: '👩‍🔬',
    bio: 'Data scientist, here for tech events',
  },
  {
    id: '3',
    name: 'Jordan',
    avatar: '🧑‍🎨',
    bio: 'Freelance developer, looking for startup peeps',
  },
];

export default function MiniApp() {
  const [activeTab, setActiveTab] = useState<'events' | 'squad' | 'profile'>('events');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [webApp, setWebApp] = useState<any>(null);
  const [theme, setTheme] = useState(getThemeColors(null));
  const [isTelegram, setIsTelegram] = useState(false);

  useEffect(() => {
    const wa = initTelegramWebApp();
    if (wa) {
      setWebApp(wa);
      setTheme(getThemeColors(wa));
      setIsTelegram(true);
    }
  }, []);

  const handleEventTap = (event: Event) => {
    triggerHaptic(webApp, 'impact', 'light');
    setSelectedEvent(event);
  };

  const handleJoinSquad = () => {
    triggerHaptic(webApp, 'notification', 'success');
    // In production, this would call the API
    alert('Request sent! 🎉');
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: theme.bg,
      color: theme.text,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      padding: '0',
      margin: '0',
    },
    header: {
      padding: '16px',
      background: theme.secondary,
      borderBottom: `1px solid ${theme.hint}20`,
      position: 'sticky' as const,
      top: 0,
      zIndex: 100,
    },
    headerTitle: {
      fontSize: '20px',
      fontWeight: '700',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    tabBar: {
      position: 'fixed' as const,
      bottom: 0,
      left: 0,
      right: 0,
      display: 'flex',
      background: theme.secondary,
      borderTop: `1px solid ${theme.hint}20`,
      padding: '8px 0',
      paddingBottom: 'env(safe-area-inset-bottom)',
    },
    tab: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      gap: '4px',
      padding: '8px',
      cursor: 'pointer',
      opacity: 0.6,
      transition: 'opacity 0.2s',
    },
    tabActive: {
      opacity: 1,
    },
    tabIcon: {
      fontSize: '24px',
    },
    tabLabel: {
      fontSize: '12px',
      fontWeight: '500',
    },
    content: {
      padding: '16px',
      paddingBottom: '100px',
    },
    card: {
      background: theme.secondary,
      borderRadius: '16px',
      overflow: 'hidden',
      marginBottom: '16px',
      boxShadow: `0 2px 8px ${theme.hint}10`,
    },
    cardImage: {
      width: '100%',
      height: '140px',
      objectFit: 'cover' as const,
    },
    cardContent: {
      padding: '16px',
    },
    cardTitle: {
      fontSize: '18px',
      fontWeight: '600',
      marginBottom: '8px',
    },
    cardMeta: {
      display: 'flex',
      gap: '16px',
      fontSize: '14px',
      color: theme.hint,
      marginBottom: '12px',
    },
    button: {
      width: '100%',
      padding: '14px',
      background: theme.button,
      color: theme.buttonText,
      border: 'none',
      borderRadius: '12px',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer',
    },
    squadGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '12px',
    },
    squadCard: {
      background: theme.secondary,
      borderRadius: '16px',
      padding: '16px',
      textAlign: 'center' as const,
    },
    avatar: {
      fontSize: '48px',
      marginBottom: '8px',
    },
    memberName: {
      fontSize: '16px',
      fontWeight: '600',
      marginBottom: '4px',
    },
    memberBio: {
      fontSize: '12px',
      color: theme.hint,
    },
    profileSection: {
      background: theme.secondary,
      borderRadius: '16px',
      padding: '20px',
      marginBottom: '16px',
    },
    profileHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      marginBottom: '20px',
    },
    profileAvatar: {
      fontSize: '64px',
    },
    profileName: {
      fontSize: '24px',
      fontWeight: '700',
    },
    profileHandle: {
      color: theme.hint,
      fontSize: '14px',
    },
    stat: {
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      padding: '16px',
    },
    statValue: {
      fontSize: '28px',
      fontWeight: '700',
      color: theme.button,
    },
    statLabel: {
      fontSize: '12px',
      color: theme.hint,
      marginTop: '4px',
    },
    detailImage: {
      width: '100%',
      height: '200px',
      objectFit: 'cover' as const,
    },
    detailContent: {
      padding: '20px',
    },
    detailTitle: {
      fontSize: '24px',
      fontWeight: '700',
      marginBottom: '12px',
    },
    detailMeta: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '8px',
      marginBottom: '20px',
      color: theme.hint,
    },
    backButton: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 16px',
      background: theme.secondary,
      border: 'none',
      borderRadius: '8px',
      color: theme.text,
      fontSize: '14px',
      cursor: 'pointer',
      marginBottom: '16px',
    },
  };

  // Event Detail View
  if (selectedEvent) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <div style={styles.headerTitle}>
            <button style={styles.backButton} onClick={() => { setSelectedEvent(null); triggerHaptic(webApp, 'impact', 'light'); }}>
              ← Back
            </button>
          </div>
        </div>
        <div style={styles.content}>
          <div style={styles.card}>
            <img src={selectedEvent.image} alt={selectedEvent.title} style={styles.detailImage} />
            <div style={styles.detailContent}>
              <h1 style={styles.detailTitle}>{selectedEvent.title}</h1>
              <div style={styles.detailMeta}>
                <span>📅 {selectedEvent.date}</span>
                <span>📍 {selectedEvent.venue}</span>
                <span>👥 {selectedEvent.attendees} attending</span>
              </div>
              <button style={styles.button} onClick={handleJoinSquad}>
                Find Your Squad 🎉
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerTitle}>
          <span>🎯</span>
          <span>IMIN</span>
        </div>
      </div>

      {/* Content */}
      <div style={styles.content}>
        {activeTab === 'events' && (
          <>
            <h2 style={{ marginBottom: '16px', fontSize: '22px', fontWeight: '700' }}>
              Discover Events
            </h2>
            {sampleEvents.map((event) => (
              <div key={event.id} style={styles.card} onClick={() => handleEventTap(event)}>
                <img src={event.image} alt={event.title} style={styles.cardImage} />
                <div style={styles.cardContent}>
                  <h3 style={styles.cardTitle}>{event.title}</h3>
                  <div style={styles.cardMeta}>
                    <span>📅 {event.date}</span>
                    <span>📍 {event.venue}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: theme.hint, fontSize: '14px' }}>
                      {event.attendees} people • Squads of {event.squadSize}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}

        {activeTab === 'squad' && (
          <>
            <h2 style={{ marginBottom: '16px', fontSize: '22px', fontWeight: '700' }}>
              Your Squad
            </h2>
            <div style={styles.card}>
              <div style={{ padding: '20px', textAlign: 'center' as const }}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>🤝</div>
                <h3 style={{ marginBottom: '8px' }}>Tech Meetup Paris</h3>
                <p style={{ color: theme.hint, marginBottom: '16px' }}>March 29, 2026</p>
                <div style={styles.squadGrid}>
                  {sampleSquads.map((member) => (
                    <div key={member.id} style={styles.squadCard}>
                      <div style={styles.avatar}>{member.avatar}</div>
                      <div style={styles.memberName}>{member.name}</div>
                      <div style={styles.memberBio}>{member.bio}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <button style={styles.button}>
              💬 Open Squad Chat
            </button>
          </>
        )}

        {activeTab === 'profile' && (
          <>
            <h2 style={{ marginBottom: '16px', fontSize: '22px', fontWeight: '700' }}>
              Profile
            </h2>
            <div style={styles.profileSection}>
              <div style={styles.profileHeader}>
                <span style={styles.profileAvatar}>🧑‍💻</span>
                <div>
                  <div style={styles.profileName}>Ivan</div>
                  <div style={styles.profileHandle}>@ivankozmulyak</div>
                </div>
              </div>
              <div style={{ display: 'flex', borderTop: `1px solid ${theme.hint}20`, paddingTop: '16px' }}>
                <div style={{ ...styles.stat, flex: 1 }}>
                  <span style={styles.statValue}>12</span>
                  <span style={styles.statLabel}>Events</span>
                </div>
                <div style={{ ...styles.stat, flex: 1 }}>
                  <span style={styles.statValue}>8</span>
                  <span style={styles.statLabel}>Squads</span>
                </div>
                <div style={{ ...styles.stat, flex: 1 }}>
                  <span style={styles.statValue}>⭐ 4.8</span>
                  <span style={styles.statLabel}>Rating</span>
                </div>
              </div>
            </div>
            <div style={styles.profileSection}>
              <h3 style={{ marginBottom: '12px' }}>Settings</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ padding: '12px', background: theme.bg, borderRadius: '8px', cursor: 'pointer' }}>
                  🔔 Notifications
                </div>
                <div style={{ padding: '12px', background: theme.bg, borderRadius: '8px', cursor: 'pointer' }}>
                  🌐 Language
                </div>
                <div style={{ padding: '12px', background: theme.bg, borderRadius: '8px', cursor: 'pointer' }}>
                  ❓ Help
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Tab Bar */}
      <div style={styles.tabBar}>
        <div 
          style={{ ...styles.tab, ...(activeTab === 'events' ? styles.tabActive : {}) }}
          onClick={() => { setActiveTab('events'); triggerHaptic(webApp, 'selection'); }}
        >
          <span style={styles.tabIcon}>🎪</span>
          <span style={styles.tabLabel}>Events</span>
        </div>
        <div 
          style={{ ...styles.tab, ...(activeTab === 'squad' ? styles.tabActive : {}) }}
          onClick={() => { setActiveTab('squad'); triggerHaptic(webApp, 'selection'); }}
        >
          <span style={styles.tabIcon}>🤝</span>
          <span style={styles.tabLabel}>Squad</span>
        </div>
        <div 
          style={{ ...styles.tab, ...(activeTab === 'profile' ? styles.tabActive : {}) }}
          onClick={() => { setActiveTab('profile'); triggerHaptic(webApp, 'selection'); }}
        >
          <span style={styles.tabIcon}>👤</span>
          <span style={styles.tabLabel}>Profile</span>
        </div>
      </div>
    </div>
  );
}
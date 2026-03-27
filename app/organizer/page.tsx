'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Organizer {
  id: string;
  name: string;
  email: string;
  organization: string;
}

interface EventAnalytics {
  id: string;
  name: string;
  fromDateTime: string;
  toDateTime: string;
  location: string;
  status: string;
  registrations: {
    total: number;
    male: number;
    female: number;
    other: number;
  };
  squads: number;
  matchedUsers: number;
}

export default function OrganizerDashboard() {
  const router = useRouter();
  const [organizer, setOrganizer] = useState<Organizer | null>(null);
  const [events, setEvents] = useState<EventAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);
  
  // Login form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  
  // Create event form
  const [newEvent, setNewEvent] = useState({
    name: '',
    description: '',
    location: '',
    fromDateTime: '',
    toDateTime: '',
    ticketUrl: '',
  });

  useEffect(() => {
    // Check for stored session
    const storedKey = localStorage.getItem('imin_organizer_key');
    const storedOrg = localStorage.getItem('imin_organizer');
    if (storedKey && storedOrg) {
      setApiKey(storedKey);
      setOrganizer(JSON.parse(storedOrg));
      fetchEvents(storedKey);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchEvents = async (key: string) => {
    try {
      const res = await fetch('/api/organizer/events', {
        headers: { 'x-api-key': key },
      });
      const data = await res.json();
      if (data.success) {
        setEvents(data.events);
      }
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    
    try {
      const res = await fetch('/api/organizer/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await res.json();
      
      if (data.success) {
        localStorage.setItem('imin_organizer_key', data.apiKey);
        localStorage.setItem('imin_organizer', JSON.stringify(data.organizer));
        setApiKey(data.apiKey);
        setOrganizer(data.organizer);
        fetchEvents(data.apiKey);
      } else {
        setLoginError(data.error || 'Login failed');
      }
    } catch (error) {
      setLoginError('Connection error. Please try again.');
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey) return;
    
    try {
      const res = await fetch('/api/organizer/events', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        },
        body: JSON.stringify(newEvent),
      });
      
      const data = await res.json();
      
      if (data.success) {
        setShowCreateModal(false);
        setNewEvent({
          name: '',
          description: '',
          location: '',
          fromDateTime: '',
          toDateTime: '',
          ticketUrl: '',
        });
        fetchEvents(apiKey);
      } else {
        alert(data.error || 'Failed to create event');
      }
    } catch (error) {
      alert('Failed to create event');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('imin_organizer_key');
    localStorage.removeItem('imin_organizer');
    setApiKey(null);
    setOrganizer(null);
    setEvents([]);
    setLoading(true);
  };

  // Login screen
  if (!organizer) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-emerald-400 mb-2">🎫 IMIN Organizer</h1>
            <p className="text-slate-400">Partner Dashboard</p>
          </div>
          
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-emerald-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-emerald-500 focus:outline-none"
                  required
                />
              </div>
              
              {loginError && (
                <div className="text-red-400 text-sm">{loginError}</div>
              )}
              
              <button
                type="submit"
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold py-3 rounded-lg transition-colors"
              >
                Sign In
              </button>
            </form>
          </div>
          
          <p className="text-center text-slate-500 text-sm mt-6">
            Contact IMIN to get your organizer credentials
          </p>
        </div>
      </div>
    );
  }

  // Dashboard
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="bg-slate-900/50 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-emerald-400">🎫 IMIN Organizer</h1>
            <p className="text-sm text-slate-400">{organizer.organization}</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-slate-400 text-sm">{organizer.email}</span>
            <button
              onClick={handleLogout}
              className="text-sm text-slate-400 hover:text-white transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
            <div className="text-slate-400 text-sm mb-1">Total Events</div>
            <div className="text-3xl font-bold text-white">{events.length}</div>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
            <div className="text-slate-400 text-sm mb-1">Total Registrations</div>
            <div className="text-3xl font-bold text-emerald-400">
              {events.reduce((acc, e) => acc + e.registrations.total, 0)}
            </div>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
            <div className="text-slate-400 text-sm mb-1">Matched Users</div>
            <div className="text-3xl font-bold text-cyan-400">
              {events.reduce((acc, e) => acc + e.matchedUsers, 0)}
            </div>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
            <div className="text-slate-400 text-sm mb-1">Active Squads</div>
            <div className="text-3xl font-bold text-purple-400">
              {events.reduce((acc, e) => acc + e.squads, 0)}
            </div>
          </div>
        </div>

        {/* Events Section */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Your Events</h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
          >
            <span>+</span> Add Event
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-400">Loading events...</div>
        ) : events.length === 0 ? (
          <div className="text-center py-12 bg-slate-900/30 border border-slate-800 rounded-xl">
            <div className="text-slate-400 mb-4">No events yet</div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="text-emerald-400 hover:text-emerald-300"
            >
              Create your first event →
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {events.map((event) => (
              <div
                key={event.id}
                className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-white">{event.name}</h3>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        event.status === 'active' 
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : event.status === 'paused'
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {event.status}
                      </span>
                    </div>
                    <p className="text-slate-400 text-sm mb-3">
                      📍 {event.location} • 📅 {new Date(event.fromDateTime).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-6 text-center">
                    <div>
                      <div className="text-2xl font-bold text-white">{event.registrations.total}</div>
                      <div className="text-xs text-slate-500">Registered</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-emerald-400">{event.matchedUsers}</div>
                      <div className="text-xs text-slate-500">Matched</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-cyan-400">{event.squads}</div>
                      <div className="text-xs text-slate-500">Squads</div>
                    </div>
                  </div>
                </div>
                
                {/* Demographics bar */}
                {event.registrations.total > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-800">
                    <div className="flex gap-2 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-blue-400" 
                        style={{ width: `${(event.registrations.male / event.registrations.total) * 100}%` }}
                      />
                      <div 
                        className="bg-pink-400" 
                        style={{ width: `${(event.registrations.female / event.registrations.total) * 100}%` }}
                      />
                      <div 
                        className="bg-purple-400" 
                        style={{ width: `${(event.registrations.other / event.registrations.total) * 100}%` }}
                      />
                    </div>
                    <div className="flex gap-4 mt-2 text-xs text-slate-500">
                      <span>♂ {event.registrations.male}</span>
                      <span>♀ {event.registrations.female}</span>
                      <span>⚥ {event.registrations.other}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create Event Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-800">
              <h3 className="text-xl font-bold">Create New Event</h3>
            </div>
            <form onSubmit={handleCreateEvent} className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Event Name *</label>
                <input
                  type="text"
                  value={newEvent.name}
                  onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-emerald-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Description</label>
                <textarea
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-emerald-500 focus:outline-none h-24"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Location *</label>
                <input
                  type="text"
                  value={newEvent.location}
                  onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-emerald-500 focus:outline-none"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Start Date & Time *</label>
                  <input
                    type="datetime-local"
                    value={newEvent.fromDateTime}
                    onChange={(e) => setNewEvent({ ...newEvent, fromDateTime: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-emerald-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">End Date & Time *</label>
                  <input
                    type="datetime-local"
                    value={newEvent.toDateTime}
                    onChange={(e) => setNewEvent({ ...newEvent, toDateTime: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-emerald-500 focus:outline-none"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Ticket URL</label>
                <input
                  type="url"
                  value={newEvent.ticketUrl}
                  onChange={(e) => setNewEvent({ ...newEvent, ticketUrl: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-emerald-500 focus:outline-none"
                  placeholder="https://..."
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold py-3 rounded-lg transition-colors"
                >
                  Create Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
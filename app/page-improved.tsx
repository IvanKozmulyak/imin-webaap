'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import SiteHeader from './components/SiteHeader';
import SiteFooter from './components/SiteFooter';

export default function HomePage() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      <SiteHeader />

      {/* Hero Section */}
      <section className="pt-32 pb-24 px-4 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-5xl mx-auto text-center">
          <div className={`mb-6 transition-all duration-1000 ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
            <span className="inline-block px-4 py-2 rounded-full bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-sm font-medium">
              ✨ The Social Infrastructure for Solo Goers
            </span>
          </div>

          <h1 className={`text-6xl md:text-7xl font-black mb-6 leading-tight transition-all duration-1000 delay-100 ${
            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            Find Your<br />
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Squad of 5
            </span>
          </h1>

          <p className={`text-xl md:text-2xl text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed transition-all duration-1000 delay-200 ${
            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            Don't let "I have no one to go with" stop you from living. IMIN matches you with 4 other like-minded people for any event.
          </p>

          <div className={`flex flex-col sm:flex-row gap-4 justify-center transition-all duration-1000 delay-300 ${
            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            <Link
              href="/register"
              className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold rounded-lg bg-emerald-500 hover:bg-emerald-600 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-emerald-500/50"
            >
              Find Your Squad
              <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <a
              href="https://t.me/imin_squad_bot"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold rounded-lg border-2 border-emerald-500 text-emerald-300 hover:bg-emerald-500/10 transition-all duration-300"
            >
              Try on Telegram
            </a>
          </div>
        </div>
      </section>

      {/* Problem / Solution Section */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">Why IMIN?</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="group p-8 rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-700/30 border border-slate-700/50 hover:border-emerald-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/20">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">😔</div>
              <h3 className="text-xl font-bold mb-3">Alone? Not Anymore.</h3>
              <p className="text-slate-400">
                Stop being the solo person standing awkwardly. Go with a pre-made crew of 5 people who want to be there.
              </p>
            </div>

            {/* Card 2 */}
            <div className="group p-8 rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-700/30 border border-slate-700/50 hover:border-emerald-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/20">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">🔗</div>
              <h3 className="text-xl font-bold mb-3">Make Instant Friends</h3>
              <p className="text-slate-400">
                Your squad gets a private Telegram group to chat, get to know each other, and build chemistry before the event.
              </p>
            </div>

            {/* Card 3 */}
            <div className="group p-8 rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-700/30 border border-slate-700/50 hover:border-emerald-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/20">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">🌍</div>
              <h3 className="text-xl font-bold mb-3">Language Matched</h3>
              <p className="text-slate-400">
                Only matched with people who speak your language. Communication is smooth from the start.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-slate-800/30">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">How It Works</h2>
          
          <div className="relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500/0 via-emerald-500/50 to-emerald-500/0 transform -translate-y-1/2"></div>

            <div className="grid md:grid-cols-4 gap-8">
              {/* Step 1 */}
              <div className="relative">
                <div className="relative z-10 mb-6">
                  <div className="w-16 h-16 rounded-full bg-emerald-500 mx-auto flex items-center justify-center text-2xl font-bold">1</div>
                </div>
                <h3 className="text-xl font-bold text-center mb-2">Pick an Event</h3>
                <p className="text-slate-400 text-center">Browse upcoming events and select what interests you.</p>
              </div>

              {/* Step 2 */}
              <div className="relative">
                <div className="relative z-10 mb-6">
                  <div className="w-16 h-16 rounded-full bg-emerald-500 mx-auto flex items-center justify-center text-2xl font-bold">2</div>
                </div>
                <h3 className="text-xl font-bold text-center mb-2">Share Languages</h3>
                <p className="text-slate-400 text-center">Tell us what languages you speak. We match you with people who share your language.</p>
              </div>

              {/* Step 3 */}
              <div className="relative">
                <div className="relative z-10 mb-6">
                  <div className="w-16 h-16 rounded-full bg-emerald-500 mx-auto flex items-center justify-center text-2xl font-bold">3</div>
                </div>
                <h3 className="text-xl font-bold text-center mb-2">Join Your Squad</h3>
                <p className="text-slate-400 text-center">Get added to a private Telegram group with your 4 new friends.</p>
              </div>

              {/* Step 4 */}
              <div className="relative">
                <div className="relative z-10 mb-6">
                  <div className="w-16 h-16 rounded-full bg-emerald-500 mx-auto flex items-center justify-center text-2xl font-bold">4</div>
                </div>
                <h3 className="text-xl font-bold text-center mb-2">Meet & Connect</h3>
                <p className="text-slate-400 text-center">Chat, break the ice, and then show up together at the event!</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">What You Get</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { emoji: '🛡️', title: 'Safe & Verified', desc: 'Only real people interested in making friends.' },
              { emoji: '📱', title: 'Telegram Integration', desc: 'Easy group chat with built-in bots and logistics.' },
              { emoji: '🎯', title: 'Smart Matching', desc: 'AI-powered algorithm finds your perfect squad match.' },
              { emoji: '❄️', title: 'Icebreakers Included', desc: 'Fun prompts to get conversations started naturally.' },
              { emoji: '🔔', title: 'Event Reminders', desc: 'Stay in sync with your squad leading up to the event.' },
              { emoji: '💬', title: '24/7 Support', desc: 'Need help? Chat with our bot anytime.' },
            ].map((feature, i) => (
              <div key={i} className="p-6 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-emerald-500/50 transition-all duration-300">
                <div className="text-3xl mb-3">{feature.emoji}</div>
                <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                <p className="text-slate-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 px-4 bg-slate-800/30">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-5xl font-bold text-emerald-400 mb-2">2.3k+</div>
              <p className="text-slate-400">Squad Members</p>
            </div>
            <div>
              <div className="text-5xl font-bold text-emerald-400 mb-2">500+</div>
              <p className="text-slate-400">Events Matched</p>
            </div>
            <div>
              <div className="text-5xl font-bold text-emerald-400 mb-2">95%</div>
              <p className="text-slate-400">Satisfaction Rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center bg-gradient-to-r from-emerald-600/20 to-cyan-600/20 border border-emerald-500/50 rounded-2xl p-12">
          <h2 className="text-4xl font-bold mb-4">Ready to Find Your Crew?</h2>
          <p className="text-xl text-slate-300 mb-8">
            Stop going to events alone. Join thousands of people finding their squad right now.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center px-8 py-3 text-lg font-bold rounded-lg bg-emerald-500 hover:bg-emerald-600 transition-all duration-300 transform hover:scale-105"
            >
              Get Started Now
            </Link>
            <a
              href="/events"
              className="inline-flex items-center justify-center px-8 py-3 text-lg font-bold rounded-lg border-2 border-emerald-500 text-emerald-300 hover:bg-emerald-500/10 transition-all duration-300"
            >
              Browse Events
            </a>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

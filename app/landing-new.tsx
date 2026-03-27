'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function LandingPage() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Add subscription logic
    setSubscribed(true);
    setTimeout(() => setSubscribed(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Navigation */}
      <nav className="fixed w-full top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          <div className="text-2xl font-bold text-emerald-400">IMIN</div>
          <div className="hidden md:flex gap-8 items-center">
            <a href="#features" className="hover:text-emerald-400 transition">Features</a>
            <a href="#how-it-works" className="hover:text-emerald-400 transition">How It Works</a>
            <a href="#cta" className="hover:text-emerald-400 transition">Get Started</a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Find Your Squad.<br />
            <span className="text-emerald-400">Don't Go Alone.</span>
          </h1>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            IMIN matches you with like-minded people for events. Join squads of 5, 
            make friends, and never miss out because you're solo.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/register"
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-8 rounded-lg transition"
            >
              Join Now
            </Link>
            <a 
              href="https://t.me/imin_squad_bot"
              className="border border-emerald-400 text-emerald-400 hover:bg-emerald-400/10 font-bold py-3 px-8 rounded-lg transition"
            >
              Start on Telegram
            </a>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 px-4 bg-slate-800/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">The Problem</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 bg-slate-700/30 rounded-lg border border-slate-600">
              <div className="text-3xl mb-4">😔</div>
              <h3 className="text-lg font-bold mb-2">Solo Anxiety</h3>
              <p className="text-slate-300">Worried about being judged for going to events alone?</p>
            </div>
            <div className="p-6 bg-slate-700/30 rounded-lg border border-slate-600">
              <div className="text-3xl mb-4">🤔</div>
              <h3 className="text-lg font-bold mb-2">Making Friends</h3>
              <p className="text-slate-300">Don't know how to break the ice with strangers at events?</p>
            </div>
            <div className="p-6 bg-slate-700/30 rounded-lg border border-slate-600">
              <div className="text-3xl mb-4">📱</div>
              <h3 className="text-lg font-bold mb-2">Finding People</h3>
              <p className="text-slate-300">Hard to find reliable event-goers who share your interests?</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How IMIN Works</h2>
          <div className="space-y-8">
            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-emerald-500">
                  <span className="text-white font-bold">1</span>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Register for an Event</h3>
                <p className="text-slate-300">Browse upcoming events and tell us your language preferences.</p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-emerald-500">
                  <span className="text-white font-bold">2</span>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Get Matched with Your Squad</h3>
                <p className="text-slate-300">We match you with 4 other cool people who share your language.</p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-emerald-500">
                  <span className="text-white font-bold">3</span>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Get to Know Each Other</h3>
                <p className="text-slate-300">Join a private Telegram group with your squad. Break the ice with fun prompts.</p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-emerald-500">
                  <span className="text-white font-bold">4</span>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Meet Up & Have Fun</h3>
                <p className="text-slate-300">Go to the event with your new friends. Already got your squad!</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 bg-slate-800/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Why Join IMIN?</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-6 bg-slate-700/30 rounded-lg border border-slate-600">
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                <span>✨</span> Safe & Vetted
              </h3>
              <p className="text-slate-300">All members are real people who want to make friends.</p>
            </div>
            <div className="p-6 bg-slate-700/30 rounded-lg border border-slate-600">
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                <span>🌍</span> Language Match
              </h3>
              <p className="text-slate-300">Connect with people who speak your language.</p>
            </div>
            <div className="p-6 bg-slate-700/30 rounded-lg border border-slate-600">
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                <span>🎉</span> Pre-Event Connection
              </h3>
              <p className="text-slate-300">Get to know your squad before the event starts.</p>
            </div>
            <div className="p-6 bg-slate-700/30 rounded-lg border border-slate-600">
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                <span>💪</span> No More Solo Anxiety
              </h3>
              <p className="text-slate-300">Walk in with friends instead of walking in alone.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-12">Trusted by Event Enthusiasts</h2>
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="text-3xl font-bold text-emerald-400">2.3k+</div>
              <p className="text-slate-300">Squad Members</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-emerald-400">500+</div>
              <p className="text-slate-300">Events Matched</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-emerald-400">95%</div>
              <p className="text-slate-300">Satisfaction Rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="cta" className="py-20 px-4 bg-gradient-to-r from-emerald-600 to-emerald-500">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Find Your Squad?</h2>
          <p className="text-lg mb-8 text-emerald-50">Join thousands of people who are already meeting amazing friends at events.</p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link 
              href="/register"
              className="bg-white hover:bg-slate-100 text-emerald-600 font-bold py-3 px-8 rounded-lg transition"
            >
              Get Started Now
            </Link>
            <a 
              href="https://t.me/imin_squad_bot"
              className="border-2 border-white text-white hover:bg-white/10 font-bold py-3 px-8 rounded-lg transition"
            >
              Try Telegram Bot
            </a>
          </div>

          <form onSubmit={handleSubscribe} className="max-w-md mx-auto">
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-4 py-3 rounded-lg bg-white text-slate-900 placeholder-slate-400"
                required
              />
              <button
                type="submit"
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-6 rounded-lg transition"
              >
                Subscribe
              </button>
            </div>
            {subscribed && (
              <p className="text-emerald-900 mt-2 text-sm">✓ Thanks for subscribing!</p>
            )}
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-700 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold mb-4">IMIN</h3>
              <p className="text-slate-400 text-sm">Find your people. Don't go alone.</p>
            </div>
            <div>
              <h3 className="font-bold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="/events" className="hover:text-emerald-400">Events</a></li>
                <li><a href="/register" className="hover:text-emerald-400">Register</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Resources</h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="/faq" className="hover:text-emerald-400">FAQ</a></li>
                <li><a href="/contact" className="hover:text-emerald-400">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="/terms" className="hover:text-emerald-400">Terms</a></li>
                <li><a href="#" className="hover:text-emerald-400">Privacy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-700 pt-8 text-center text-slate-400 text-sm">
            <p>&copy; 2024 IMIN. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

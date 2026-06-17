'use client';

import { useState, type CSSProperties, type FormEvent, type ChangeEvent } from 'react';
import Image from 'next/image';
import { useLandingEffects } from './useLandingEffects';

/** Helper: build an inline style carrying the reveal stagger delay (ms). */
function delay(ms: number): CSSProperties {
  return { ['--reveal-delay' as string]: `${ms}ms` };
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface FormValues {
  name: string;
  email: string;
  city: string;
  link: string;
}

interface FormErrors {
  name?: boolean;
  email?: boolean;
  city?: boolean;
  link?: boolean;
}

type FieldName = keyof FormValues;

export default function Page() {
  useLandingEffects();

  const [values, setValues] = useState<FormValues>({
    name: '',
    email: '',
    city: '',
    link: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const handleChange =
    (field: FieldName) => (e: ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setValues((prev) => ({ ...prev, [field]: value }));
      setErrors((prev) => ({ ...prev, [field]: false }));
    };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setServerError(null);

    const name = values.name.trim();
    const email = values.email.trim();
    const city = values.city.trim();
    const link = values.link.trim();

    const nextErrors: FormErrors = {
      name: name === '',
      email: email === '' || !EMAIL_RE.test(email),
      city: city === '',
      link: link === '',
    };
    setErrors(nextErrors);

    const order: FieldName[] = ['name', 'email', 'city', 'link'];
    const firstInvalid = order.find((f) => nextErrors[f]);
    if (firstInvalid) {
      const el = document.getElementById(`f-${firstInvalid}`);
      if (el) (el as HTMLInputElement).focus();
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/partner-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, city, link }),
      });
      if (!res.ok) {
        let message = 'Something went wrong. Please try again.';
        try {
          const data = (await res.json()) as { error?: string };
          if (data && data.error) message = data.error;
        } catch {
          /* ignore parse error */
        }
        setServerError(message);
        setSubmitting(false);
        return;
      }
      setSubmitted(true);
    } catch {
      setServerError('Network error. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* AMBIENT BLOBS */}
      <div className="bg-blobs" aria-hidden="true">
        <span className="blob blob-1" data-ambient />
        <span className="blob blob-2" data-ambient />
        <span className="blob blob-3" data-ambient />
        <span className="blob blob-4" data-ambient />
      </div>
      {/* NOISE OVERLAY */}
      <div className="bg-noise" aria-hidden="true" />

      {/* PROGRESS BAR */}
      <div id="iminProgress" className="progress-bar" />

      {/* NAV */}
      <nav id="iminNav" className="nav">
        <a href="#top" className="nav-logo" aria-label="IMIN home">
          <img src="/assets/logo-imin.png" alt="IMIN" />
        </a>
        <div className="nav-actions">
          <a href="#invest" className="nav-link">
            For investors
          </a>
          <a href="#access" className="nav-cta">
            Request access
          </a>
        </div>
      </nav>

      {/* HERO */}
      <header id="top" className="hero">
        <div className="hero-grid">
          <div className="hero-copy">
            <span className="eyebrow-pill hero-eyebrow">
              The two-sided platform for nightlife
            </span>
            <h1 className="hero-title">
              The night has two problems.
              <br />
              <span className="accent">We solve both.</span>
            </h1>
            <p className="hero-sub">
              The operating system that runs the night for organizers — and the
              app that helps people find it, and someone to go with.
            </p>
            <div className="hero-cta">
              <a href="#invest" className="btn btn--primary">
                Let&rsquo;s talk
              </a>
              <a href="#product" className="btn btn--ghost">
                See the product →
              </a>
            </div>
            <p className="hero-proof">
              Live product · 1 paying client · Web&nbsp;Summit &rsquo;24 &amp;
              &rsquo;25 · Metz Startup Challenge winner
            </p>
          </div>
          <div className="hero-visual">
            <div className="hero-mark" data-ambient>
              <div className="hero-mark-glow" />
              <img
                src="/assets/imin-logo-mark.png"
                alt="IM IN — the night, in the letters"
              />
              <span className="hero-mark-shine" data-ambient aria-hidden="true" />
            </div>
          </div>
        </div>
      </header>

      {/* PROBLEM */}
      <section id="problem" className="section section--bordered">
        <div className="container">
          <span className="eyebrow reveal">Two sides · same market</span>
          <h2 className="h2 problem-h2 reveal" style={delay(60)}>
            Independent nightlife is broken — in both directions.
          </h2>
          <div className="cards-2">
            <div className="card reveal">
              <span className="card-eyebrow">The organizer</span>
              <h3 className="card-h3">Great nights. Lost on the marketing.</h3>
              <p className="card-body">
                A 2-person crew can&rsquo;t run ads, email, SMS and design like a
                company with a marketing team — and they find out a show is soft
                when the budget&rsquo;s already gone.
              </p>
            </div>
            <div className="card reveal" style={delay(100)}>
              <span className="card-eyebrow">The event-goer</span>
              <h3 className="card-h3">
                Want to go out. Don&rsquo;t know where — or who with.
              </h3>
              <p className="card-body">
                New rooms, new circles, company for the night — not a romantic
                transaction. Dating apps don&rsquo;t fit.
              </p>
            </div>
          </div>
          <p className="problem-pull reveal" style={delay(80)}>
            The gap nobody serves.{' '}
            <span className="muted">The gap IMIN owns.</span>
          </p>
        </div>
      </section>

      {/* PRODUCT / LIVE PROOF */}
      <section id="product" className="section section--bordered">
        <div className="container">
          <div className="status-pill reveal">
            <span className="live-dot" />
            Live today
          </div>
          <h2 className="h2 product-h2 reveal" style={delay(60)}>
            Not a concept. The wedge is shipping.
          </h2>
          <p className="section-lead product-lead reveal" style={delay(120)}>
            Real revenue, real organizer, running live today at{' '}
            <a
              href="https://dashboard.imin.wtf"
              target="_blank"
              rel="noopener"
              className="inline-link"
            >
              dashboard.imin.wtf
            </a>
            .
          </p>

          {/* 01 FORECAST */}
          <div id="forecast" className="feature-row">
            <div className="feature-copy reveal">
              <span className="feature-eyebrow">01 — Forecast</span>
              <h3 className="feature-h3">Know before it&rsquo;s too late.</h3>
              <p className="feature-body">
                IMIN flags a soft night two weeks out — while you can still push
                harder, not after you&rsquo;ve spent the budget trying to save
                it.
              </p>
            </div>
            <figure className="feature-figure reveal" style={delay(100)}>
              <div className="feature-figure-glow" />
              <div className="screenshot">
                <img
                  src="/assets/dashboard-home.webp"
                  alt="IMIN dashboard — live event overview with tickets sold, revenue and cycle metrics"
                  loading="lazy"
                />
              </div>
            </figure>
          </div>

          {/* 02 MARKETING (flipped) */}
          <div id="marketing" className="feature-row feature-row--flip">
            <div className="feature-copy reveal">
              <span className="feature-eyebrow">02 — Marketing</span>
              <h3 className="feature-h3">Marketing that runs itself.</h3>
              <p className="feature-body">
                Meta Ads, email, SMS and AI-generated posters — built from the
                organizer&rsquo;s own buyer data, launched from the same place
                they sold the tickets.
              </p>
            </div>
            <div className="feature-visual reveal" style={delay(100)}>
              <div className="post-card">
                <div className="post-head">
                  <span className="post-avatar" />
                  <span className="post-handle">
                    yournight
                    <small>Sponsored · generated by IMIN</small>
                  </span>
                </div>
                <div className="post-media">
                  <Image
                    src="/assets/vechirka-poster.png"
                    alt="Vechirka × Aerogare — AI-generated event poster, Berlin, 7 Jun 2026"
                    width={896}
                    height={1120}
                    sizes="(max-width: 700px) 92vw, 420px"
                    loading="lazy"
                  />
                  <span className="post-shine" data-ambient aria-hidden="true" />
                  <span className="post-tag">AI Poster · Sample</span>
                </div>
                <div className="post-foot">
                  <span className="post-foot-text">
                    Last tickets — don&rsquo;t miss it.
                  </span>
                  <a href="#access" className="post-launch">
                    Launch
                  </a>
                </div>
              </div>
              <div className="post-caption">
                <span className="live-dot live-dot--sm" />
                Audience: <strong>1,240</strong> past buyers · built
                automatically
              </div>
            </div>
          </div>

          {/* 03 OWNERSHIP */}
          <div id="data" className="feature-row feature-row--last">
            <div className="feature-copy reveal">
              <span className="feature-eyebrow">03 — Ownership</span>
              <h3 className="feature-h3">Your audience stays yours.</h3>
              <p className="feature-body">
                Every ticket buyer feeds the next campaign automatically. The
                fan data belongs to the organizer — not the platform.
              </p>
            </div>
            <div className="feature-copy reveal" style={delay(100)}>
              <div className="flow-card">
                <div className="flow-head">Ticket buyers</div>
                <div className="flow-row">
                  <span className="flow-label">
                    <span className="flow-arrow">→</span>Email list
                  </span>
                  <span className="flow-tag">auto</span>
                </div>
                <div className="flow-row">
                  <span className="flow-label">
                    <span className="flow-arrow">→</span>Meta Ads audience
                  </span>
                  <span className="flow-tag">auto</span>
                </div>
                <div className="flow-row">
                  <span className="flow-label">
                    <span className="flow-arrow">→</span>SMS list
                  </span>
                  <span className="flow-tag">auto</span>
                </div>
                <div className="flow-row">
                  <span className="flow-label">
                    <span className="flow-arrow flow-arrow--green">→</span>
                    Export, anytime
                  </span>
                  <span className="flow-tag flow-tag--green">yours</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI POSTER SHOWCASE */}
      <section id="posters" className="section section--bordered">
        <div className="container">
          <span className="eyebrow reveal">AI creative · inside the dashboard</span>
          <h2 className="h2 posters-h2 reveal" style={delay(60)}>
            Generate event posters. On-brand. In seconds.
          </h2>
          <p className="section-lead posters-lead reveal" style={delay(120)}>
            From the same dashboard where the event lives — no Canva tab, no
            designer brief. The organizer describes the night; IMIN generates the
            artwork.
          </p>
          <div className="posters-grid">
            <figure className="poster-figure reveal">
              <div className="poster-frame">
                <div className="poster-glow" />
                <Image
                  src="/assets/poster-studio-variants.png"
                  alt="IMIN Poster Studio — three AI-generated, export-ready poster variants"
                  width={1942}
                  height={1440}
                  sizes="(max-width: 700px) 92vw, 46vw"
                  loading="lazy"
                />
              </div>
              <figcaption className="poster-cap">
                <span className="poster-num">02</span>
                <span>
                  <span className="poster-cap-title">
                    Get three ready-to-use posters
                  </span>
                  <span className="poster-cap-sub">
                    On-brand variants in seconds — pick a favorite and export
                    PNG, no designer brief.
                  </span>
                </span>
              </figcaption>
            </figure>
            <figure className="poster-figure reveal" style={delay(100)}>
              <div className="poster-frame">
                <div className="poster-glow poster-glow--alt" />
                <Image
                  src="/assets/poster-studio-vibe.png"
                  alt="IMIN Poster Studio — pick a vibe from genre-matched aesthetic references"
                  width={1942}
                  height={1440}
                  sizes="(max-width: 700px) 92vw, 46vw"
                  loading="lazy"
                />
              </div>
              <figcaption className="poster-cap">
                <span className="poster-num">01</span>
                <span>
                  <span className="poster-cap-title">Pick a vibe</span>
                  <span className="poster-cap-sub">
                    Choose the aesthetic — IMIN defaults to one from the genre,
                    change it anytime.
                  </span>
                </span>
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      {/* VISION + FLYWHEEL */}
      <section id="future" className="section section--bordered">
        <div className="container">
          <span className="eyebrow reveal">Where this goes</span>
          <h2 className="h2 vision-h2 reveal" style={delay(60)}>
            The OS <em>and</em> the app. Both sides of the room.
          </h2>
          <p className="section-lead vision-lead reveal" style={delay(120)}>
            The organizer OS is the wedge. The consumer app is the moat.
          </p>

          <div className="pillars">
            <div className="pillar reveal">
              <span className="pillar-word">Join</span>
              <p>Find an event nearby. Find someone to go with. One tap.</p>
            </div>
            <div className="pillar reveal" style={delay(90)}>
              <span className="pillar-word">Create</span>
              <p>
                Anyone can put on a night — living-room party to club night, in
                minutes.
              </p>
            </div>
            <div className="pillar reveal" style={delay(180)}>
              <span className="pillar-word">Earn</span>
              <p>
                Host exclusive experiences and get paid. Turn a social life into
                income.
              </p>
            </div>
          </div>

          <div className="flywheel-wrap">
            <div className="flywheel-col reveal">
              <div className="flywheel">
                <span className="fw-ring" />
                <span className="fw-comet" data-ambient />
                <div className="fw-hub">
                  <strong>IMIN</strong>
                  <span>the flywheel</span>
                </div>
                <div className="fw-node fw-node--1">
                  <b>01</b>
                  <p>Organizers post events</p>
                </div>
                <div className="fw-node fw-node--2">
                  <b>02</b>
                  <p>Events fill the app</p>
                </div>
                <div className="fw-node fw-node--3">
                  <b>03</b>
                  <p>Event-goers join</p>
                </div>
                <div className="fw-node fw-node--4">
                  <b>04</b>
                  <p>Demand data flows back</p>
                </div>
                <div className="fw-node fw-node--5">
                  <b>05</b>
                  <p>Smarter ads + forecast</p>
                </div>
                <div className="fw-node fw-node--6">
                  <b>06</b>
                  <p>More organizers join</p>
                </div>
              </div>
            </div>
            <div className="moat-text reveal" style={delay(100)}>
              <p className="moat-statement">
                Every ticket sold makes the next event easier to fill. The moat
                compounds with scale — and a new entrant can&rsquo;t copy it.
              </p>
              <div className="callout">
                <span className="callout-dot" />
                <p>
                  <strong>The first node is already turning.</strong> A real
                  organizer is running events on IMIN — their buyer data is in
                  the system, training the model.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CROWD PHOTO BEAT */}
      <section className="crowd" data-crowd>
        <div className="crowd-inner">
          <span className="eyebrow eyebrow--green reveal">
            The room is full again
          </span>
          <h2 className="crowd-h2 reveal" style={delay(60)}>
            151 million people went to live music last year.
          </h2>
          <p className="crowd-sub reveal" style={delay(140)}>
            They all had to find the night somehow. IMIN is how.
          </p>
        </div>
      </section>

      {/* NUMBERS: WHY NOW + MARKET */}
      <section id="market" className="section">
        <div className="container">
          <span className="eyebrow reveal">Why now</span>
          <h2 className="h2 market-h2 reveal" style={delay(60)}>
            Four forces aligned. We&rsquo;re moving.
          </h2>
          <div className="stat-grid">
            <div className="stat-card reveal">
              <span className="stat-num">$85B</span>
              <p className="stat-body">
                Global event-ticketing market — nightlife is its biggest,
                fastest segment.
              </p>
              <cite className="stat-cite">Mordor Intelligence, 2025</cite>
            </div>
            <div className="stat-card reveal" style={delay(80)}>
              <span className="stat-num">151M</span>
              <p className="stat-body">
                Live-music fans in 2024 — a record. Demand for the real-world
                room is back.
              </p>
              <cite className="stat-cite">Live Nation FY2024</cite>
            </div>
            <div className="stat-card reveal" style={delay(160)}>
              <span className="stat-num">57%</span>
              <p className="stat-body">
                Of 18–35 Europeans feel lonely — 63% in France, our beachhead.
              </p>
              <cite className="stat-cite">eupinions 2024 · WHO 2025</cite>
            </div>
            <div className="stat-card reveal" style={delay(240)}>
              <span className="stat-num">Zero</span>
              <p className="stat-body">
                Incumbents do both sides with AI marketing underneath. DICE→Fever;
                Eventbrite sold.
              </p>
              <cite className="stat-cite">2025–2026</cite>
            </div>
          </div>

          <div className="market-strip reveal">
            <div className="market-cell">
              <span className="market-label">TAM</span>
              <span className="market-num">$85B</span>
              <p>Global event ticketing.</p>
            </div>
            <div className="market-cell">
              <span className="market-label">SAM</span>
              <span className="market-num">$5.5→21.7B</span>
              <p>EU event software · 16.5%/yr.</p>
            </div>
            <div className="market-cell">
              <span className="market-label">SOM</span>
              <span className="market-num">FR · ES · PT</span>
              <p>Independent-nightlife beachhead.</p>
            </div>
          </div>
          <p className="market-footnote reveal" style={delay(80)}>
            The category is fundable —{' '}
            <strong>Posh $64M · Fever $527M · Timeleft €18M ARR.</strong> None do
            both sides with AI underneath. We do.
          </p>
        </div>
      </section>

      {/* TRACTION */}
      <section id="traction" className="section section--bordered">
        <div className="container">
          <span className="eyebrow reveal">Built the hard way</span>
          <h2 className="h2 traction-h2 reveal" style={delay(60)}>
            Validated, not theorized.
          </h2>
          <ol className="timeline">
            <li className="timeline-item reveal">
              <span className="timeline-dot" />
              <span className="timeline-date">2024 · Web Summit</span>
              <p>Pitched in Lisbon. Two investors asked to see an MVP.</p>
            </li>
            <li className="timeline-item reveal" style={delay(50)}>
              <span className="timeline-dot" />
              <span className="timeline-date">2024 · Solo build</span>
              <p>
                No dev would commit. Bohdan taught himself and shipped the app
                alone.
              </p>
            </li>
            <li className="timeline-item reveal" style={delay(100)}>
              <span className="timeline-dot" />
              <span className="timeline-date">2025 · Web Summit</span>
              <p>Advised to focus B2B first. He pivoted — this is that direction.</p>
            </li>
            <li className="timeline-item reveal" style={delay(150)}>
              <span className="timeline-dot" />
              <span className="timeline-date">Feb 2026 · Metz</span>
              <p>
                Won the Metz Startup Challenge. Ivan joins as CTO and
                co-founder — building the full product.
              </p>
            </li>
            <li className="timeline-item timeline-item--now reveal" style={delay(200)}>
              <span className="timeline-dot" />
              <span className="timeline-date">Now · Vechirka</span>
              <p>
                First paying client — house &amp; techno, Metz. Real events live.
                The flywheel&rsquo;s first node is turning.
              </p>
            </li>
          </ol>
        </div>
      </section>

      {/* TEAM */}
      <section id="team" className="section section--bordered">
        <div className="container">
          <span className="eyebrow reveal">Who&rsquo;s building it</span>
          <h2 className="h2 team-h2 reveal" style={delay(60)}>
            A marketer, building a marketing product.
          </h2>
          <div className="team-grid">
            <div className="team-card reveal">
              <div className="team-avatar">BS</div>
              <div>
                <h3 className="team-name">
                  Bohdan Shostak{' '}
                  <span className="team-role">CEO / FOUNDER</span>
                </h3>
                <p className="team-bio">
                  Serial founder since 2016. Built and marketed companies across
                  industries, survived a war, rebuilt. Five languages.
                </p>
              </div>
            </div>
            <div className="team-card reveal" style={delay(90)}>
              <div className="team-avatar">IV</div>
              <div>
                <h3 className="team-name">
                  Ivan <span className="team-role">CTO / CO-FOUNDER</span>
                </h3>
                <p className="team-bio">
                  Full-stack engineer and the builder behind the product —
                  backend, organizer dashboard, and the AI creative tooling.
                  Owns the architecture and the shipping pace, turning the
                  market read into working software. All-in on IMIN.
                </p>
              </div>
            </div>
            <div className="team-card reveal" style={delay(180)}>
              <div className="team-avatar team-avatar--open">+</div>
              <div>
                <h3 className="team-name">
                  Growth{' '}
                  <span className="team-role">CO-FOUNDER — OPEN</span>
                </h3>
                <p className="team-bio">
                  The person who owns scaling demand is the next hire.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DUAL CTA */}
      <section id="invest" className="cta">
        <div className="cta-haze" />
        <div className="cta-grid">
          <div className="reveal">
            <span className="eyebrow">Raising our first round</span>
            <h2 className="cta-h2">
              Let&rsquo;s build
              <br />
              the night.
            </h2>
            <p className="cta-lead">
              We proved the hard side first. Now we&rsquo;re raising to build the
              consumer app and grow the organizer cohort across{' '}
              <span className="accent">France · Spain · Portugal</span>.
            </p>
            <div className="proof-chips">
              <span className="proof-chip">
                <span className="live-dot live-dot--sm live-dot--static" />
                Live product
              </span>
              <span className="proof-chip">
                <span className="live-dot live-dot--sm live-dot--static" />
                Paying client
              </span>
              <span className="proof-chip">Web Summit ×2</span>
              <span className="proof-chip">Metz winner</span>
            </div>
            <div className="cta-actions">
              <a
                href="mailto:bohdan.shostak.ua@gmail.com?subject=IMIN%20%E2%80%94%20investor%20conversation&body=Hi%20Bohdan%2C%20saw%20IMIN%20and%20would%20like%20to%20talk."
                className="btn btn--primary"
              >
                Book a call with Bohdan →
              </a>
              <span className="cta-note">
                <span className="live-dot live-dot--sm" />
                At VivaTech this week — let&rsquo;s meet there.
              </span>
            </div>
          </div>

          <div id="access" className="access-card reveal" style={delay(100)}>
            <span className="access-eyebrow">For organizers</span>
            <h3 className="access-h3">Run your next night on IMIN.</h3>
            <p className="access-sub">
              We&rsquo;re admitting a small founding cohort across FR · ES · PT.
              Every application is read by hand — expect a reply within 48 hours.
            </p>
            {submitted ? (
              <div className="access-ok">
                <p className="access-ok-title">You&rsquo;re on the list.</p>
                <p>
                  We review every application by hand. If it&rsquo;s a fit,
                  you&rsquo;ll hear from us within 48 hours.
                </p>
              </div>
            ) : (
              <form
                id="accessForm"
                className="access-form"
                noValidate
                onSubmit={handleSubmit}
              >
                <div className="field">
                  <label htmlFor="f-name">Name</label>
                  <input
                    id="f-name"
                    name="name"
                    autoComplete="name"
                    placeholder="First and last"
                    className={errors.name ? 'is-invalid' : undefined}
                    value={values.name}
                    onChange={handleChange('name')}
                  />
                </div>
                <div className="field">
                  <label htmlFor="f-email">Email</label>
                  <input
                    id="f-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@yournight.com"
                    className={errors.email ? 'is-invalid' : undefined}
                    value={values.email}
                    onChange={handleChange('email')}
                  />
                </div>
                <div className="field">
                  <label htmlFor="f-city">City / country</label>
                  <input
                    id="f-city"
                    name="city"
                    placeholder="Lisbon, Portugal"
                    className={errors.city ? 'is-invalid' : undefined}
                    value={values.city}
                    onChange={handleChange('city')}
                  />
                </div>
                <div className="field">
                  <label htmlFor="f-link">Instagram or events link</label>
                  <input
                    id="f-link"
                    name="link"
                    placeholder="@yournight"
                    className={errors.link ? 'is-invalid' : undefined}
                    value={values.link}
                    onChange={handleChange('link')}
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn--primary btn--block"
                  disabled={submitting}
                >
                  {submitting ? 'Sending…' : 'Request access'}
                </button>
                {serverError ? (
                  <p
                    className="access-fine"
                    style={{ color: 'var(--red)' }}
                    role="alert"
                  >
                    {serverError}
                  </p>
                ) : (
                  <p className="access-fine">
                    Reviewed by hand. Not everyone gets in on the first ask.
                  </p>
                )}
              </form>
            )}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="container">
          <div className="footer-top">
            <div>
              <div className="footer-logo">
                <img src="/assets/logo-imin.png" alt="IMIN" />
              </div>
              <div className="footer-tagline">Join · Create · Earn</div>
            </div>
            <div className="footer-cols">
              <div className="footer-col">
                <span className="footer-col-head">Platform</span>
                <a href="#problem" className="footer-link">
                  Problem
                </a>
                <a href="#product" className="footer-link">
                  Product
                </a>
                <a href="#future" className="footer-link">
                  Vision
                </a>
              </div>
              <div className="footer-col">
                <span className="footer-col-head">Start</span>
                <a href="#access" className="footer-link">
                  Request access
                </a>
                <a href="#invest" className="footer-link">
                  For investors
                </a>
                <a
                  href="https://dashboard.imin.wtf"
                  target="_blank"
                  rel="noopener"
                  className="footer-link"
                >
                  Organizer dashboard ↗
                </a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <span>
              © 2026 IMIN — built for the people who run the night, and the
              people who live for it.
            </span>
            <span>The two-sided platform for nightlife</span>
          </div>
        </div>
      </footer>
    </>
  );
}

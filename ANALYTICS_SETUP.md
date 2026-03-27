# Analytics Setup Guide

This document covers how to configure and use analytics for IMIN (imin.wtf).

## Overview

The analytics system supports two providers:
- **Plausible** - Privacy-friendly, lightweight, no cookie consent needed
- **PostHog** - Full-featured analytics with custom events and funnels

## Quick Setup

### Option 1: Plausible (Recommended)

1. Create an account at [plausible.io](https://plausible.io)
2. Add your domain: `imin.wtf`
3. Copy your API key from Settings → API Keys
4. Add to your environment:

```bash
# .env.local
PLAUSIBLE_ENABLED=true
PLAUSIBLE_DOMAIN=imin.wtf
PLAUSIBLE_API_KEY=your-api-key-here
```

### Option 2: PostHog

1. Create an account at [posthog.com](https://posthog.com)
2. Create a new project
3. Copy the Project API Key
4. Add to your environment:

```bash
# .env.local
POSTHOG_ENABLED=true
POSTHOG_API_KEY=your-project-api-key
POSTHOG_HOST=https://app.posthog.com
```

## Tracking Events

### Client-Side (React Components)

```typescript
import { trackEvent, funnelEvents } from '@/lib/services/analyticsService';

// Track a button click
trackEvent(funnelEvents.BOT_START, { 
  source: 'landing_page' 
});

// Track conversion
trackEvent(funnelEvents.CONVERSION, {
  value: 99,
  currency: 'EUR'
});
```

### Server-Side (API Routes)

```typescript
import { trackServerEvent, funnelEvents } from '@/lib/services/analyticsService';

// In your API route handler
await trackServerEvent(funnelEvents.EVENT_JOIN, {
  eventId: '123',
  userId: 'user-456'
});
```

## Available Funnel Events

| Event | Description |
|-------|-------------|
| `page_view` | General page view |
| `landing_page_view` | Homepage view |
| `event_page_view` | Event details page |
| `bot_start` | User starts bot conversation |
| `bot_registration` | User completes registration |
| `event_interest` | User shows interest in event |
| `event_join` | User joins an event |
| `squad_matched` | User is matched into a squad |
| `squad_chat_created` | Squad group chat created |

## Conversion Funnel to Monitor

Recommended funnel to set up in your analytics dashboard:

1. **Landing Page View** → **Bot Start** → **Bot Registration** → **Event Join** → **Squad Matched**

## Debug Mode

Enable debug logging:

```bash
ANALYTICS_DEBUG=true
```

This will log all events to the console.

## Privacy

- Plausible is GDPR-compliant and doesn't require cookie consent
- No personal data is collected by default
- All data is anonymized

## Dashboards

Set up these key metrics in your analytics dashboard:

1. **Unique Visitors** - Total traffic
2. **Bot Registrations** - Total sign-ups
3. **Conversion Rate** - Visitors → Registrations
4. **Event Join Rate** - Registrations → Event Joins
5. **Squad Match Rate** - Joins → Matched into squads
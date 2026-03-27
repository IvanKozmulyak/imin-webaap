/**
 * Analytics Configuration
 * 
 * Supports Plausible and PostHog for conversion funnel tracking.
 * Set PLAUSIBLE_DOMAIN and PLAUSIBLE_API_KEY in environment variables.
 * 
 * For Plausible: Get your domain from plausible.io
 * For PostHog: Get your project API key from app.posthog.com
 */

export const analyticsConfig = {
  // Plausible Analytics
  plausible: {
    enabled: process.env.PLAUSIBLE_ENABLED === 'true',
    domain: process.env.PLAUSIBLE_DOMAIN || 'imin.wtf',
    apiKey: process.env.PLAUSIBLE_API_KEY,
  },
  
  // PostHog Analytics  
  posthog: {
    enabled: process.env.POSTHOG_ENABLED === 'true',
    apiKey: process.env.POSTHOG_API_KEY,
    host: process.env.POSTHOG_HOST || 'https://app.posthog.com',
  },
  
  // Debug mode - logs events to console
  debug: process.env.ANALYTICS_DEBUG === 'true',
} as const;

export type AnalyticsProvider = 'plausible' | 'posthog' | 'none';

/**
 * Get the active analytics provider based on configuration
 */
export function getActiveProvider(): AnalyticsProvider {
  if (analyticsConfig.plausible.enabled && analyticsConfig.plausible.apiKey) {
    return 'plausible';
  }
  if (analyticsConfig.posthog.enabled && analyticsConfig.posthog.apiKey) {
    return 'posthog';
  }
  return 'none';
}

/**
 * Conversion funnel events to track
 */
export const funnelEvents = {
  // Page views
  PAGE_VIEW: 'page_view',
  LANDING_PAGE_VIEW: 'landing_page_view',
  EVENT_PAGE_VIEW: 'event_page_view',
  
  // User actions
  BOT_START: 'bot_start',
  BOT_REGISTRATION: 'bot_registration',
  EVENT_INTEREST: 'event_interest',
  EVENT_JOIN: 'event_join',
  SQUAD_MATCHED: 'squad_matched',
  SQUAD_CHAT_CREATED: 'squad_chat_created',
  
  // Conversions
  CONVERSION: 'conversion',
} as const;
/**
 * Partnered Events Configuration
 * 
 * This file defines event-specific landing pages for partnered organizers.
 * Each event gets a dedicated slug (e.g., imin.wtf/e/event-name)
 * 
 * To add a new partnered event:
 * 1. Add the event configuration below
 * 2. The landing page will be available at /e/{slug}
 */

export interface PartneredEvent {
  slug: string;
  name: string;
  organizer: string;
  description: string;
  date?: string;
  venue?: string;
  location?: string;
  ticketUrl?: string;
  // Custom branding (optional overrides)
  accentColor?: string;
  logoUrl?: string;
  // Content overrides
  heroTitle?: string;
  heroSubtitle?: string;
  ctaText?: string;
  // Whether the event is active
  active: boolean;
}

/**
 * Registry of partnered events
 * Add your partnered events here
 */
export const partneredEvents: PartneredEvent[] = [
  // Example event - uncomment and customize to add more
  // {
  //   slug: 'tech-conf-2026',
  //   name: 'TechConf 2026',
  //   organizer: 'TechEvents Inc',
  //   description: 'The biggest tech conference in Paris. Don\'t go alone!',
  //   date: 'April 15, 2026',
  //   venue: 'Paris Expo',
  //   location: 'Paris, France',
  //   ticketUrl: 'https://example.com/tickets',
  //   active: true,
  // },
];

/**
 * Get event by slug
 */
export function getEventBySlug(slug: string): PartneredEvent | undefined {
  return partneredEvents.find(
    (event) => event.slug.toLowerCase() === slug.toLowerCase() && event.active
  );
}

/**
 * Get all active event slugs (for static generation if needed)
 */
export function getActiveEventSlugs(): string[] {
  return partneredEvents.filter((event) => event.active).map((event) => event.slug);
}

/**
 * Check if a slug is a valid event
 */
export function isValidEventSlug(slug: string): boolean {
  return partneredEvents.some(
    (event) => event.slug.toLowerCase() === slug.toLowerCase() && event.active
  );
}
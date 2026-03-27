/**
 * Analytics Service
 * 
 * Unified tracking interface for Plausible and PostHog.
 * Usage in client components:
 *   import { trackEvent } from '@/lib/services/analyticsService';
 *   trackEvent('bot_registration', { event_category: 'conversion' });
 * 
 * Usage in server components/API routes:
 *   import { trackServerEvent } from '@/lib/services/analyticsService';
 *   await trackServerEvent('bot_registration', { userId: '...' });
 */

import { analyticsConfig, funnelEvents, getActiveProvider } from '@/lib/constants/analytics';

// Track event on client-side (browser)
export function trackEvent(
  eventName: string, 
  props?: Record<string, string | number | boolean>
): void {
  const provider = getActiveProvider();
  
  if (analyticsConfig.debug) {
    console.log('[Analytics] Track event:', eventName, props);
  }
  
  if (provider === 'plausible') {
    trackPlausibleEvent(eventName, props);
  } else if (provider === 'posthog') {
    trackPosthogEvent(eventName, props);
  }
}

// Track event from server-side
export async function trackServerEvent(
  eventName: string,
  props?: Record<string, string | number | boolean>
): Promise<void> {
  const provider = getActiveProvider();
  
  if (analyticsConfig.debug) {
    console.log('[Analytics] Server track:', eventName, props);
  }
  
  if (provider === 'plausible') {
    await trackPlausibleServerEvent(eventName, props);
  } else if (provider === 'posthog') {
    // PostHog also supports server-side tracking
    await trackPosthogServerEvent(eventName, props);
  }
}

// Plausible client-side tracking
function trackPlausibleEvent(
  eventName: string, 
  props?: Record<string, string | number | boolean>
): void {
  if (typeof window === 'undefined') return;
  
  const plausible = (window as any).plausible;
  if (plausible) {
    if (props) {
      plausible(eventName, { props });
    } else {
      plausible(eventName);
    }
  }
}

// Plausible server-side tracking (via API)
async function trackPlausibleServerEvent(
  eventName: string,
  props?: Record<string, string | number | boolean>
): Promise<void> {
  const { domain, apiKey } = analyticsConfig.plausible;
  
  if (!apiKey) {
    console.warn('[Analytics] Plausible API key not configured');
    return;
  }
  
  try {
    const response = await fetch(`https://plausible.io/api/event`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'IMIN-Analytics/1.0',
      },
      body: JSON.stringify({
        name: eventName,
        url: `https://${domain}`,
        domain: domain,
        props: props,
      }),
    });
    
    if (!response.ok) {
      console.warn('[Analytics] Plausible API error:', response.status);
    }
  } catch (error) {
    console.error('[Analytics] Plausible tracking failed:', error);
  }
}

// PostHog client-side tracking
function trackPosthogEvent(
  eventName: string,
  props?: Record<string, string | number | boolean>
): void {
  if (typeof window === 'undefined') return;
  
  const posthog = (window as any).posthog;
  if (posthog) {
    posthog.capture(eventName, props);
  }
}

// PostHog server-side tracking
async function trackPosthogServerEvent(
  eventName: string,
  props?: Record<string, string | number | boolean>
): Promise<void> {
  const { apiKey, host } = analyticsConfig.posthog;
  
  if (!apiKey) {
    console.warn('[Analytics] PostHog API key not configured');
    return;
  }
  
  try {
    const response = await fetch(`${host}/api/capture/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: apiKey,
        event: eventName,
        properties: props,
        timestamp: new Date().toISOString(),
      }),
    });
    
    if (!response.ok) {
      console.warn('[Analytics] PostHog API error:', response.status);
    }
  } catch (error) {
    console.error('[Analytics] PostHog tracking failed:', error);
  }
}

// Helper to get the analytics script for layout
export function getAnalyticsScript(): string {
  const provider = getActiveProvider();
  
  if (provider === 'plausible') {
    return `
      <script defer data-domain="${analyticsConfig.plausible.domain}" src="https://plausible.io/js/script.js"></script>
    `;
  }
  
  if (provider === 'posthog') {
    return `
      <script>
        !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.async=!0,p.src=s.api_host+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r),e._i=[],e.init=function(t,e,o,n,p,r){p=o.createElement("script"),p.type="text/javascript",p.async=!0,p.src=s.api_host+"/static/array.js",(n=o.getElementsByTagName("script")[0]).parentNode.insertBefore(p,n),g(e,e.identify),g(e.capture),g(e.register)(t,{})},i(e)}(window,document,window.posthog||[]);
        posthog.init('${analyticsConfig.posthog.apiKey}', { api_host: '${analyticsConfig.posthog.host}' });
      </script>
    `;
  }
  
  return '';
}

export { funnelEvents };
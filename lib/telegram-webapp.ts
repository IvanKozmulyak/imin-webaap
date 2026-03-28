/**
 * Telegram WebApp Integration Utilities
 * 
 * This module provides utilities for integrating with Telegram's Mini App platform.
 * It handles initialization, theme detection, and communication with Telegram.
 * 
 * @see https://core.telegram.org/bots/webapps
 */

export interface TelegramUser {
  id: number;
  is_bot: boolean;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

export interface TelegramWebApp {
  ready: () => void;
  expand: () => void;
  close: () => void;
  sendData: (data: string) => void;
  openLink: (url: string) => void;
  openTelegramLink: (url: string) => void;
  MainButton: {
    show: () => void;
    hide: () => void;
    setText: (text: string) => void;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
    enable: () => void;
    disable: () => void;
    showProgress: (leaveActive?: boolean) => void;
    hideProgress: () => void;
  };
  BackButton: {
    show: () => void;
    hide: () => void;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
  };
  HapticFeedback: {
    impactOccurred: (style?: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
    notificationOccurred: (type: 'success' | 'warning' | 'error') => void;
    selectionChanged: () => void;
  };
  themeParams: {
    bg_color?: string;
    text_color?: string;
    hint_color?: string;
    link_color?: string;
    button_color?: string;
    button_text_color?: string;
    secondary_bg_color?: string;
  };
  colorScheme: 'light' | 'dark';
  viewportHeight: number;
  viewportStableHeight: number;
  isExpanded: boolean;
  platform: string;
  initData: string;
  initDataUnsafe: {
    query_id?: string;
    user?: TelegramUser;
    receiver?: TelegramUser;
    chat?: {
      id: number;
      type: string;
      title: string;
      username?: string;
      photo_url?: string;
    };
    start_param?: string;
    can_send_after?: number;
    auth_date?: number;
    hash?: string;
  };
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

/**
 * Initialize Telegram WebApp
 * Call this on component mount to initialize the Telegram WebApp
 */
export function initTelegramWebApp(): TelegramWebApp | null {
  if (typeof window === 'undefined') return null;
  
  const webApp = window.Telegram?.WebApp;
  
  if (webApp) {
    webApp.ready();
    webApp.expand();
    console.log('Telegram WebApp initialized:', webApp.platform);
    return webApp;
  }
  
  console.log('Telegram WebApp not detected - running in browser');
  return null;
}

/**
 * Get theme colors based on Telegram theme
 */
export function getThemeColors(webApp: TelegramWebApp | null) {
  if (!webApp) {
    // Default colors for browser fallback
    return {
      bg: '#ffffff',
      text: '#1a1a1a',
      hint: '#666666',
      link: '#007bff',
      button: '#007bff',
      buttonText: '#ffffff',
      secondary: '#f5f5f5',
      isDark: false,
    };
  }

  const { themeParams, colorScheme } = webApp;
  
  return {
    bg: themeParams.bg_color || (colorScheme === 'dark' ? '#1a1a1a' : '#ffffff'),
    text: themeParams.text_color || (colorScheme === 'dark' ? '#ffffff' : '#1a1a1a'),
    hint: themeParams.hint_color || (colorScheme === 'dark' ? '#888888' : '#666666'),
    link: themeParams.link_color || '#007bff',
    button: themeParams.button_color || '#007bff',
    buttonText: themeParams.button_text_color || '#ffffff',
    secondary: themeParams.secondary_bg_color || (colorScheme === 'dark' ? '#2a2a2a' : '#f5f5f5'),
    isDark: colorScheme === 'dark',
  };
}

/**
 * Trigger haptic feedback
 */
export function triggerHaptic(
  webApp: TelegramWebApp | null,
  type: 'impact' | 'notification' | 'selection',
  value?: string
) {
  if (!webApp?.HapticFeedback) return;
  
  if (type === 'impact') {
    webApp.HapticFeedback.impactOccurred(value as 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' || 'medium');
  } else if (type === 'notification') {
    webApp.HapticFeedback.notificationOccurred(value as 'success' | 'warning' | 'error' || 'success');
  } else {
    webApp.HapticFeedback.selectionChanged();
  }
}

/**
 * Check if running inside Telegram
 */
export function isRunningInTelegram(): boolean {
  if (typeof window === 'undefined') return false;
  return !!window.Telegram?.WebApp;
}
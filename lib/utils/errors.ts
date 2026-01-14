export class EventNotFoundException extends Error {
  constructor(eventId: string) {
    super(`Event not found with id: ${eventId}`);
    this.name = 'EventNotFoundException';
  }
}

export class DuplicateTelegramError extends Error {
  constructor(telegram: string) {
    super(`Telegram ${telegram} is already registered`);
    this.name = 'DuplicateTelegramError';
  }
}

export class IllegalArgumentException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'IllegalArgumentException';
  }
}

export class TelegramFloodWaitError extends Error {
  public readonly seconds: number;
  public readonly code: number;

  constructor(seconds: number, message?: string) {
    super(message || `Telegram flood wait: ${seconds} seconds`);
    this.name = 'TelegramFloodWaitError';
    this.seconds = seconds;
    this.code = 420;
  }
}

/**
 * Checks if an error is a Telegram flood wait error
 * @param error The error to check
 * @returns The number of seconds to wait, or null if not a flood wait error
 */
export function isTelegramFloodWaitError(error: any): number | null {
  // Check for GramJS flood wait error structure
  if (error?.code === 420 || error?.errorMessage === 'FLOOD') {
    return error.seconds || error.errorMessage?.match(/(\d+)/)?.[1] || null;
  }
  
  // Check for our custom TelegramFloodWaitError
  if (error instanceof TelegramFloodWaitError) {
    return error.seconds;
  }
  
  // Check error message for flood wait patterns
  const message = error?.message || '';
  if (message.includes('FLOOD') || message.includes('flood wait')) {
    const match = message.match(/(\d+)\s*seconds?/i);
    if (match) {
      return parseInt(match[1], 10);
    }
  }
  
  return null;
}

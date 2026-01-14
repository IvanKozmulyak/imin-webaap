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

export class EventNotFoundException extends Error {
  constructor(eventId: string) {
    super(`Event not found with id: ${eventId}`);
    this.name = 'EventNotFoundException';
  }
}

export class IllegalArgumentException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'IllegalArgumentException';
  }
}

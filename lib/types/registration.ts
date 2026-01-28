export interface EventRegistrationRequestDto {
  name: string;
  email: string;
  age: number;
  sex: string;
  languagesISpeak: string[]; // Array of language codes
  // Optional location fields collected on the registration page.
  // These are currently used on the frontend only and are not yet
  // persisted in the database.
  country?: string;
  city?: string;
}

export interface EventRegistrationResponseDto {
  id: string; // UUID
  eventId: string; // UUID
  name: string;
  email: string;
  age: number;
  sex: string;
  languagesISpeak: string[];
  createdAt: string; // ISO 8601 timestamp
  telegramInviteLink?: string | null; // Telegram invite link for the group
  // Mirrors optional request fields in case we start returning them later.
  country?: string | null;
  city?: string | null;
}

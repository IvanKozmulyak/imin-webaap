export interface EventRegistrationRequestDto {
  name: string;
  email: string;
  age: number;
  sex: string;
  languagesISpeak: string[]; // Array of language codes
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
}

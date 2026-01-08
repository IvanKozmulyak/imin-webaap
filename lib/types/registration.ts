export interface EventRegistrationRequestDto {
  name: string;
  email: string;
  telegram: string;
  age: number;
  languagesISpeak: string[]; // Array of language codes
}

export interface EventRegistrationResponseDto {
  id: string; // UUID
  eventId: string; // UUID
  name: string;
  email: string;
  telegram: string;
  age: number;
  languagesISpeak: string[];
  createdAt: string; // ISO 8601 timestamp
}

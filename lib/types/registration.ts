/** Festival join option keys */
export type FestivalJoinOption = 'pre_party' | 'class_buddies' | 'accommodation' | 'travel';

export interface EventRegistrationRequestDto {
  name: string;
  email: string;
  age: number;
  sex: string;
  languagesISpeak?: string[]; // Array of language codes (optional)
  country?: string;
  city?: string;
  // Festival registration flow (when event.useFestivalRegistration is true)
  festivalJoinOption?: FestivalJoinOption;
  travelMethod?: string;
  hasCar?: string;
  carSeatsAvailable?: number;
  accommodationPreference?: string;
  danceStyle?: string;
  danceLevel?: string;
  hasTicket?: string;
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

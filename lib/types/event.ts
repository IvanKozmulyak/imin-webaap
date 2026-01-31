export interface EventDto {
  id: string;
  name: string;
  description: string | null;
  fromDateTime: string; // ISO 8601 timestamp
  toDateTime: string; // ISO 8601 timestamp
  location: string;
  ticketUrl: string | null;
  imageUrl: string | null;
  isActive: boolean;
  useFestivalRegistration: boolean;
  createdAt: string; // ISO 8601 timestamp
}

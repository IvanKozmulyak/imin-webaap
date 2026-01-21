export interface MatchingGroupDto {
  id: string; // UUID
  eventId: string; // UUID
  languageCodes: string[]; // Common languages (intersection of all members)
  memberEmails: string[]; // Sorted list of member email addresses
  createdAt: string; // ISO 8601 timestamp
}

export interface MatchingResultDto {
  eventId: string; // UUID
  groups: MatchingGroupDto[];
  totalMatched: number;
  totalUnmatched: number;
}

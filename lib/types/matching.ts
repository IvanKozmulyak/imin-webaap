export interface MatchingGroupDto {
  id: string; // UUID
  eventId: string; // UUID
  languageCodes: string[]; // Common languages (intersection of all members)
  memberTelegrams: string[]; // Sorted list of telegram usernames
  createdAt: string; // ISO 8601 timestamp
}

export interface MatchingResultDto {
  eventId: string; // UUID
  groups: MatchingGroupDto[];
  totalMatched: number;
  totalUnmatched: number;
}

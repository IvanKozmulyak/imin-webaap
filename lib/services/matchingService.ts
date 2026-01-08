import { randomUUID } from 'crypto';
import { prisma } from '@/lib/db/client';
import { MatchingResultDto, MatchingGroupDto } from '@/lib/types/matching';
import { EventNotFoundException } from '@/lib/utils/errors';

const MAX_GROUP_SIZE = 5;
const MIN_GROUP_SIZE = 2;

interface EventRegistration {
  id: string;
  eventId: string;
  name: string;
  email: string;
  telegram: string;
  age: number;
  languagesISpeak: string[];
  createdAt: Date;
}

function calculateCommonLanguages(members: EventRegistration[]): string[] {
  if (members.length === 0) return [];
  
  // Start with first member's languages
  let commonLanguages = new Set(members[0].languagesISpeak);
  
  // Intersect with all other members' languages
  for (let i = 1; i < members.length; i++) {
    const memberLanguages = new Set(members[i].languagesISpeak);
    commonLanguages = new Set([...commonLanguages].filter(lang => memberLanguages.has(lang)));
  }
  
  // Sort for deterministic output
  return Array.from(commonLanguages).sort();
}

async function getGroupMembers(
  tx: any,
  groupId: string
): Promise<EventRegistration[]> {
  const members = await tx.matchingGroupMember.findMany({
    where: { matchingGroupId: groupId },
    include: {
      eventRegistration: {
        include: {
          languages: true,
        },
      },
    },
  });

  return members.map((m: any) => ({
    id: m.eventRegistration.id,
    eventId: m.eventRegistration.eventId,
    name: m.eventRegistration.name,
    email: m.eventRegistration.email,
    telegram: m.eventRegistration.telegram,
    age: m.eventRegistration.age,
    languagesISpeak: m.eventRegistration.languages.map((l: any) => l.languageCode),
    createdAt: m.eventRegistration.createdAt,
  }));
}

export async function performMatching(eventId: string): Promise<MatchingResultDto> {
  return await prisma.$transaction(async (tx) => {
    // 1. Verify event exists
    const event = await tx.event.findUnique({
      where: { id: eventId },
    });
    if (!event) {
      throw new EventNotFoundException(eventId);
    }

    // 2. Delete existing groups
    await tx.matchingGroup.deleteMany({
      where: { eventId },
    });

    // 3. Get all registrations
    const allRegistrationsData = await tx.eventRegistration.findMany({
      where: { eventId },
      orderBy: { id: 'asc' },
      include: {
        languages: true,
      },
    });

    const allRegistrations: EventRegistration[] = allRegistrationsData.map(reg => ({
      id: reg.id,
      eventId: reg.eventId,
      name: reg.name,
      email: reg.email,
      telegram: reg.telegram,
      age: reg.age,
      languagesISpeak: reg.languages.map(l => l.languageCode),
      createdAt: reg.createdAt,
    }));

    if (allRegistrations.length === 0) {
      return {
        eventId,
        groups: [],
        totalMatched: 0,
        totalUnmatched: 0,
      };
    }

    // 4. Build language-to-users map
    const languageToUsers = new Map<string, EventRegistration[]>();
    for (const registration of allRegistrations) {
      for (const language of registration.languagesISpeak) {
        if (!languageToUsers.has(language)) {
          languageToUsers.set(language, []);
        }
        languageToUsers.get(language)!.push(registration);
      }
    }

    // 5. Track assigned users
    const assignedUserIds = new Set<string>();

    // Helper function to calculate optimal group size to minimize unmatched
    function calculateOptimalGroupSize(remainingUsers: number): number {
      if (remainingUsers <= MAX_GROUP_SIZE) {
        // Take all if we can form a valid group
        return remainingUsers;
      }
      
      // Calculate remainder if we create full groups
      const remainder = remainingUsers % MAX_GROUP_SIZE;
      
      if (remainder === 0) {
        // Perfect division, create full groups
        return MAX_GROUP_SIZE;
      } else if (remainder >= MIN_GROUP_SIZE) {
        // Remainder can form a valid group, create full groups
        return MAX_GROUP_SIZE;
      } else {
        // Remainder is 1 (can't form valid group)
        // Redistribute: create slightly smaller groups
        // Example: 11 users -> instead of 2 groups of 5 + 1 unmatched
        // Create groups that allow all to be matched: 2 groups of 4 + 1 group of 3
        const numFullGroups = Math.floor(remainingUsers / MAX_GROUP_SIZE);
        if (numFullGroups === 0) {
          return remainingUsers;
        }
        
        // Try to redistribute: reduce group size to leave more for final group
        // Calculate: if we reduce each group by 1, we free up numFullGroups users
        // New remainder = remainder + numFullGroups
        // We want: remainder + numFullGroups >= MIN_GROUP_SIZE
        const newRemainder = remainder + numFullGroups;
        if (newRemainder >= MIN_GROUP_SIZE) {
          // Can redistribute: create groups of size MAX_GROUP_SIZE - 1
          return MAX_GROUP_SIZE - 1;
        } else {
          // Can't fully redistribute, but try to minimize unmatched
          // Create one smaller group to free up more users
          return MAX_GROUP_SIZE - 1;
        }
      }
    }

    // 6. Process each language group with smart group sizing to minimize unmatched
    const sortedLanguages = Array.from(languageToUsers.keys()).sort();
    for (const language of sortedLanguages) {
      // Get users who speak this language and haven't been assigned
      let availableUsers = languageToUsers.get(language)!
        .filter(user => !assignedUserIds.has(user.id))
        .sort((a, b) => a.id.localeCompare(b.id)); // Sort by ID for determinism
      
      // Create groups while we have enough users
      while (availableUsers.length >= MIN_GROUP_SIZE) {
        // Calculate optimal group size to minimize unmatched
        const groupSize = calculateOptimalGroupSize(availableUsers.length);
        
        const groupMembers: EventRegistration[] = [];
        
        // Select users for this group
        for (let i = 0; i < groupSize; i++) {
          const member = availableUsers.shift()!;
          groupMembers.push(member);
          assignedUserIds.add(member.id);
        }
        
        // Calculate common languages (intersection of all members' languages)
        const commonLanguages = calculateCommonLanguages(groupMembers);
        
        // Create matching group in database
        const groupId = randomUUID();
        await tx.matchingGroup.create({
          data: {
            id: groupId,
            eventId,
            createdAt: new Date(),
            languages: {
              create: commonLanguages.map(langCode => ({
                languageCode: langCode,
              })),
            },
            members: {
              create: groupMembers.map(member => ({
                eventRegistrationId: member.id,
              })),
            },
          },
        });
      }
    }

    // 7. Handle remaining unassigned users
    let unassignedUsers = allRegistrations
      .filter(user => !assignedUserIds.has(user.id))
      .sort((a, b) => a.id.localeCompare(b.id));
    
    for (const user of unassignedUsers) {
      if (assignedUserIds.has(user.id)) continue;
      
      // Find existing groups that share at least one language and have space
      const existingGroupsData = await tx.matchingGroup.findMany({
        where: { eventId },
        include: {
          languages: true,
          members: true,
        },
      });
      
      const existingGroups = existingGroupsData
        .filter(group => group.members.length < MAX_GROUP_SIZE)
        .map(group => ({
          id: group.id,
          languageCodes: group.languages.map(l => l.languageCode),
          memberCount: group.members.length,
        }));
      
      // Filter groups where user shares at least one language
      const compatibleGroups = existingGroups.filter(group => {
        return user.languagesISpeak.some(lang => group.languageCodes.includes(lang));
      });
      
      if (compatibleGroups.length > 0) {
        // Prefer fuller groups, then by ID for determinism
        const targetGroup = compatibleGroups.sort((a, b) => {
          if (b.memberCount !== a.memberCount) {
            return b.memberCount - a.memberCount;
          }
          return a.id.localeCompare(b.id);
        })[0];
        
        // Add user to group
        await tx.matchingGroupMember.create({
          data: {
            matchingGroupId: targetGroup.id,
            eventRegistrationId: user.id,
          },
        });
        
        // Recalculate common languages for the updated group
        const updatedMembers = await getGroupMembers(tx, targetGroup.id);
        const updatedCommonLanguages = calculateCommonLanguages(updatedMembers);
        
        // Delete old languages and insert new ones
        await tx.matchingGroupLanguage.deleteMany({
          where: { matchingGroupId: targetGroup.id },
        });
        await tx.matchingGroupLanguage.createMany({
          data: updatedCommonLanguages.map(langCode => ({
            matchingGroupId: targetGroup.id,
            languageCode: langCode,
          })),
        });
        
        assignedUserIds.add(user.id);
      }
    }

    // 8. Form new groups from remaining unassigned users
    unassignedUsers = allRegistrations
      .filter(user => !assignedUserIds.has(user.id))
      .sort((a, b) => a.id.localeCompare(b.id));
    
    while (unassignedUsers.length > 0) {
      const firstUser = unassignedUsers.shift()!;
      const potentialGroup = [firstUser];
      
      // Find other unassigned users who share at least one language with all current group members
      for (let i = unassignedUsers.length - 1; i >= 0 && potentialGroup.length < MAX_GROUP_SIZE; i--) {
        const candidate = unassignedUsers[i];
        const candidateLanguages = new Set(candidate.languagesISpeak);
        
        // Check if candidate shares at least one language with ALL current group members
        const canAdd = potentialGroup.every(member =>
          member.languagesISpeak.some(lang => candidateLanguages.has(lang))
        );
        
        if (canAdd) {
          potentialGroup.push(candidate);
          unassignedUsers.splice(i, 1);
        }
      }
      
      // Only create group if we have at least MIN_GROUP_SIZE users
      if (potentialGroup.length >= MIN_GROUP_SIZE) {
        const commonLanguages = calculateCommonLanguages(potentialGroup);
        const groupId = randomUUID();
        
        await tx.matchingGroup.create({
          data: {
            id: groupId,
            eventId,
            createdAt: new Date(),
            languages: {
              create: commonLanguages.map(langCode => ({
                languageCode: langCode,
              })),
            },
            members: {
              create: potentialGroup.map(member => ({
                eventRegistrationId: member.id,
              })),
            },
          },
        });
        
        for (const member of potentialGroup) {
          assignedUserIds.add(member.id);
        }
      } else {
        // Can't form a valid group, break
        break;
      }
    }

    // 9. Return results - query within transaction to see newly created groups
    const groups = await tx.matchingGroup.findMany({
      where: { eventId },
      include: {
        languages: true,
        members: {
          include: {
            eventRegistration: true,
          },
        },
      },
      orderBy: { id: 'asc' },
    });

    // Get total registrations
    const totalRegistrations = await tx.eventRegistration.count({
      where: { eventId },
    });

    const groupDtos: MatchingGroupDto[] = groups.map((group: any) => {
      const memberTelegrams = group.members
        .map((m: any) => m.eventRegistration.telegram)
        .sort();
      
      const languageCodes = group.languages
        .map((l: any) => l.languageCode)
        .sort();

      return {
        id: group.id,
        eventId: group.eventId,
        languageCodes,
        memberTelegrams,
        createdAt: group.createdAt.toISOString(),
      };
    });

    const totalMatched = groups.reduce((sum: number, group: any) => sum + group.members.length, 0);
    const totalUnmatched = totalRegistrations - totalMatched;

    return {
      eventId,
      groups: groupDtos,
      totalMatched,
      totalUnmatched,
    };
  });
}

export async function getEventGroups(eventId: string): Promise<MatchingGroupDto[]> {
  // Verify event exists
  const event = await prisma.event.findUnique({
    where: { id: eventId },
  });
  if (!event) {
    throw new EventNotFoundException(eventId);
  }

  // Get all matching groups for the event
  const groups = await prisma.matchingGroup.findMany({
    where: { eventId },
    include: {
      languages: true,
      members: {
        include: {
          eventRegistration: true,
        },
      },
    },
    orderBy: { id: 'asc' },
  });

  const groupDtos: MatchingGroupDto[] = groups.map(group => {
    const memberTelegrams = group.members
      .map(m => m.eventRegistration.telegram)
      .sort();
    
    const languageCodes = group.languages
      .map(l => l.languageCode)
      .sort();

    return {
      id: group.id,
      eventId: group.eventId,
      languageCodes,
      memberTelegrams,
      createdAt: group.createdAt.toISOString(),
    };
  });

  return groupDtos;
}

export async function getMatchingResults(eventId: string): Promise<MatchingResultDto> {
  // Verify event exists
  const event = await prisma.event.findUnique({
    where: { id: eventId },
  });
  if (!event) {
    throw new EventNotFoundException(eventId);
  }

  // Get all matching groups for the event
  const groups = await prisma.matchingGroup.findMany({
    where: { eventId },
    include: {
      languages: true,
      members: {
        include: {
          eventRegistration: true,
        },
      },
    },
    orderBy: { id: 'asc' },
  });

  // Get total registrations
  const totalRegistrations = await prisma.eventRegistration.count({
    where: { eventId },
  });

  const groupDtos: MatchingGroupDto[] = groups.map(group => {
    const memberTelegrams = group.members
      .map(m => m.eventRegistration.telegram)
      .sort();
    
    const languageCodes = group.languages
      .map(l => l.languageCode)
      .sort();

    return {
      id: group.id,
      eventId: group.eventId,
      languageCodes,
      memberTelegrams,
      createdAt: group.createdAt.toISOString(),
    };
  });

  const totalMatched = groups.reduce((sum, group) => sum + group.members.length, 0);
  const totalUnmatched = totalRegistrations - totalMatched;

  return {
    eventId,
    groups: groupDtos,
    totalMatched,
    totalUnmatched,
  };
}

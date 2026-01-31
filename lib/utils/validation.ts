import { z } from 'zod';

const festivalJoinOptionEnum = z.enum(['pre_party', 'class_buddies', 'accommodation', 'travel']);

export const eventRegistrationRequestSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Email must be valid'),
  age: z.number().int().min(1, 'Age must be positive'),
  sex: z.string().min(1, 'Sex is required'),
  languagesISpeak: z.array(z.string()).optional().default([]),
  country: z.string().max(255).optional(),
  city: z.string().max(255).optional(),
  // Festival registration flow
  festivalJoinOption: festivalJoinOptionEnum.optional(),
  travelMethod: z.string().max(50).optional(),
  hasCar: z.string().max(50).optional(),
  carSeatsAvailable: z.number().int().min(0).optional(),
  accommodationPreference: z.string().max(50).optional(),
  danceStyle: z.string().max(50).optional(),
  danceLevel: z.string().max(50).optional(),
  hasTicket: z.string().max(50).optional(),
});

export type EventRegistrationRequest = z.infer<typeof eventRegistrationRequestSchema>;

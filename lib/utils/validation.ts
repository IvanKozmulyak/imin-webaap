import { z } from 'zod';

export const eventRegistrationRequestSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Email must be valid'),
  telegram: z.string().min(1, 'Telegram is required'),
  age: z.number().int().min(1, 'Age must be positive'),
  languagesISpeak: z.array(z.string()).min(1, 'Languages I speak are required'),
});

export type EventRegistrationRequest = z.infer<typeof eventRegistrationRequestSchema>;

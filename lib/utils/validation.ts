import { z } from 'zod';

export const eventRegistrationRequestSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Email must be valid'),
  age: z.number().int().min(1, 'Age must be positive'),
  sex: z.string().min(1, 'Sex is required'),
  languagesISpeak: z.array(z.string()).min(1, 'Languages I speak are required'),
  country: z.string().max(255).optional(),
  city: z.string().max(255).optional(),
});

export type EventRegistrationRequest = z.infer<typeof eventRegistrationRequestSchema>;

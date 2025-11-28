import { z } from 'zod';

/**
 * External shape returned by your controller (tokens omitted).
 * Dates are serialized as ISO strings in HTTP responses.
 */
export const ExternalCalendarConnectionSchema = z.object({
  id: z.string().uuid(),
  provider: z.string(), // keep flexible to match Prisma enum in backend
  accountEmail: z.string().email(),
  accessTokenExpiresAt: z.string().datetime().nullable().optional(),
  calendarId: z.string().nullable().optional(),
  isPrimary: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  userId: z.string().uuid(),
});

/** PATCH body */
export const UpdateCalendarConnectionSchema = z.object({
  isPrimary: z.boolean().optional(),
  calendarId: z.string().optional(),
});

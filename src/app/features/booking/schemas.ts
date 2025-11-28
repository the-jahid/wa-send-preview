import { z } from 'zod';

/** Avoid importing @prisma/client in the browser bundle */
export const DayOfWeekEnum = z.enum([
  'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY',
]);
export type DayOfWeek = z.infer<typeof DayOfWeekEnum>;

const timeStringSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Use valid HH:MM (24h)');

export const bookingSettingsSchema = z.object({
  id: z.string().uuid().optional(),
  appointmentSlot: z.number().int().min(5).max(120)
    .refine(v => v % 5 === 0, { message: 'Slot must be multiple of 5 minutes' }),
  allowSameDayBooking: z.boolean(),
  enableNotifications: z.boolean(),
  notificationEmails: z.array(z.string().email()).max(5).default([]),
  timezone: z.string().min(1),             // IANA, validated server-side too
  agentId: z.string().uuid().optional(),
  createdAt: z.string().optional(),        // ISO strings over the wire
  updatedAt: z.string().optional(),
}).strict();

export const upsertBookingSettingsSchema = bookingSettingsSchema.omit({
  id: true, agentId: true, createdAt: true, updatedAt: true,
});

export const patchBookingSettingsSchema = upsertBookingSettingsSchema.partial().strict();

export const weeklyAvailabilityRowSchema = z.object({
  id: z.string().uuid().optional(),
  agentId: z.string().uuid().optional(),
  dayOfWeek: DayOfWeekEnum,
  startTime: timeStringSchema,
  endTime: timeStringSchema,
}).strict();

export const weeklyAvailabilityWindowSchema = z.object({
  dayOfWeek: DayOfWeekEnum,
  startTime: timeStringSchema,
  endTime: timeStringSchema,
}).strict();

export const upsertWeeklyAvailabilitySchema = z.object({
  windows: z.array(weeklyAvailabilityWindowSchema).min(1),
}).strict();

export const deleteAvailabilityAllSchema = z.object({
  mode: z.literal('all'),
}).strict();

export const deleteAvailabilityByDaySchema = z.object({
  mode: z.literal('byDay'),
  dayOfWeek: DayOfWeekEnum,
}).strict();

export const deleteAvailabilityByRangeSchema = z.object({
  mode: z.literal('byRange'),
  dayOfWeek: DayOfWeekEnum,
  startTime: timeStringSchema,
  endTime: timeStringSchema,
}).strict();

export const deleteWeeklyAvailabilitySchema = z.discriminatedUnion('mode', [
  deleteAvailabilityAllSchema,
  deleteAvailabilityByDaySchema,
  deleteAvailabilityByRangeSchema,
]);

export const assignedCalendarSchema = z.object({
  calendarConnectionId: z.string(),
  assignedAt: z.string(),
}).nullable();

export const assignCalendarResponseSchema = z.object({
  agentId: z.string(),
  calendarConnectionId: z.string(),
});

export const assignCalendarBodySchema = z.object({
  calendarConnectionId: z.string().min(1),
});

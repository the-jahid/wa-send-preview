// src/app/features/booking/types.ts
import { z } from 'zod';
import {
  bookingSettingsSchema,
  upsertBookingSettingsSchema,
  patchBookingSettingsSchema,
  weeklyAvailabilityRowSchema,
  upsertWeeklyAvailabilitySchema,
  deleteWeeklyAvailabilitySchema,
  assignedCalendarSchema,
  assignCalendarResponseSchema,
  assignCalendarBodySchema,
  // DayOfWeekEnum,  // (ok to import if you need it)
  // DO NOT export DayOfWeek again here
} from './schemas';

export type BookingSettings = z.infer<typeof bookingSettingsSchema>;
export type UpsertBookingSettingsInput = z.infer<typeof upsertBookingSettingsSchema>;
export type PatchBookingSettingsInput  = z.infer<typeof patchBookingSettingsSchema>;

export type WeeklyAvailabilityRow        = z.infer<typeof weeklyAvailabilityRowSchema>;
export type UpsertWeeklyAvailabilityInput = z.infer<typeof upsertWeeklyAvailabilitySchema>;
export type DeleteWeeklyAvailabilityInput = z.infer<typeof deleteWeeklyAvailabilitySchema>;

export type AssignedCalendar      = z.infer<typeof assignedCalendarSchema>;
export type AssignCalendarResponse = z.infer<typeof assignCalendarResponseSchema>;
export type AssignCalendarBody     = z.infer<typeof assignCalendarBodySchema>;

// ❌ remove this if you had it:
// export type DayOfWeek = z.infer<typeof DayOfWeekEnum>;

// app/features/appointment-lead-item/schemas.ts
import { z } from "zod";

export const uuid = z.string().uuid();

export const appointmentLeadItemSchema = z.object({
  id: uuid,
  agentId: uuid,
  name: z.string(),
  description: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const listResponseSchema = z.object({
  data: z.array(appointmentLeadItemSchema),
  nextCursor: z.string().uuid().optional(),
});

export const singleResponseSchema = z.object({
  data: appointmentLeadItemSchema,
});

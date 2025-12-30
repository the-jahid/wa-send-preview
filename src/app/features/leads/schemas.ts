// src/app/features/leads/schemas.ts
import { z } from 'zod';

export const LeadSchema = z.object({
  id: z.string().uuid(),
  status: z.string(),                 // backend enforces enum
  source: z.string().nullable(),
  senderPhone: z.string().nullable(),
  // FIX: provide both key & value schemas
  data: z.record(z.string(), z.any()).nullable(),
  agentId: z.string().uuid(),
  createdAt: z.string(),              // use .datetime() if your Zod supports it
  updatedAt: z.string(),
});

export const PaginatedLeadsResultSchema = z.object({
  data: z.array(LeadSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
});

// src/app/features/outbound-broadcast/schemas.ts
import { z } from 'zod';
import type {
  OutboundLeadStatus,
  OutboundLeadSortBy,
  SortOrder,
  IOutboundLead,
  QueryOutboundLeadsInput,
} from './types';

// ----------------- Helpers -----------------
export const UUID_ANY = z
  .string()
  .trim()
  // accetta qualsiasi versione UUID
  .regex(
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/,
    'Invalid UUID',
  );

export const Phone = z
  .string()
  .trim()
  .min(6, 'phoneNumber is too short')
  .max(20, 'phoneNumber is too long')
  .regex(/^\+?[0-9]{6,20}$/, 'phoneNumber must be digits with optional leading +');

export const FirstName = z.string().trim().min(1).max(120);

// ----------------- Request Schemas -----------------
export const CreateOutboundLeadSchema = z.object({
  phoneNumber: Phone,
  firstName: FirstName,
  timeZone: z.string().trim().min(1).max(64).optional(),
  status: z.string().optional() as unknown as z.ZodType<OutboundLeadStatus | undefined>,
  maxAttempts: z.coerce.number().int().min(1).max(10).optional(),
  // FIX: z.record richiede keySchema + valueSchema
  customFields: z.record(z.string(), z.any()).optional(),
});
export type CreateOutboundLeadInput = z.infer<typeof CreateOutboundLeadSchema>;

export const UpdateOutboundLeadSchema = z.object({
  phoneNumber: Phone.optional(),
  firstName: FirstName.optional(),
  timeZone: z.string().trim().min(1).max(64).optional(),
  status: z.string().optional() as unknown as z.ZodType<OutboundLeadStatus | undefined>,
  maxAttempts: z.coerce.number().int().min(1).max(10).optional(),
  // FIX: usa record(key, value) anche nel union
  customFields: z.union([z.record(z.string(), z.any()), z.null()]).optional(),
});
export type UpdateOutboundLeadInput = z.infer<typeof UpdateOutboundLeadSchema>;

export const SetLeadStatusSchema = z.object({
  status: z.string() as unknown as z.ZodType<OutboundLeadStatus>,
});
export type SetLeadStatusInput = z.infer<typeof SetLeadStatusSchema>;

export const RecordAttemptSchema = z.object({
  attemptsIncrement: z.coerce.number().int().min(1).max(10).default(1).optional(),
  lastAttemptAt: z.coerce.date().optional(),
});
export type RecordAttemptInput = z.infer<typeof RecordAttemptSchema>;

export const UpsertCustomFieldsSchema = z.object({
  mode: z.enum(['merge', 'replace']).default('merge').optional(),
  // FIX: record(key, value)
  data: z.record(z.string(), z.any()),
});
export type UpsertCustomFieldsInput = z.infer<typeof UpsertCustomFieldsSchema>;

// ----------------- Query Schema -----------------
const StatusOneOrMany = z.union([z.string(), z.array(z.string()).nonempty()]).optional();

export const QueryOutboundLeadsSchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).default(20).optional(),
    status: StatusOneOrMany,
    q: z.string().trim().min(1).max(120).optional(),
    createdFrom: z.coerce.date().optional(),
    createdTo: z.coerce.date().optional(),
    lastAttemptFrom: z.coerce.date().optional(),
    lastAttemptTo: z.coerce.date().optional(),
    sortBy: z
      .enum(['createdAt', 'lastAttemptAt', 'status', 'phoneNumber', 'firstName'] as [
        OutboundLeadSortBy,
        ...OutboundLeadSortBy[],
      ])
      .default('createdAt')
      .optional(),
    sortOrder: z.enum(['asc', 'desc'] as [SortOrder, SortOrder]).default('desc').optional(),
  })
  .refine((d) => !(d.createdFrom && d.createdTo) || d.createdFrom <= d.createdTo, {
    message: 'createdFrom must be <= createdTo',
    path: ['createdFrom'],
  })
  .refine((d) => !(d.lastAttemptFrom && d.lastAttemptTo) || d.lastAttemptFrom <= d.lastAttemptTo, {
    message: 'lastAttemptFrom must be <= lastAttemptTo',
    path: ['lastAttemptFrom'],
  });

export type SafeQueryOutboundLeadsInput = z.infer<typeof QueryOutboundLeadsSchema>;

// ----------------- Response Schema (facoltativo) -----------------
export const OutboundLeadResponseSchema: z.ZodType<IOutboundLead> = z.object({
  id: UUID_ANY,
  phoneNumber: Phone,
  firstName: z.string().nullable(),
  timeZone: z.string(),
  status: z.string(),
  attemptsMade: z.number().int(),
  maxAttempts: z.number().int(),
  lastAttemptAt: z.string().datetime().nullable(),
  outboundCampaignId: UUID_ANY,
  // FIX: record(key, value)
  customFields: z.record(z.string(), z.any()).nullable().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

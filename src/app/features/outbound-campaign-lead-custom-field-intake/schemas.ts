import { z } from 'zod';

export const UUID_ANY = z
  .string()
  .trim()
  .regex(
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/,
    'Invalid UUID'
  );

export const MachineName = z
  .string()
  .trim()
  .min(1, 'name is required')
  .max(64, 'max 64 characters')
  .regex(/^[A-Za-z][A-Za-z0-9_]*$/, 'use letters/numbers/underscore; must start with a letter');

export const CreateLeadCustomFieldIntakeSchema = z.object({
  name: MachineName,
});
export type CreateLeadCustomFieldIntakeInput = z.infer<typeof CreateLeadCustomFieldIntakeSchema>;

export const UpdateLeadCustomFieldIntakeSchema = z.object({
  name: MachineName.optional(),
});
export type UpdateLeadCustomFieldIntakeInput = z.infer<typeof UpdateLeadCustomFieldIntakeSchema>;

export const QueryLeadCustomFieldIntakesSchema = z.object({
  page: z.number().int().min(1).optional(),
  limit: z.number().int().min(1).max(100).optional(),
  q: z.string().trim().min(1).max(64).optional(),
  sortBy: z.enum(['createdAt', 'name']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

export const LeadCustomFieldIntakeSchema = z.object({
  id: UUID_ANY,
  name: MachineName,
  outboundCampaignId: UUID_ANY,
  createdAt: z.string(), // ISO
  updatedAt: z.string(), // ISO
});

export const PaginatedLeadCustomFieldIntakeSchema = z.object({
  data: z.array(LeadCustomFieldIntakeSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().min(1),
  limit: z.number().int().min(1).max(100),
});

// src/app/features/outbound-campaign-template/schemas.ts
import { z } from 'zod';

export const TemplateMediaTypeEnum = z.enum(['NONE', 'IMAGE', 'VIDEO', 'DOCUMENT']);

export const UUID = z
  .string()
  .trim()
  .regex(
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/,
    'Invalid UUID'
  );

export const NonEmpty = z.string().trim().min(1);

/* ---- Bodies ---- */
export const CreateTemplateSchema = z.object({
  agentId: UUID,
  name: NonEmpty,
  body: z.string().trim().default('Hello world').optional(),
  variables: z.array(z.string().trim()).default([]).optional(),
});

export const UpdateTemplateSchema = z.object({
  name: NonEmpty.optional(),
  body: z.string().trim().optional(),
  variables: z.array(z.string().trim()).optional(),
});

export const QueryTemplatesSchema = z.object({
  agentId: UUID,
  q: z.string().trim().optional(),
  skip: z.coerce.number().min(0).default(0).optional(),
  take: z.coerce.number().min(1).max(200).default(50).optional(),
  orderBy: z.enum(['createdAt', 'updatedAt', 'name']).default('createdAt').optional(),
  orderDir: z.enum(['asc', 'desc']).default('desc').optional(),
});

export type CreateTemplateForm = z.infer<typeof CreateTemplateSchema>;
export type UpdateTemplateForm = z.infer<typeof UpdateTemplateSchema>;
export type QueryTemplatesForm = z.infer<typeof QueryTemplatesSchema>;

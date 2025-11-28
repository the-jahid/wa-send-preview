// src/app/features/outbound_campaign/schemas.ts
import { z } from "zod";

export const UUID = z.string().uuid();

// Keep this in sync with your Prisma enum
export const OutboundCampaignStatusSchema = z.enum([
  "DRAFT",
  "SCHEDULED",
  "RUNNING",
  "COMPLETED",
  "CANCELLED",
]);

export const OutboundCampaignEntitySchema = z.object({
  id: UUID,
  name: z.string().min(2).max(200),
  status: OutboundCampaignStatusSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  agentId: UUID,
});

export const PaginatedSchema = <T extends z.ZodTypeAny>(item: T) =>
  z.object({
    items: z.array(item),
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    hasNextPage: z.boolean(),
  });

export const CreateOutboundCampaignBodySchema = z.object({
  agentId: UUID,
  name: z.string().min(2).max(200),
  status: OutboundCampaignStatusSchema.optional(),
});

export const UpdateOutboundCampaignBodySchema = z
  .object({
    name: z.string().min(2).max(200).optional(),
    status: OutboundCampaignStatusSchema.optional(),
  })
  .refine((d) => Object.keys(d).length > 0, {
    message: "Provide at least one field to update",
  });

export const SetStatusBodySchema = z.object({
  status: OutboundCampaignStatusSchema,
});

export const ListQuerySchema = z.object({
  agentId: UUID,
  status: OutboundCampaignStatusSchema.optional(),
  search: z.string().min(1).max(200).optional(),
  page: z.number().int().min(1).optional(),
  limit: z.number().int().min(1).max(100).optional(),
  sortBy: z.enum(["createdAt", "updatedAt", "name", "status"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

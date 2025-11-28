// src/app/features/outbound-broadcast/schemas.ts
import { z } from 'zod';

/* -----------------------------------------------------------------------------
 * Status enum (mirrors server)
 * ---------------------------------------------------------------------------*/
export const BroadcastStatusEnum = z.enum([
  'DRAFT',
  'READY',
  'RUNNING',
  'PAUSED',
  'COMPLETED',
  'CANCELLED',
]);
export type BroadcastStatus = z.infer<typeof BroadcastStatusEnum>;

/* -----------------------------------------------------------------------------
 * Update settings payload (frontend -> backend)
 * - Coerce numbers so UI string inputs won't 400 the API.
 * - startAt supports ISO string, Date, or null (clear).
 * - Uses single gap control: messageGapSeconds (0..86400), default 120 on server.
 * ---------------------------------------------------------------------------*/
export const UpdateOutboundBroadcastSettingsSchema = z
  .object({
    // toggles
    isEnabled: z.boolean().optional(),
    isPaused: z.boolean().optional(),

    // scheduling
    startAt: z.union([z.string(), z.date(), z.null()]).optional(),

    // single-message cadence (seconds)
    messageGapSeconds: z.coerce.number().int().min(0).max(86_400).optional(),

    // template
    selectedTemplateId: z.string().uuid().nullable().optional(),

    // manual status override (server rejects COMPLETED here)
    status: BroadcastStatusEnum.optional(),
  })
  .strict();

export type UpdateOutboundBroadcastSettingsInput = z.infer<
  typeof UpdateOutboundBroadcastSettingsSchema
>;

/* -----------------------------------------------------------------------------
 * GET /outbound-broadcast/campaigns/:campaignId/status response
 * ---------------------------------------------------------------------------*/
export const CampaignSchema = z.object({
  id: z.string().uuid(),
  agentId: z.string().uuid(),
  status: z.enum(['DRAFT', 'SCHEDULED', 'RUNNING', 'COMPLETED', 'CANCELLED']),
});

export const BroadcastSnapshotSchema = z.object({
  id: z.string().uuid(),
  isEnabled: z.boolean(),
  isPaused: z.boolean(),
  status: BroadcastStatusEnum,

  // single-gap field (seconds)
  messageGapSeconds: z.number().int().min(0).max(86_400).nullable().optional(),

  // template + metrics
  selectedTemplateId: z.string().uuid().nullable().optional(),
  totalQueued: z.number().nullable().optional(),
  totalSent: z.number().nullable().optional(),
  totalFailed: z.number().nullable().optional(),

  // scheduling & timestamps
  startAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const CountersSchema = z.object({
  queued: z.number(),
  retry: z.number(),
  inprog: z.number(),
});

export const CampaignStatusResponseSchema = z.object({
  campaign: CampaignSchema,
  broadcast: BroadcastSnapshotSchema.nullable().optional(),
  counters: CountersSchema,
});

export type CampaignStatusResponse = z.infer<typeof CampaignStatusResponseSchema>;

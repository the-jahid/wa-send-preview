// src/app/features/outbound_campaign/types.ts
import { z } from "zod";
import {
  OutboundCampaignEntitySchema,
  PaginatedSchema,
  CreateOutboundCampaignBodySchema,
  UpdateOutboundCampaignBodySchema,
  SetStatusBodySchema,
  ListQuerySchema,
  OutboundCampaignStatusSchema,
} from "./schemas";

export type OutboundCampaignStatus = z.infer<typeof OutboundCampaignStatusSchema>;
export type OutboundCampaignEntity = z.infer<typeof OutboundCampaignEntitySchema>;
export type CreateOutboundCampaignBody = z.infer<typeof CreateOutboundCampaignBodySchema>;
export type UpdateOutboundCampaignBody = z.infer<typeof UpdateOutboundCampaignBodySchema>;
export type SetStatusBody = z.infer<typeof SetStatusBodySchema>;
export type ListQuery = z.infer<typeof ListQuerySchema>;

export type PaginatedResult<T> = z.infer<ReturnType<typeof PaginatedSchema<z.ZodTypeAny>>> & {
  items: T[];
};

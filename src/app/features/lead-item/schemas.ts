import { z } from "zod";

/** ========= Shared envelope ========= */
export const apiEnvelopeBase = z.object({
  code: z.number(),
  status: z.enum(["ok", "created", "connecting", "open", "close", "error"]),
  message: z.string().optional(),
});

/** Build an envelope schema whose `data` matches <T> */
export const apiEnvelopeSchema = <T extends z.ZodTypeAny>(data: T) =>
  apiEnvelopeBase.extend({ data });

/** ========= LeadItem (ISO strings for dates) ========= */
export const leadItemSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable().optional(),
  agentId: z.string().uuid(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

/** ========= Pagination container ========= */
export const paginatedLeadItemsSchema = z.object({
  data: z.array(leadItemSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().min(1),
  limit: z.number().int().min(1),
  totalPages: z.number().int().min(1),
});

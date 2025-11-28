// src/app/features/lead-item/types.ts
import type { z } from "zod";
import {
  leadItemSchema,
  paginatedLeadItemsSchema,
  apiEnvelopeSchema,
  apiEnvelopeBase,
} from "./schemas";

/** -------- Domain types inferred from Zod -------- */
export type LeadItem = z.infer<typeof leadItemSchema>;
export type PaginatedLeadItems = z.infer<typeof paginatedLeadItemsSchema>;

/** -------- Envelope types -------- */
export type ApiStatus = z.infer<typeof apiEnvelopeBase>["status"];

/** Use this everywhere in your app when you want the *shape* */
export type ApiEnvelope<TData> = {
  code: number;
  status: ApiStatus;
  message?: string;
  data: TData;
};

/** Use this only if you need to infer directly from a Zod schema */
export type ApiEnvelopeFromSchema<TSchema extends z.ZodTypeAny> =
  z.infer<ReturnType<typeof apiEnvelopeSchema<TSchema>>>;

/** -------- DTOs / Inputs -------- */
export type CreateLeadItemInput = {
  name: string;
  description?: string | null;
  agentId: string; // UUID
};

export type UpdateLeadItemInput = Partial<Omit<CreateLeadItemInput, "agentId">>;

export type ListLeadItemsQuery = {
  page?: number; // default 1
  limit?: number; // default 10 (1..100)
  sortBy?: "name" | "description" | "createdAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
  name?: string;
  description?: string;
};

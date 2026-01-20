// src/app/features/leads/types.ts

/** Keep this a string unless you generate types from your Prisma enum. */
export type LeadStatus = string;

export type Lead = {
  id: string;
  status: LeadStatus;
  source: string | null;
  senderPhone: string | null;
  data: Record<string, any> | null;
  agentId: string;
  createdAt: string; // ISO-8601
  updatedAt: string; // ISO-8601
};

export type PaginatedLeadsResult = {
  data: Lead[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type SortOrder = 'asc' | 'desc';

export type ListLeadsQuery = Partial<{
  status: LeadStatus;
  source: string;
  sortBy: string;       // default: 'updatedAt'
  sortOrder: SortOrder; // default: 'desc'
  page: number;         // default: 1
  limit: number;        // default: 10 (max 100 backend)
  createdAfter: string | Date;
  createdBefore: string | Date;
}>;

/** ---- Auth helpers ---- */
export type TokenGetter = () => Promise<string | null>;
export type TokenLike = string | TokenGetter | null | undefined;

/** Pass this to API fetchers */
export type WithToken = { token?: TokenLike };

/** Optional AbortSignal support for fetchers */
export type WithSignal = { signal?: AbortSignal };

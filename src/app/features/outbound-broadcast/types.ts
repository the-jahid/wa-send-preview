// src/app/features/outbound-broadcast/types.ts

export type SortOrder = 'asc' | 'desc';

export type OutboundLeadSortBy =
  | 'createdAt'
  | 'lastAttemptAt'
  | 'status'
  | 'phoneNumber'
  | 'firstName';

// Evitiamo dipendenze runtime da Prisma nel client bundle.
// Se vuoi, puoi tipare strettamente con type-only import:
// export type OutboundLeadStatus = import('@prisma/client').OutboundLeadStatus;
export type OutboundLeadStatus = string;

export interface IOutboundLead {
  id: string;
  phoneNumber: string;
  firstName: string | null;
  timeZone: string;
  status: OutboundLeadStatus;

  attemptsMade: number;
  maxAttempts: number;
  lastAttemptAt: string | null; // ISO lato client

  outboundCampaignId: string;

  customFields?: Record<string, unknown> | null;

  createdAt: string; // ISO
  updatedAt: string; // ISO
}

export interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface QueryOutboundLeadsInput {
  page?: number; // default 1
  limit?: number; // default 20, max 100
  status?: OutboundLeadStatus | OutboundLeadStatus[];
  q?: string;
  createdFrom?: string | Date;
  createdTo?: string | Date;
  lastAttemptFrom?: string | Date;
  lastAttemptTo?: string | Date;
  sortBy?: OutboundLeadSortBy;
  sortOrder?: SortOrder;
}

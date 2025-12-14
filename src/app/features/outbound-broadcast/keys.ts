// src/app/features/outbound-broadcast/keys.ts
import type { QueryOutboundLeadsInput } from './types';

const root = ['outbound-broadcast'] as const;

function normalizeParams(p?: QueryOutboundLeadsInput) {
  if (!p) return {};
  // Evitiamo reattività instabile nelle chiavi
  const {
    page = 1,
    limit = 20,
    status,
    q,
    createdFrom,
    createdTo,
    lastAttemptFrom,
    lastAttemptTo,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = p;

  return {
    page,
    limit,
    status: Array.isArray(status) ? [...status].sort() : status ?? undefined,
    q: q ?? undefined,
    createdFrom: createdFrom ? new Date(createdFrom as any).toISOString() : undefined,
    createdTo: createdTo ? new Date(createdTo as any).toISOString() : undefined,
    lastAttemptFrom: lastAttemptFrom ? new Date(lastAttemptFrom as any).toISOString() : undefined,
    lastAttemptTo: lastAttemptTo ? new Date(lastAttemptTo as any).toISOString() : undefined,
    sortBy,
    sortOrder,
  };
}

export const leadKeys = {
  all: root,
  campaign: (campaignId: string) => [...root, 'campaign', campaignId] as const,
  list: (campaignId: string, params?: QueryOutboundLeadsInput) =>
    [...leadKeys.campaign(campaignId), 'list', normalizeParams(params)] as const,
  one: (leadId: string) => [...root, 'lead', leadId] as const,
};

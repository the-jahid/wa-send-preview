// src/app/features/leads/keys.ts
import type { ListLeadsQuery } from './types';

export const leadKeys = {
  all: ['leads'] as const,

  lists: () => [...leadKeys.all, 'list'] as const,
  list: (params?: ListLeadsQuery) =>
    [...leadKeys.lists(), params ?? {}] as const,

  agents: () => [...leadKeys.all, 'agent'] as const,
  byAgent: (agentId: string, params?: ListLeadsQuery) =>
    [...leadKeys.agents(), agentId, params ?? {}] as const,

  details: () => [...leadKeys.all, 'detail'] as const,
  detail: (leadId: string, agentId: string) =>
    [...leadKeys.details(), leadId, agentId] as const,
};

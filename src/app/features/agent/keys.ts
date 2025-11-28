// ----------------------------------------------
// src/features/agent/keys.ts
// TanStack Query Keys (stable, nested, typed)
// ----------------------------------------------
import type { ListAgentsQuery } from './types';

export const agentKeys = {
  // root
  all: ['agents'] as const,

  // ----- generic lists (current user) -----
  lists: () => [...agentKeys.all, 'list'] as const,
  list: (params?: ListAgentsQuery) =>
    [...agentKeys.lists(), { params }] as const,

  // ----- user-scoped lists (/agents/user/:userId) -----
  byUser: (userId: string) => [...agentKeys.all, 'user', userId] as const,
  listsByUser: (userId: string) =>
    [...agentKeys.byUser(userId), 'list'] as const,
  listByUser: (userId: string, params?: ListAgentsQuery) =>
    [...agentKeys.listsByUser(userId), { params }] as const,

  // ----- details -----
  details: () => [...agentKeys.all, 'detail'] as const,
  detail: (id: string) => [...agentKeys.details(), id] as const,

  // ----- model option buckets -----
  models: () => [...agentKeys.all, 'models'] as const,
  allModels: () => [...agentKeys.models(), 'all'] as const,
  providers: () => [...agentKeys.models(), 'providers'] as const,
  openai: () => [...agentKeys.models(), 'openai'] as const,
  gemini: () => [...agentKeys.models(), 'gemini'] as const,
  claude: () => [...agentKeys.models(), 'claude'] as const,
};

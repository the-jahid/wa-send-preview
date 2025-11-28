// src/app/features/outbound-campaign-template/keys.ts
import type { ListTemplatesRequest } from './types';

export const TEMPLATE_KEYS = {
  all: ['templates'] as const,

  list: (agentId: string, params?: ListTemplatesRequest) => {
    // only include known keys in a stable order to keep the query key deterministic
    const p =
      params
        ? {
            q: params.q ?? undefined,
            skip: params.skip ?? undefined,
            take: params.take ?? undefined,
            orderBy: params.orderBy ?? undefined,
            orderDir: params.orderDir ?? undefined,
          }
        : undefined;

    return [...TEMPLATE_KEYS.all, 'list', agentId, p] as const;
  },

  detail: (id: string) => [...TEMPLATE_KEYS.all, 'detail', id] as const,

  // optional: separate cache key for media (if you ever query it with react-query)
  media: (id: string) => [...TEMPLATE_KEYS.detail(id), 'media'] as const,
};

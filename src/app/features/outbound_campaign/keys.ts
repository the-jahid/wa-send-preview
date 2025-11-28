// src/app/features/outbound_campaign/keys.ts
export const ocKeys = {
  all: ["outbound-campaigns"] as const,
  list: (params?: Record<string, unknown>) => [...ocKeys.all, "list", params] as const,
  detail: (id: string) => [...ocKeys.all, "detail", id] as const,
};

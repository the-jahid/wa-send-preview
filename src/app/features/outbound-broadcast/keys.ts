// src/app/features/outbound-broadcast/keys.ts
import type { QueryClient, QueryKey } from '@tanstack/react-query';

export const obKeys = {
  /** Root key for everything in this feature */
  root: ['outbound-broadcast'] as const,

  /** Service health (GET /outbound-broadcast/health) */
  health: () => ['outbound-broadcast', 'health'] as const,

  /** Group all queries for a campaign under one branch */
  campaign: (campaignId: string) =>
    ['outbound-broadcast', 'campaign', campaignId] as const,

  /** GET /outbound-broadcast/campaigns/:campaignId/status */
  status: (campaignId: string) =>
    ['outbound-broadcast', 'campaign', campaignId, 'status'] as const,

  /** GET /outbound-broadcast/agents/:agentId/campaigns/:campaignId (overview alias) */
  overview: (agentId: string, campaignId: string) =>
    ['outbound-broadcast', 'campaign', campaignId, 'overview', agentId] as const,

  /** Focus key for selectedTemplateId (handy if you split template picker state) */
  template: (campaignId: string) =>
    ['outbound-broadcast', 'campaign', campaignId, 'template'] as const,

  /** Focus key for messageGapSeconds editor/state */
  gap: (campaignId: string) =>
    ['outbound-broadcast', 'campaign', campaignId, 'gap'] as const,

  /** Cron utilities (optional, mostly for mutation keys) */
  cron: {
    root: ['outbound-broadcast', 'cron'] as const,
    runOnce: () => ['outbound-broadcast', 'cron', 'run-once'] as const,
  },
} as const;

/* ------------------- Small helpers for invalidation ------------------- */

export function invalidateStatus(qc: QueryClient, campaignId: string) {
  return qc.invalidateQueries({ queryKey: obKeys.status(campaignId) });
}

export function invalidateOverview(
  qc: QueryClient,
  agentId: string,
  campaignId: string
) {
  return qc.invalidateQueries({
    queryKey: obKeys.overview(agentId, campaignId),
  });
}

export function invalidateTemplate(qc: QueryClient, campaignId: string) {
  return qc.invalidateQueries({ queryKey: obKeys.template(campaignId) });
}

export function invalidateGap(qc: QueryClient, campaignId: string) {
  return qc.invalidateQueries({ queryKey: obKeys.gap(campaignId) });
}

/** Invalidate everything under a campaign branch (status, overview, template, gap, etc.) */
export function invalidateCampaignAll(qc: QueryClient, campaignId: string) {
  return qc.invalidateQueries({ queryKey: obKeys.campaign(campaignId) });
}

/* ---------------------------- Narrow key type ---------------------------- */

export type OutboundBroadcastKey =
  | typeof obKeys.root
  | ReturnType<typeof obKeys.health>
  | ReturnType<typeof obKeys.campaign>
  | ReturnType<typeof obKeys.status>
  | ReturnType<typeof obKeys.overview>
  | ReturnType<typeof obKeys.template>
  | ReturnType<typeof obKeys.gap>
  | typeof obKeys.cron.root
  | ReturnType<typeof obKeys.cron.runOnce>;

/** Type guard to check a QueryKey belongs to this feature */
export function isOutboundBroadcastKey(key: QueryKey): boolean {
  return Array.isArray(key) && key[0] === obKeys.root[0];
}

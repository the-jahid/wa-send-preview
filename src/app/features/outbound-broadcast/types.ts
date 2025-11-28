// src/app/features/outbound-broadcast/types.ts

/* -------------------------------- Enums -------------------------------- */

export type BroadcastStatus =
  | 'DRAFT'
  | 'READY'
  | 'RUNNING'
  | 'PAUSED'
  | 'COMPLETED'
  | 'CANCELLED';

export type OutboundCampaignStatus =
  | 'DRAFT'
  | 'SCHEDULED'
  | 'RUNNING'
  | 'COMPLETED'
  | 'CANCELLED';

export type TemplateMediaType = 'NONE' | 'IMAGE' | 'VIDEO' | 'AUDIO' | 'DOCUMENT';

/** For the settings API: server forbids COMPLETED as a manual override */
export type ManualBroadcastStatus = Exclude<BroadcastStatus, 'COMPLETED'>;

/* --------------------- GET /campaigns/:campaignId/status -------------------- */

export interface CampaignStatusResponse {
  campaign: {
    id: string;
    agentId: string;
    status: OutboundCampaignStatus;
  };
  broadcast: {
    id: string;
    isEnabled: boolean;
    isPaused: boolean;
    status: BroadcastStatus;
    startAt: string | null;
    /** Gap between consecutive messages (seconds) */
    messageGapSeconds: number | null;
    selectedTemplateId: string | null;
    totalQueued: number | null;
    totalSent: number | null;
    totalFailed: number | null;
    createdAt: string;
    updatedAt: string;
  } | null;
  counters: {
    queued: number;
    retry: number;
    inprog: number;
  };
}

/* --------------------------- Shared run summary --------------------------- */

export interface RunSummary {
  processed: number;
  sent: number;
  failed: number;
  skipped: number;
}

/* --------------------------------- Start --------------------------------- */

export interface StartCampaignResponse extends RunSummary {
  status: 'RUNNING';
}

/* --------------------------------- Pause --------------------------------- */

export interface PauseCampaignResponse {
  campaignId: string;
  broadcastId: string;
  status: 'PAUSED';
}

/* -------------------------------- Resume --------------------------------- */

export type ResumeCampaignResponse =
  | { campaignId: string; broadcastId: string; status: 'READY' }
  | ({ campaignId: string; broadcastId: string; status: 'RUNNING' } & RunSummary);

/* ----------------------- Update settings: payload ------------------------ */

export interface UpdateBroadcastSettingsBody {
  isEnabled?: boolean;
  isPaused?: boolean;
  startAt?: string | Date | null;
  /** Gap between consecutive messages (seconds). Server default: 120 */
  messageGapSeconds?: number;
  selectedTemplateId?: string | null;
  status?: ManualBroadcastStatus; // cannot be COMPLETED
}

/* -------------------- Update settings: normalized response ------------------- */

export interface UpdatedBroadcastSettings {
  id: string;
  isEnabled: boolean;
  isPaused: boolean;
  status: BroadcastStatus;
  startAt: string | null;
  messageGapSeconds: number | null;
  selectedTemplateId: string | null;
  totalQueued?: number | null; // may be present when service refreshes counters
  totalSent?: number | null;
  totalFailed?: number | null;
  createdAt?: string;
  updatedAt?: string;
}

/** Server sometimes includes a run summary when the update transitions to RUNNING */
export interface UpdateBroadcastSettingsResponse {
  updated: UpdatedBroadcastSettings;
  runSummary?: RunSummary;
}

/* ------------------------------- Type guards ------------------------------ */

/** Narrow a Resume response that actually started a pass */
export function isRunningResume(
  r: ResumeCampaignResponse
): r is { campaignId: string; broadcastId: string; status: 'RUNNING' } & RunSummary {
  return r.status === 'RUNNING';
}

/** Detect if update response includes runSummary */
export function hasRunSummary(
  r: UpdateBroadcastSettingsResponse
): r is { updated: UpdatedBroadcastSettings; runSummary: RunSummary } {
  return !!(r as any)?.runSummary;
}

/* ------------------------------ Small helpers ----------------------------- */

/**
 * Normalize a settings payload before sending:
 * - coerce Date to ISO string
 * - allow undefined to mean "do not send"
 * - allow null for clearing startAt / selectedTemplateId
 */
export function normalizeUpdatePayload(
  body: UpdateBroadcastSettingsBody
): Record<string, unknown> {
  const out: Record<string, unknown> = { ...body };

  if ('startAt' in out) {
    const v = out.startAt as UpdateBroadcastSettingsBody['startAt'];
    out.startAt =
      v == null ? null : typeof v === 'string' ? v : (v as Date).toISOString();
  }

  return out;
}

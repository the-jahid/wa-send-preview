// src/app/features/outbound-broadcast/query.ts
'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { obKeys, invalidateCampaignAll } from './keys';
import {
  apiGetBroadcastStatus,
  apiGetCampaignOverview,
  apiPauseBroadcast,
  apiResumeBroadcast,
  apiRunCronOnce,
  apiStartBroadcast,
  apiUpdateBroadcastSettings,
  apiSetBroadcastTemplate,
  apiClearBroadcastTemplate,
} from './apis';
import type {
  CampaignStatusResponse,
  PauseCampaignResponse,
  ResumeCampaignResponse,
  StartCampaignResponse,
  UpdateBroadcastSettingsBody,
  UpdateBroadcastSettingsResponse,
} from './types';

import { useApiToken } from '@/lib/api-token-provider';

/* -------------------------------- utils -------------------------------- */
const nonEmpty = (v?: string | null): v is string =>
  typeof v === 'string' && v.trim().length > 0;

/* ------------------------------ useQuery ------------------------------- */

/** Agent-agnostic status route */
export function useBroadcastStatus(
  campaignId: string,
  options?: { enabled?: boolean },
) {
  const getToken = useApiToken();
  const enabled = (options?.enabled ?? true) && nonEmpty(campaignId);

  return useQuery<CampaignStatusResponse>({
    queryKey: obKeys.status(campaignId),
    queryFn: () => apiGetBroadcastStatus(getToken, campaignId),
    enabled,
    // staleTime: 5_000,
    // refetchOnWindowFocus: false,
  });
}

/** Agent-scoped overview (alias of status on the server, but useful for path-validated fetch) */
export function useCampaignOverview(
  agentId: string | undefined,
  campaignId: string,
  options?: { enabled?: boolean },
) {
  const getToken = useApiToken();
  const enabled = (options?.enabled ?? true) && nonEmpty(agentId) && nonEmpty(campaignId);

  return useQuery<CampaignStatusResponse>({
    queryKey: nonEmpty(agentId)
      ? obKeys.overview(agentId, campaignId)
      : (['skip'] as const), // prevents key collision if agentId missing
    queryFn: () => apiGetCampaignOverview(getToken, agentId!, campaignId),
    enabled,
  });
}

/* ----------------------------- useMutations ---------------------------- */

export function useStartBroadcast(agentId: string, campaignId: string) {
  const getToken = useApiToken();
  const qc = useQueryClient();

  return useMutation<StartCampaignResponse, Error, void>({
    mutationKey: [...obKeys.status(campaignId), 'start'],
    mutationFn: () => {
      if (!nonEmpty(agentId) || !nonEmpty(campaignId)) {
        return Promise.reject(new Error('agentId and campaignId are required'));
      }
      return apiStartBroadcast(getToken, agentId, campaignId);
    },
    onSuccess: async () => {
      await invalidateCampaignAll(qc, campaignId);
    },
  });
}

export function usePauseBroadcast(agentId: string, campaignId: string) {
  const getToken = useApiToken();
  const qc = useQueryClient();

  return useMutation<PauseCampaignResponse, Error, void>({
    mutationKey: [...obKeys.status(campaignId), 'pause'],
    mutationFn: () => {
      if (!nonEmpty(agentId) || !nonEmpty(campaignId)) {
        return Promise.reject(new Error('agentId and campaignId are required'));
      }
      return apiPauseBroadcast(getToken, agentId, campaignId);
    },
    onSuccess: async () => {
      await invalidateCampaignAll(qc, campaignId);
    },
  });
}

export function useResumeBroadcast(agentId: string, campaignId: string) {
  const getToken = useApiToken();
  const qc = useQueryClient();

  return useMutation<ResumeCampaignResponse, Error, void>({
    mutationKey: [...obKeys.status(campaignId), 'resume'],
    mutationFn: () => {
      if (!nonEmpty(agentId) || !nonEmpty(campaignId)) {
        return Promise.reject(new Error('agentId and campaignId are required'));
      }
      return apiResumeBroadcast(getToken, agentId, campaignId);
    },
    onSuccess: async () => {
      await invalidateCampaignAll(qc, campaignId);
    },
  });
}

export function useUpdateBroadcastSettings(agentId: string, campaignId: string) {
  const getToken = useApiToken();
  const qc = useQueryClient();

  return useMutation<
    UpdateBroadcastSettingsResponse,
    Error,
    UpdateBroadcastSettingsBody
  >({
    mutationKey: [...obKeys.status(campaignId), 'update-settings'],
    mutationFn: (body) => {
      if (!nonEmpty(agentId) || !nonEmpty(campaignId)) {
        return Promise.reject(new Error('agentId and campaignId are required'));
      }
      // NOTE: apis.ts preserves startAt=null for clearing; supports messageGapSeconds
      return apiUpdateBroadcastSettings(getToken, agentId, campaignId, body);
    },
    onSuccess: async () => {
      await invalidateCampaignAll(qc, campaignId);
    },
  });
}

/** Set selectedTemplateId via dedicated endpoint */
export function useSetBroadcastTemplate(agentId: string, campaignId: string) {
  const getToken = useApiToken();
  const qc = useQueryClient();

  return useMutation<
    UpdateBroadcastSettingsResponse,
    Error,
    { templateId: string }
  >({
    mutationKey: [...obKeys.template(campaignId), 'set'],
    mutationFn: ({ templateId }) => {
      if (!nonEmpty(agentId) || !nonEmpty(campaignId) || !nonEmpty(templateId)) {
        return Promise.reject(new Error('agentId, campaignId and templateId are required'));
      }
      return apiSetBroadcastTemplate(getToken, agentId, campaignId, templateId);
    },
    onSuccess: async () => {
      await invalidateCampaignAll(qc, campaignId);
    },
  });
}

/** Clear selectedTemplateId via dedicated endpoint */
export function useClearBroadcastTemplate(agentId: string, campaignId: string) {
  const getToken = useApiToken();
  const qc = useQueryClient();

  return useMutation<UpdateBroadcastSettingsResponse, Error, void>({
    mutationKey: [...obKeys.template(campaignId), 'clear'],
    mutationFn: () => {
      if (!nonEmpty(agentId) || !nonEmpty(campaignId)) {
        return Promise.reject(new Error('agentId and campaignId are required'));
      }
      return apiClearBroadcastTemplate(getToken, agentId, campaignId);
    },
    onSuccess: async () => {
      await invalidateCampaignAll(qc, campaignId);
    },
  });
}

/** Convenience: update only the message gap (seconds) */
export function useSetBroadcastGap(agentId: string, campaignId: string) {
  const getToken = useApiToken();
  const qc = useQueryClient();

  return useMutation<
    UpdateBroadcastSettingsResponse,
    Error,
    { seconds: number }
  >({
    mutationKey: [...obKeys.status(campaignId), 'set-gap'],
    mutationFn: ({ seconds }) => {
      if (!nonEmpty(agentId) || !nonEmpty(campaignId)) {
        return Promise.reject(new Error('agentId and campaignId are required'));
      }
      if (!Number.isFinite(seconds) || seconds < 0 || seconds > 86_400) {
        return Promise.reject(new Error('seconds must be between 0 and 86400'));
      }
      return apiUpdateBroadcastSettings(getToken, agentId, campaignId, {
        messageGapSeconds: seconds,
      });
    },
    onSuccess: async () => {
      await invalidateCampaignAll(qc, campaignId);
    },
  });
}

export function useCronRunOnce() {
  const getToken = useApiToken();
  return useMutation<{ ok: true }, Error, void>({
    mutationKey: ['outbound-broadcast', 'cron', 'run-once'],
    mutationFn: () => apiRunCronOnce(getToken),
  });
}

/* ----------------------- Derived helpers for UI ----------------------- */

export function isBroadcastRunning(status?: CampaignStatusResponse) {
  return status?.campaign.status === 'RUNNING' && status?.broadcast?.status === 'RUNNING';
}

export function isBroadcastPaused(status?: CampaignStatusResponse) {
  return status?.broadcast?.status === 'PAUSED';
}

export function canStart(status?: CampaignStatusResponse) {
  // allow when no broadcast yet, or in these terminal/intermediate states
  if (!status?.broadcast) return true;
  return ['DRAFT', 'READY', 'PAUSED', 'CANCELLED', 'COMPLETED'].includes(status.broadcast.status);
}

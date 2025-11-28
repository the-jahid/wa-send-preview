// src/app/features/outbound_campaign/query.ts
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useApiToken } from "@/lib/api-token-provider";
import {
  apiCreateCampaign,
  apiDeleteCampaign,
  apiGetCampaign,
  apiListCampaigns,
  apiSetCampaignStatus,
  apiUpdateCampaign,
} from "./apis";
import { ocKeys } from "./keys";
import type {
  CreateOutboundCampaignBody,
  ListQuery,
  OutboundCampaignEntity,
  SetStatusBody,
  UpdateOutboundCampaignBody,
} from "./types";

/* ------------------------------ Queries ------------------------------ */

export function useCampaigns(params: ListQuery, options?: { enabled?: boolean }) {
  const getToken = useApiToken();
  return useQuery({
    queryKey: ocKeys.list(params),
    queryFn: () => apiListCampaigns(getToken, params),
    enabled: options?.enabled ?? true,
  });
}

export function useCampaign(id: string, agentId?: string, options?: { enabled?: boolean }) {
  const getToken = useApiToken();
  return useQuery({
    queryKey: ocKeys.detail(id),
    queryFn: () => apiGetCampaign(getToken, id, agentId),
    enabled: (options?.enabled ?? true) && !!id,
  });
}

/* ----------------------------- Mutations ----------------------------- */

export function useCreateCampaign() {
  const qc = useQueryClient();
  const getToken = useApiToken();
  return useMutation({
    mutationFn: (body: CreateOutboundCampaignBody) => apiCreateCampaign(getToken, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ocKeys.all }),
  });
}

export function useUpdateCampaign(id: string, agentId?: string) {
  const qc = useQueryClient();
  const getToken = useApiToken();
  return useMutation({
    mutationFn: (body: UpdateOutboundCampaignBody) => apiUpdateCampaign(getToken, id, body, agentId),
    onSuccess: (data: OutboundCampaignEntity) => {
      // Refresh detail + relevant lists/KPIs
      qc.invalidateQueries({ queryKey: ocKeys.detail(id) });
      qc.invalidateQueries({ queryKey: ocKeys.all });
      if (agentId) qc.invalidateQueries({ queryKey: ocKeys.list({ agentId }) });
    },
  });
}

export function useSetCampaignStatus(id: string, agentId?: string) {
  const qc = useQueryClient();
  const getToken = useApiToken();
  return useMutation({
    mutationFn: (body: SetStatusBody) => apiSetCampaignStatus(getToken, id, body, agentId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ocKeys.detail(id) });
      qc.invalidateQueries({ queryKey: ocKeys.all });
      if (agentId) qc.invalidateQueries({ queryKey: ocKeys.list({ agentId }) });
    },
  });
}

/**
 * Flexible delete hook:
 * - If you call `useDeleteCampaign()` with NO args, pass `{ id, agentId? }` or just `id` to `mutate`.
 * - If you call `useDeleteCampaign(id, agentId?)`, you can call `mutate()` with no variables.
 */
type DeleteInput = string | { id: string; agentId?: string };

export function useDeleteCampaign(boundId?: string, boundAgentId?: string) {
  const qc = useQueryClient();
  const getToken = useApiToken();

  return useMutation({
    mutationFn: async (input?: DeleteInput) => {
      // Resolve id/agentId from either the hook parameters or mutate variables
      const resolvedId =
        boundId ??
        (typeof input === "string" ? input : input?.id);

      const resolvedAgentId =
        boundAgentId ??
        (typeof input === "string" ? undefined : input?.agentId);

      if (!resolvedId) {
        throw new Error("Missing campaign id");
      }

      return apiDeleteCampaign(getToken, resolvedId, resolvedAgentId);
    },
    onSuccess: async (_data, variables) => {
      // Work out the agentId we should invalidate
      const vAgentId =
        boundAgentId ??
        (typeof variables === "string" ? undefined : variables?.agentId);

      // If we can infer the deleted id, also nuke its detail cache
      const deletedId =
        boundId ??
        (typeof variables === "string" ? variables : variables?.id);

      if (deletedId) {
        qc.invalidateQueries({ queryKey: ocKeys.detail(deletedId) });
      }

      // Invalidate umbrella + specific list for KPIs and list refresh
      await qc.invalidateQueries({ queryKey: ocKeys.all });
      if (vAgentId) {
        await qc.invalidateQueries({ queryKey: ocKeys.list({ agentId: vAgentId }) });
      }
    },
  });
}

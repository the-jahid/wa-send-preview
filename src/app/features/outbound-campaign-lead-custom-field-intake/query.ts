'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { leadCFIKeys } from './keys';
import {
  apiCreateLeadCFI,
  apiListLeadCFI,
  apiGetLeadCFI,
  apiUpdateLeadCFI,
  apiDeleteLeadCFI,
} from './apis';
import type {
  CreateLeadCustomFieldIntakeBody,
  UpdateLeadCustomFieldIntakeBody,
  QueryLeadCustomFieldIntakes,
  PaginatedLeadCustomFieldIntake,
  LeadCustomFieldIntake,
} from './types';
import { useApiToken } from '@/lib/api-token-provider';

// ---------- LIST ----------
export function useLeadCFIList(
  campaignId: string,
  query?: QueryLeadCustomFieldIntakes,
  options?: { enabled?: boolean }
) {
  const getToken = useApiToken();
  return useQuery<PaginatedLeadCustomFieldIntake>({
    queryKey: leadCFIKeys.list(campaignId, query),
    queryFn: () => apiListLeadCFI(campaignId, query, { getToken }),
    enabled: options?.enabled ?? true,
  });
}

// ---------- DETAIL ----------
export function useLeadCFI(id: string, options?: { enabled?: boolean }) {
  const getToken = useApiToken();
  return useQuery<LeadCustomFieldIntake>({
    queryKey: leadCFIKeys.detail(id),
    queryFn: () => apiGetLeadCFI(id, { getToken }),
    enabled: options?.enabled ?? !!id,
  });
}

// ---------- CREATE ----------
export function useCreateLeadCFI(campaignId: string) {
  const qc = useQueryClient();
  const getToken = useApiToken();

  return useMutation({
    mutationKey: leadCFIKeys.create(campaignId),
    mutationFn: (body: CreateLeadCustomFieldIntakeBody) =>
      apiCreateLeadCFI(campaignId, body, { getToken }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: leadCFIKeys.list(campaignId) });
    },
  });
}

// ---------- UPDATE ----------
export function useUpdateLeadCFI(id: string, campaignIdForInvalidate?: string) {
  const qc = useQueryClient();
  const getToken = useApiToken();

  return useMutation({
    mutationKey: leadCFIKeys.update(id),
    mutationFn: (body: UpdateLeadCustomFieldIntakeBody) =>
      apiUpdateLeadCFI(id, body, { getToken }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: leadCFIKeys.detail(id) });
      if (campaignIdForInvalidate) {
        qc.invalidateQueries({ queryKey: leadCFIKeys.list(campaignIdForInvalidate) });
      }
    },
  });
}

// ---------- DELETE ----------
export function useDeleteLeadCFI(id: string, campaignIdForInvalidate?: string) {
  const qc = useQueryClient();
  const getToken = useApiToken();

  return useMutation({
    mutationKey: leadCFIKeys.remove(id),
    mutationFn: () => apiDeleteLeadCFI(id, { getToken }),
    onSuccess: () => {
      if (campaignIdForInvalidate) {
        qc.invalidateQueries({ queryKey: leadCFIKeys.list(campaignIdForInvalidate) });
      }
    },
  });
}

// src/app/features/leads/query.ts
import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from '@tanstack/react-query';

import {
  listLeads,
  listLeadsByAgent,
  getLeadById,
  deleteLead,
} from './apis';

import { leadKeys } from './keys';
import type {
  Lead,
  PaginatedLeadsResult,
  ListLeadsQuery,
  WithToken,
} from './types';

/** -------- LIST: All leads (admin) -------- */
export function useLeads(
  params?: ListLeadsQuery,
  opts?: WithToken & {
    query?: Omit<UseQueryOptions<PaginatedLeadsResult>, 'queryKey' | 'queryFn'>;
  }
) {
  return useQuery({
    queryKey: leadKeys.list(params),
    queryFn: ({ signal }) => listLeads(params, { token: opts?.token, signal }),
    staleTime: 15_000,
    ...opts?.query,
  });
}

/** -------- LIST: By agent -------- */
export function useLeadsByAgent(
  agentId: string | undefined,
  params?: ListLeadsQuery,
  opts?: WithToken & {
    query?: Omit<UseQueryOptions<PaginatedLeadsResult>, 'queryKey' | 'queryFn'>;
  }
) {
  return useQuery({
    enabled: Boolean(agentId),
    queryKey: agentId ? leadKeys.byAgent(agentId, params) : leadKeys.byAgent('nil', params),
    queryFn: ({ signal }) => {
      if (!agentId) throw new Error('agentId is required');
      return listLeadsByAgent(agentId, params, { token: opts?.token, signal });
    },
    staleTime: 15_000,
    ...opts?.query,
  });
}

/** -------- DETAIL: Single lead -------- */
export function useLead(
  leadId: string | undefined,
  agentId: string | undefined,
  opts?: WithToken & {
    query?: Omit<UseQueryOptions<Lead>, 'queryKey' | 'queryFn'>;
  }
) {
  return useQuery({
    enabled: Boolean(leadId && agentId),
    queryKey: leadId && agentId ? leadKeys.detail(leadId, agentId) : leadKeys.detail('nil', 'nil'),
    queryFn: ({ signal }) => {
      if (!leadId || !agentId) throw new Error('leadId and agentId are required');
      return getLeadById(leadId, agentId, { token: opts?.token, signal });
    },
    staleTime: 30_000,
    ...opts?.query,
  });
}

/** -------- MUTATION: Delete lead -------- */
export function useDeleteLead(
  opts?: WithToken & {
    mutation?: UseMutationOptions<Lead, Error, { leadId: string; agentId: string }>;
  }
) {
  const qc = useQueryClient();

  return useMutation<Lead, Error, { leadId: string; agentId: string }>({
    mutationFn: ({ leadId, agentId }) => deleteLead(leadId, agentId, { token: opts?.token }),
    onSuccess: (deleted, { agentId }) => {
      // Invalidate both global list and the agent-specific list
      qc.invalidateQueries({ queryKey: leadKeys.lists() });
      if (agentId) {
        qc.invalidateQueries({ queryKey: leadKeys.byAgent(agentId) });
      }
      // Also invalidate the specific detail cache
      qc.invalidateQueries({ queryKey: leadKeys.detail(deleted.id, deleted.agentId) });
    },
    ...opts?.mutation,
  });
}

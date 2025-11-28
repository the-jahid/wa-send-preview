// ----------------------------------------------
// src/features/agent/query.ts
// React Query hooks for Agents CRUD + model options
// ----------------------------------------------
import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from '@tanstack/react-query';

import {
  // CRUD
  createAgent,
  updateAgent,
  deleteAgent,
  getAgentById,
  listMyAgents,
  listAgentsByUser,
  // Model options
  getAllModelOptions,
  getProviders,
  getOpenAIModels,
  getGeminiModels,
  getClaudeModels,
} from './apis';

import { agentKeys } from './keys';

import type {
  CreateAgentPayload,
  UpdateAgentPayload,
  ListAgentsQuery,
  PaginatedAgentsEnvelope,
  SingleAgentEnvelope,
  AllModelOptions,
  ModelOption,
} from './types';

import { useApiToken } from '@/lib/api-token-provider';

// Local key for /agents/user/:userId (so we don't have to edit agentKeys)
const userListKey = (userId: string | undefined, params?: ListAgentsQuery) =>
  ['agents', 'listByUser', userId ?? 'missing', { params }] as const;

// ----------------------------------------------
// Queries
// ----------------------------------------------

/** List the current user's agents (paginated + filterable) */
export function useAgents(
  params?: ListAgentsQuery,
  opts?: Omit<UseQueryOptions<PaginatedAgentsEnvelope>, 'queryKey' | 'queryFn'>,
) {
  const getToken = useApiToken(); // returns Promise<string | null>
  return useQuery({
    queryKey: agentKeys.list(params),
    queryFn: async () => {
      const token = (await getToken()) ?? undefined;
      return listMyAgents(params, { token });
    },
    placeholderData: (prev) => prev as PaginatedAgentsEnvelope | undefined,
    staleTime: 30_000,
    ...(opts || {}),
  });
}

/** List agents for a specific user (403 if userId !== me) */
export function useAgentsByUser(
  userId: string | undefined,
  params?: ListAgentsQuery,
  opts?: Omit<UseQueryOptions<PaginatedAgentsEnvelope>, 'queryKey' | 'queryFn' | 'enabled'>,
) {
  const getToken = useApiToken();
  return useQuery({
    queryKey: userListKey(userId, params),
    queryFn: async () => {
      const token = (await getToken()) ?? undefined;
      return listAgentsByUser(userId as string, params, { token });
    },
    enabled: Boolean(userId),
    placeholderData: (prev) => prev as PaginatedAgentsEnvelope | undefined,
    staleTime: 30_000,
    ...(opts || {}),
  });
}

/** Get a single agent by ID */
export function useAgent(
  id: string | undefined,
  opts?: Omit<UseQueryOptions<SingleAgentEnvelope>, 'queryKey' | 'queryFn' | 'enabled'>,
) {
  const getToken = useApiToken();
  return useQuery({
    queryKey: agentKeys.detail(id || 'missing'),
    queryFn: async () => {
      const token = (await getToken()) ?? undefined;
      return getAgentById(id as string, { token });
    },
    enabled: Boolean(id),
    staleTime: 30_000,
    ...(opts || {}),
  });
}

/** All model options in one shot (providers + modelsByProvider) */
export function useModelOptions(
  opts?: Omit<UseQueryOptions<AllModelOptions>, 'queryKey' | 'queryFn'>,
) {
  const getToken = useApiToken();
  return useQuery({
    queryKey: agentKeys.models(), // <- matches your keys.ts
    queryFn: async () => {
      const token = (await getToken()) ?? undefined;
      return getAllModelOptions({ token });
    },
    staleTime: 5 * 60_000,
    ...(opts || {}),
  });
}

/** Provider options (AIModel enum) */
export const useProviders = (
  opts?: Omit<UseQueryOptions<ModelOption[]>, 'queryKey' | 'queryFn'>,
) => {
  const getToken = useApiToken();
  return useQuery({
    queryKey: agentKeys.providers(),
    queryFn: async () => {
      const token = (await getToken()) ?? undefined;
      return getProviders({ token });
    },
    staleTime: 5 * 60_000,
    ...(opts || {}),
  });
};

/** OpenAI model options */
export const useOpenAIModels = (
  opts?: Omit<UseQueryOptions<ModelOption[]>, 'queryKey' | 'queryFn'>,
) => {
  const getToken = useApiToken();
  return useQuery({
    queryKey: agentKeys.openai(),
    queryFn: async () => {
      const token = (await getToken()) ?? undefined;
      return getOpenAIModels({ token });
    },
    staleTime: 5 * 60_000,
    ...(opts || {}),
  });
};

/** Gemini model options */
export const useGeminiModels = (
  opts?: Omit<UseQueryOptions<ModelOption[]>, 'queryKey' | 'queryFn'>,
) => {
  const getToken = useApiToken();
  return useQuery({
    queryKey: agentKeys.gemini(),
    queryFn: async () => {
      const token = (await getToken()) ?? undefined;
      return getGeminiModels({ token });
    },
    staleTime: 5 * 60_000,
    ...(opts || {}),
  });
};

/** Claude model options */
export const useClaudeModels = (
  opts?: Omit<UseQueryOptions<ModelOption[]>, 'queryKey' | 'queryFn'>,
) => {
  const getToken = useApiToken();
  return useQuery({
    queryKey: agentKeys.claude(),
    queryFn: async () => {
      const token = (await getToken()) ?? undefined;
      return getClaudeModels({ token });
    },
    staleTime: 5 * 60_000,
    ...(opts || {}),
  });
};

// ----------------------------------------------
// Mutations
// ----------------------------------------------

/** Create agent */
export function useCreateAgent(
  opts?: UseMutationOptions<SingleAgentEnvelope, Error, CreateAgentPayload>,
) {
  const qc = useQueryClient();
  const getToken = useApiToken();

  return useMutation({
    mutationFn: async (payload) =>
      createAgent(payload, { token: (await getToken()) ?? undefined }),
    onSuccess: (res) => {
      const id = res?.data?.id;
      if (id) qc.setQueryData(agentKeys.detail(id), res);
      qc.invalidateQueries({ queryKey: agentKeys.lists() });
      return res;
    },
    ...(opts || {}),
  });
}

/** Update agent */
export function useUpdateAgent(
  id: string,
  opts?: UseMutationOptions<SingleAgentEnvelope, Error, UpdateAgentPayload>,
) {
  const qc = useQueryClient();
  const getToken = useApiToken();

  return useMutation({
    mutationFn: async (payload) =>
      updateAgent(id, payload, { token: (await getToken()) ?? undefined }),
    onSuccess: (res) => {
      qc.setQueryData(agentKeys.detail(id), res);
      qc.invalidateQueries({ queryKey: agentKeys.lists() });
      return res;
    },
    ...(opts || {}),
  });
}

/** Delete agent */
export function useDeleteAgent(
  id: string,
  opts?: UseMutationOptions<void, Error, void>,
) {
  const qc = useQueryClient();
  const getToken = useApiToken();

  return useMutation({
    mutationFn: async () =>
      deleteAgent(id, { token: (await getToken()) ?? undefined }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: agentKeys.lists() });
      qc.removeQueries({ queryKey: agentKeys.detail(id) });
    },
    ...(opts || {}),
  });
}

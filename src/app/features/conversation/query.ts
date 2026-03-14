// conversation/query.ts
import { useQuery, UseQueryOptions, QueryKey } from "@tanstack/react-query";
import { conversationApis } from "./apis";
import type {
  ConversationList,
  Conversation,
  SentNumbersResponse,
} from "./types";
// If you already have keys defined, keep this import.
// Otherwise you can remove it or adapt it.
import { conversationKeys } from "./keys";

/* -------------------------------------------------------------------------- */
/*                     Helper type: override query options                     */
/* -------------------------------------------------------------------------- */

type QueryOpts<TData, TKey extends QueryKey = QueryKey> = Omit<
  UseQueryOptions<TData, Error, TData, TKey>,
  "queryKey" | "queryFn"
>;

/* -------------------------------------------------------------------------- */
/*                         1. Agent conversations list                         */
/* -------------------------------------------------------------------------- */

/**
 * Hook: get all conversations for a specific agent.
 * GET /conversations/agent/:agentId
 */
export function useAgentConversations(
  agentId: string | undefined,
  options?: QueryOpts<ConversationList>
) {
  return useQuery<ConversationList>({
    queryKey: conversationKeys.agent
      ? conversationKeys.agent(agentId ?? "")
      : ["conversations", "agent", agentId],
    queryFn: () => {
      if (!agentId) throw new Error("agentId is required");
      return conversationApis.getAgentConversations(agentId);
    },
    enabled: !!agentId && (options?.enabled ?? true),
    ...options,
  });
}

/* -------------------------------------------------------------------------- */
/*                        2. Agent + user conversation list                    */
/* -------------------------------------------------------------------------- */

/**
 * Hook: get conversation history between agent and a specific user JID.
 * GET /conversations/user/:agentId/:senderJid
 */
export function useUserConversations(
  params: { agentId?: string; senderJid?: string },
  options?: QueryOpts<ConversationList>
) {
  const { agentId, senderJid } = params;

  return useQuery<ConversationList>({
    queryKey: conversationKeys.user
      ? conversationKeys.user(agentId ?? "", senderJid ?? "")
      : ["conversations", "user", agentId, senderJid],
    queryFn: () => {
      if (!agentId) throw new Error("agentId is required");
      if (!senderJid) throw new Error("senderJid is required");
      return conversationApis.getUserConversations(agentId, senderJid);
    },
    enabled:
      !!agentId && !!senderJid && (options?.enabled ?? true),
    ...options,
  });
}

/* -------------------------------------------------------------------------- */
/*                              3. Conversation detail                         */
/* -------------------------------------------------------------------------- */

/**
 * Hook: get a single conversation message by ID.
 * GET /conversations/:id
 */
export function useConversation(
  id: string | undefined,
  options?: QueryOpts<Conversation>
) {
  return useQuery<Conversation>({
    queryKey: conversationKeys.detail
      ? conversationKeys.detail(id ?? "")
      : ["conversations", "detail", id],
    queryFn: () => {
      if (!id) throw new Error("id is required");
      return conversationApis.getConversationById(id);
    },
    enabled: !!id && (options?.enabled ?? true),
    ...options,
  });
}

/* -------------------------------------------------------------------------- */
/*                    4. Campaign sent numbers (outbound logs)                 */
/* -------------------------------------------------------------------------- */

/**
 * Hook: get all unique numbers that received outbound messages
 * for a given campaign.
 * GET /conversations/campaign/:campaignId/sent-numbers
 */
export function useCampaignSentNumbers(
  campaignId: string | undefined,
  options?: QueryOpts<SentNumbersResponse>
) {
  return useQuery<SentNumbersResponse>({
    queryKey: conversationKeys.campaignSentNumbers
      ? conversationKeys.campaignSentNumbers(campaignId ?? "")
      : ["conversations", "campaign", "sent-numbers", campaignId],
    queryFn: () => {
      if (!campaignId) throw new Error("campaignId is required");
      return conversationApis.getSentNumbersByCampaign(campaignId);
    },
    enabled: !!campaignId && (options?.enabled ?? true),
    ...options,
  });
}

/* -------------------------------------------------------------------------- */
/*                           5. Paused users list                              */
/* -------------------------------------------------------------------------- */

import type { PauseStatus, PausedUser, PauseUserPayload } from "./types";

/**
 * Hook: get all paused users for an agent.
 * GET /conversations/agent/:agentId/paused
 */
export function usePausedUsers(
  agentId: string | undefined,
  options?: QueryOpts<PausedUser[]>
) {
  return useQuery<PausedUser[]>({
    queryKey: conversationKeys.pausedUsers(agentId ?? ""),
    queryFn: () => {
      if (!agentId) throw new Error("agentId is required");
      return conversationApis.getPausedUsers(agentId);
    },
    enabled: !!agentId && (options?.enabled ?? true),
    ...options,
  });
}

/* -------------------------------------------------------------------------- */
/*                         6. Single user pause status                         */
/* -------------------------------------------------------------------------- */

/**
 * Hook: check if AI is paused for a specific user.
 * GET /conversations/agent/:agentId/pause/:senderJid/status
 */
export function usePauseStatus(
  params: { agentId?: string; senderJid?: string },
  options?: QueryOpts<PauseStatus>
) {
  const { agentId, senderJid } = params;

  return useQuery<PauseStatus>({
    queryKey: conversationKeys.pauseStatus(agentId ?? "", senderJid ?? ""),
    queryFn: () => {
      if (!agentId) throw new Error("agentId is required");
      if (!senderJid) throw new Error("senderJid is required");
      return conversationApis.getPauseStatus(agentId, senderJid);
    },
    enabled: !!agentId && !!senderJid && (options?.enabled ?? true),
    ...options,
  });
}

/* -------------------------------------------------------------------------- */
/*                      7. Pause user mutation                                 */
/* -------------------------------------------------------------------------- */

import { useMutation, useQueryClient } from "@tanstack/react-query";

/**
 * Mutation: pause AI for a user.
 * POST /conversations/agent/:agentId/pause/:senderJid
 */
export function usePauseUser(agentId: string) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { senderJid: string; payload: PauseUserPayload }>({
    mutationFn: ({ senderJid, payload }) => {
      return conversationApis.pauseUser(agentId, senderJid, payload);
    },
    onSuccess: (_, variables) => {
      // Invalidate pause status and paused users list
      queryClient.invalidateQueries({ queryKey: conversationKeys.pauseStatus(agentId, variables.senderJid) });
      queryClient.invalidateQueries({ queryKey: conversationKeys.pausedUsers(agentId) });
    },
  });
}

/* -------------------------------------------------------------------------- */
/*                     8. Resume user mutation                                 */
/* -------------------------------------------------------------------------- */

/**
 * Mutation: resume AI for a user.
 * DELETE /conversations/agent/:agentId/pause/:senderJid
 */
export function useResumeUser(agentId: string) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { senderJid: string }>({
    mutationFn: ({ senderJid }) => {
      return conversationApis.resumeUser(agentId, senderJid);
    },
    onSuccess: (_, variables) => {
      // Invalidate pause status and paused users list
      queryClient.invalidateQueries({ queryKey: conversationKeys.pauseStatus(agentId, variables.senderJid) });
      queryClient.invalidateQueries({ queryKey: conversationKeys.pausedUsers(agentId) });
    },
  });
}

/* -------------------------------------------------------------------------- */
/*                            Aggregated export                                */
/* -------------------------------------------------------------------------- */

export const conversationQueries = {
  useAgentConversations,
  useUserConversations,
  useConversation,
  useCampaignSentNumbers,
  usePausedUsers,
  usePauseStatus,
  usePauseUser,
  useResumeUser,
};











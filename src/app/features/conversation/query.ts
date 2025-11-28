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
/*                            Aggregated export                                */
/* -------------------------------------------------------------------------- */

export const conversationQueries = {
  useAgentConversations,
  useUserConversations,
  useConversation,
  useCampaignSentNumbers,
};















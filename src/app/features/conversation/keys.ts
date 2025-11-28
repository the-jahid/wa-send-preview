// conversation/keys.ts

/**
 * Stable React Query keys for the conversation feature.
 * Use these in useQuery / useMutation to avoid typos.
 */
export const conversationKeys = {
  /** Root key for all conversation-related queries */
  all: ["conversations"] as const,

  /** All conversations for a specific agent */
  agent: (agentId: string) =>
    ["conversations", "agent", agentId] as const,

  /** Conversation history between an agent and a specific user JID */
  user: (agentId: string, senderJid: string) =>
    ["conversations", "user", agentId, senderJid] as const,

  /** Single conversation message by ID */
  detail: (id: string) =>
    ["conversations", "detail", id] as const,

  /** All unique sent numbers for a specific campaign */
  campaignSentNumbers: (campaignId: string) =>
    ["conversations", "campaign", "sent-numbers", campaignId] as const,
};

export type ConversationKey =
  | typeof conversationKeys.all
  | ReturnType<typeof conversationKeys.agent>
  | ReturnType<typeof conversationKeys.user>
  | ReturnType<typeof conversationKeys.detail>
  | ReturnType<typeof conversationKeys.campaignSentNumbers>;




















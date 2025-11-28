// conversation/apis.ts
import { z } from "zod";
import {
  ConversationSchema,
  ConversationListSchema,
  SentNumbersResponseSchema,
} from "./schemas";
import type {
  Conversation,
  ConversationList,
  SentNumbersResponse,
} from "./types";

/* -------------------------------------------------------------------------- */
/*                                API BASE URL                                */
/* -------------------------------------------------------------------------- */

const API_BASE =
  process.env.NEXT_PUBLIC_BACKEND_API_URL ?? "http://localhost:3001";

/* -------------------------------------------------------------------------- */
/*                               HELPER: apiFetch                             */
/* -------------------------------------------------------------------------- */

async function apiFetch<T>(
  path: string,
  schema: z.ZodSchema<T>,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (!res.ok) {
    let message = `Request failed with status ${res.status}`;
    try {
      const errorBody = await res.json();
      if (errorBody?.message) {
        message = Array.isArray(errorBody.message)
          ? errorBody.message.join(", ")
          : errorBody.message;
      }
    } catch {
      // ignore JSON parse error, keep default message
    }
    throw new Error(message);
  }

  const json = await res.json();
  return schema.parse(json);
}

/* -------------------------------------------------------------------------- */
/*                          CONVERSATION API FUNCTIONS                        */
/* -------------------------------------------------------------------------- */

/**
 * Get all conversations for a specific agent.
 * GET /conversations/agent/:agentId
 */
export async function getAgentConversations(
  agentId: string
): Promise<ConversationList> {
  return apiFetch(`/conversations/agent/${agentId}`, ConversationListSchema);
}

/**
 * Get conversation history between an agent and a specific user JID.
 * GET /conversations/user/:agentId/:senderJid
 */
export async function getUserConversations(
  agentId: string,
  senderJid: string
): Promise<ConversationList> {
  const encodedJid = encodeURIComponent(senderJid);
  return apiFetch(
    `/conversations/user/${agentId}/${encodedJid}`,
    ConversationListSchema
  );
}

/**
 * Get a single conversation message by ID.
 * GET /conversations/:id
 */
export async function getConversationById(
  id: string
): Promise<Conversation> {
  return apiFetch(`/conversations/${id}`, ConversationSchema);
}

/**
 * Get all unique phone numbers that received outbound messages
 * for a given campaign.
 * GET /conversations/campaign/:campaignId/sent-numbers
 */
export async function getSentNumbersByCampaign(
  campaignId: string
): Promise<SentNumbersResponse> {
  return apiFetch(
    `/conversations/campaign/${campaignId}/sent-numbers`,
    SentNumbersResponseSchema
  );
}

/* -------------------------------------------------------------------------- */
/*                             AGGREGATED EXPORTS                             */
/* -------------------------------------------------------------------------- */

export const conversationApis = {
  getAgentConversations,
  getUserConversations,
  getConversationById,
  getSentNumbersByCampaign,
};

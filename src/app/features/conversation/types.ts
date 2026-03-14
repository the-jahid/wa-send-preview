// conversation/types.ts
import type { z } from "zod";
import { SenderTypeEnum } from "./schemas";

/* -------------------------------------------------------------------------- */
/*                             BASE TYPE EXPORTS                               */
/* -------------------------------------------------------------------------- */

/**
 * Allowed sender types (HUMAN | AI)
 */
export type SenderType = z.infer<typeof SenderTypeEnum>;

/**
 * A single Conversation record returned by the API.
 * Matches the Zod ConversationSchema.
 */
export interface Conversation {
  id: string;
  senderJid: string;
  message: string;
  senderType: SenderType;
  createdAt: string | Date;
  agentId: string;
  metadata?: unknown | null;
}

/**
 * List of conversations
 */
export type ConversationList = Conversation[];

/* -------------------------------------------------------------------------- */
/*                           CREATE PAYLOAD TYPE                               */
/* -------------------------------------------------------------------------- */

/**
 * Payload for creating a conversation message.
 * Matches CreateConversationSchema.
 */
export interface CreateConversationPayload {
  agentId: string;
  senderJid: string;
  message: string;
  senderType: SenderType;
  metadata?: unknown;
}

/* -------------------------------------------------------------------------- */
/*                         CAMPAIGN SENT NUMBERS TYPE                          */
/* -------------------------------------------------------------------------- */

/**
 * Response for GET /conversations/campaign/:campaignId/sent-numbers
 */
export interface SentNumbersResponse {
  campaignId: string;
  total: number;
  numbers: string[];
}

/* -------------------------------------------------------------------------- */
/*                          AI PAUSE/RESUME TYPES                              */
/* -------------------------------------------------------------------------- */

/**
 * Response from GET /conversations/agent/:agentId/pause/:senderJid/status
 */
export interface PauseStatus {
  isPaused: boolean;
  reason?: string | null;
  pausedAt?: string | null;
  pausedBy?: string | null;
}

/**
 * A paused user entry
 */
export interface PausedUser {
  senderJid: string;
  reason?: string | null;
  pausedAt: string;
  pausedBy?: string | null;
}

/**
 * Payload for POST /conversations/agent/:agentId/pause/:senderJid
 */
export interface PauseUserPayload {
  reason: string;
  pausedBy: string;
}

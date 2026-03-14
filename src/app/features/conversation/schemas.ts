// conversation/schemas.ts
import { z } from "zod";

/* -------------------------------------------------------------------------- */
/*                          ENUMS MIRRORING PRISMA                             */
/* -------------------------------------------------------------------------- */

export const SenderTypeEnum = z.enum(["HUMAN", "AI"]);

/* -------------------------------------------------------------------------- */
/*                         BASE CONVERSATION SCHEMA                            */
/* -------------------------------------------------------------------------- */

export const ConversationSchema = z.object({
  id: z.string(),
  senderJid: z.string(),
  message: z.string(),
  senderType: SenderTypeEnum,
  createdAt: z.string().or(z.date()), // API gives ISO string
  agentId: z.string(),
  metadata: z
    .unknown()
    .nullable()
    .optional(), // we allow any metadata JSON
});

/* -------------------------------------------------------------------------- */
/*                          LIST RESPONSE SCHEMAS                              */
/* -------------------------------------------------------------------------- */

export const ConversationListSchema = z.array(ConversationSchema);

/* -------------------------------------------------------------------------- */
/*                         CREATE CONVERSATION PAYLOAD                         */
/* -------------------------------------------------------------------------- */

export const CreateConversationSchema = z.object({
  agentId: z.string(),
  senderJid: z.string(),
  message: z.string(),
  senderType: SenderTypeEnum,
  metadata: z.unknown().optional(),
});

/* -------------------------------------------------------------------------- */
/*                       CAMPAIGN SENT NUMBERS RESPONSE                        */
/* -------------------------------------------------------------------------- */

export const SentNumbersResponseSchema = z.object({
  campaignId: z.string(),
  total: z.number(),
  numbers: z.array(z.string()),
});

/* -------------------------------------------------------------------------- */
/*                         AI PAUSE/RESUME SCHEMAS                             */
/* -------------------------------------------------------------------------- */

/**
 * Response from GET /conversations/agent/:agentId/pause/:senderJid/status
 */
export const PauseStatusSchema = z.object({
  isPaused: z.boolean(),
  reason: z.string().optional().nullable(),
  pausedAt: z.string().optional().nullable(),
  pausedBy: z.string().optional().nullable(),
});

/**
 * A single paused user entry
 */
export const PausedUserSchema = z.object({
  senderJid: z.string(),
  reason: z.string().optional().nullable(),
  pausedAt: z.string(),
  pausedBy: z.string().optional().nullable(),
});

/**
 * Response from GET /conversations/agent/:agentId/paused
 */
export const PausedUsersListSchema = z.array(PausedUserSchema);

/* -------------------------------------------------------------------------- */
/*                             EXPORT TYPES                                    */
/* -------------------------------------------------------------------------- */

export type Conversation = z.infer<typeof ConversationSchema>;
export type ConversationList = z.infer<typeof ConversationListSchema>;
export type CreateConversation = z.infer<typeof CreateConversationSchema>;
export type SentNumbersResponse = z.infer<typeof SentNumbersResponseSchema>;
export type PauseStatus = z.infer<typeof PauseStatusSchema>;
export type PausedUser = z.infer<typeof PausedUserSchema>;
export type PausedUsersList = z.infer<typeof PausedUsersListSchema>;

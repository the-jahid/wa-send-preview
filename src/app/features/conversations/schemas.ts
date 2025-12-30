// src/app/features/conversations/schemas.ts
import { z } from 'zod';

export const SenderTypeSchema = z.enum(['HUMAN', 'AI']);

export const ConversationMessageSchema = z.object({
    id: z.string().uuid(),
    senderJid: z.string(),
    message: z.string(),
    senderType: SenderTypeSchema,
    createdAt: z.string(),
    agentId: z.string().uuid(),
    metadata: z.record(z.string(), z.any()).nullable(),
});

export const ConversationMessagesArraySchema = z.array(ConversationMessageSchema);

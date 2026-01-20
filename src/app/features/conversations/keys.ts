// src/app/features/conversations/keys.ts

export const conversationKeys = {
    all: ['conversations'] as const,
    lists: () => [...conversationKeys.all, 'list'] as const,
    byAgent: (agentId: string, params?: Record<string, unknown>) =>
        [...conversationKeys.lists(), agentId, params] as const,
    detail: (messageId: string) => [...conversationKeys.all, 'detail', messageId] as const,
};

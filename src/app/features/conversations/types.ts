// src/app/features/conversations/types.ts

export type SenderType = 'HUMAN' | 'AI';

export type ConversationMessage = {
    id: string;
    senderJid: string;
    message: string;
    senderType: SenderType;
    createdAt: string;
    agentId: string;
    metadata: Record<string, any> | null;
};

export type ConversationThread = {
    senderJid: string;
    lastMessage: string;
    lastMessageTime: string;
    messages: ConversationMessage[];
    unreadCount: number;
};

export type ListConversationsQuery = Partial<{
    page: number;
    limit: number;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
}>;

/** ---- Auth helpers ---- */
export type TokenGetter = () => Promise<string | null>;
export type TokenLike = string | TokenGetter | null | undefined;
export type WithToken = { token?: TokenLike };
export type WithSignal = { signal?: AbortSignal };

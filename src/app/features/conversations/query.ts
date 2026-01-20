// src/app/features/conversations/query.ts
import {
    useQuery,
    type UseQueryOptions,
} from '@tanstack/react-query';

import { listConversationsByAgent } from './apis';
import { conversationKeys } from './keys';
import type {
    ConversationMessage,
    ListConversationsQuery,
    WithToken,
} from './types';

/** -------- LIST: By agent -------- */
export function useConversationsByAgent(
    agentId: string | undefined,
    params?: ListConversationsQuery,
    opts?: WithToken & {
        query?: Omit<UseQueryOptions<ConversationMessage[]>, 'queryKey' | 'queryFn'>;
    }
) {
    return useQuery({
        enabled: Boolean(agentId),
        queryKey: agentId ? conversationKeys.byAgent(agentId, params) : conversationKeys.byAgent('nil', params),
        queryFn: ({ signal }) => {
            if (!agentId) throw new Error('agentId is required');
            return listConversationsByAgent(agentId, params, { token: opts?.token, signal });
        },
        staleTime: 15_000,
        ...opts?.query,
    });
}


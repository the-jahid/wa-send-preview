// src/app/features/conversations/apis.ts
import type {
    ConversationMessage,
    ListConversationsQuery,
    WithToken,
    WithSignal,
    TokenLike,
} from './types';
import { ConversationMessagesArraySchema } from './schemas';

/** Resolve base URL safely for browser & server */
function resolveBase(): string {
    const env =
        process.env.NEXT_PUBLIC_BACKEND_API_URL ||
        process.env.API_URL ||
        '';

    if (env) return env.replace(/\/$/, '');

    if (typeof window !== 'undefined') {
        return `${window.location.protocol}//${window.location.host}`;
    }

    return 'http://localhost:3000';
}

/** Build headers; supports raw token string or TokenGetter */
async function authHeaders(tokenLike?: TokenLike): Promise<HeadersInit> {
    const h: Record<string, string> = {
        Accept: 'application/json',
        'Content-Type': 'application/json',
    };

    if (!tokenLike) return h;

    const raw = typeof tokenLike === 'function' ? await tokenLike() : tokenLike;
    if (raw) h.Authorization = raw.startsWith('Bearer ') ? raw : `Bearer ${raw}`;

    return h;
}

function normalizeQuery(q?: ListConversationsQuery): Record<string, string> {
    const query = q ?? {};
    const params: Record<string, string> = {};

    if (query.page) params.page = String(query.page);
    if (query.limit) params.limit = String(query.limit);
    if (query.sortBy) params.sortBy = query.sortBy;
    if (query.sortOrder) params.sortOrder = query.sortOrder;

    return params;
}

function withQuery(base: string, params?: Record<string, string>): string {
    if (!params || Object.keys(params).length === 0) return base;
    const qs = new URLSearchParams(params);
    return `${base}?${qs.toString()}`;
}

/** -------- API calls -------- */

export async function listConversationsByAgent(
    agentId: string,
    params?: ListConversationsQuery,
    opts?: WithToken & WithSignal
): Promise<ConversationMessage[]> {
    const url = withQuery(`${resolveBase()}/conversations/agent/${agentId}`, normalizeQuery(params));

    const res = await fetch(url, {
        headers: await authHeaders(opts?.token),
        signal: opts?.signal,
        cache: 'no-store',
    });

    if (!res.ok) throw new Error(await safeErr(res));

    const json = await res.json();
    return ConversationMessagesArraySchema.parse(json);
}

/** Helpers */
async function safeErr(res: Response): Promise<string> {
    try {
        const j = await res.json();
        const msg = j?.message ?? j?.error ?? res.statusText;
        return Array.isArray(msg) ? msg.join(', ') : String(msg);
    } catch {
        return `${res.status} ${res.statusText}`;
    }
}

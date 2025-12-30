
import type {
    Webhook,
    CreateWebhookInput,
    UpdateWebhookInput,
    WebhookListQuery,
    WebhookRouteParams,
    PaginatedWebhooks,
    WithAuth
} from './types';

function resolveBase(): string {
    const env =
        process.env.NEXT_PUBLIC_API_BASE_URL ||
        process.env.NEXT_PUBLIC_BACKEND_API_URL ||
        '';

    if (env) return env.replace(/\/$/, '');
    if (typeof window !== 'undefined') {
        return `${window.location.protocol}//${window.location.host}`;
    }
    return 'http://localhost:3001';
}

const API_BASE = resolveBase();

type FetchOpts = RequestInit & WithAuth;

function authHeaders(authToken?: string | null): Record<string, string> {
    return authToken ? { Authorization: `Bearer ${authToken}` } : {};
}

async function fetchJSON<T>(path: string, opts: FetchOpts = {}): Promise<T> {
    const url = `${API_BASE}${path}`;
    const headers = new Headers(opts.headers);

    headers.set('Accept', 'application/json');
    if (opts.authToken) {
        headers.set('Authorization', `Bearer ${opts.authToken}`);
    }
    if (!headers.has('Content-Type') && opts.body && typeof opts.body === 'string') {
        headers.set('Content-Type', 'application/json');
    }

    const res = await fetch(url, {
        ...opts,
        headers,
        credentials: 'include',
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
        throw new Error(data?.message || res.statusText);
    }

    return data as T;
}

function toQuery(params: Record<string, any>): string {
    const parts = [];
    for (const [k, v] of Object.entries(params)) {
        if (v !== undefined && v !== null) {
            parts.push(`${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`);
        }
    }
    return parts.length ? `?${parts.join('&')}` : '';
}

const routes = {
    list: (agentId: string) => `/agents/${agentId}/webhooks`,
    detail: (agentId: string, webhookId: string) => `/agents/${agentId}/webhooks/${webhookId}`,
};

export async function listWebhooks(
    { agentId }: WebhookRouteParams,
    query: WebhookListQuery = {},
    opts?: WithAuth
): Promise<PaginatedWebhooks> {
    return fetchJSON<PaginatedWebhooks>(`${routes.list(agentId)}${toQuery(query)}`, {
        authToken: opts?.authToken,
    });
}

export async function getWebhook(
    { agentId, webhookId }: Required<WebhookRouteParams>,
    opts?: WithAuth
): Promise<Webhook> {
    return fetchJSON<Webhook>(routes.detail(agentId, webhookId), {
        authToken: opts?.authToken,
    });
}

export async function createWebhook(
    { agentId }: WebhookRouteParams,
    payload: CreateWebhookInput,
    opts?: WithAuth
): Promise<Webhook> {
    return fetchJSON<Webhook>(routes.list(agentId), {
        method: 'POST',
        body: JSON.stringify(payload),
        authToken: opts?.authToken,
    });
}

export async function updateWebhook(
    { agentId, webhookId }: Required<WebhookRouteParams>,
    payload: UpdateWebhookInput,
    opts?: WithAuth
): Promise<Webhook> {
    return fetchJSON<Webhook>(routes.detail(agentId, webhookId), {
        method: 'PATCH',
        body: JSON.stringify(payload),
        authToken: opts?.authToken,
    });
}

// User requested PUT as well, often an alias for full update or similar to PATCH in RESTful APIs if acceptable
export async function replaceWebhook(
    { agentId, webhookId }: Required<WebhookRouteParams>,
    payload: CreateWebhookInput,
    opts?: WithAuth
): Promise<Webhook> {
    return fetchJSON<Webhook>(routes.detail(agentId, webhookId), {
        method: 'PUT',
        body: JSON.stringify(payload),
        authToken: opts?.authToken,
    });
}

export async function deleteWebhook(
    { agentId, webhookId }: Required<WebhookRouteParams>,
    opts?: WithAuth
): Promise<{ success: boolean }> {
    return fetchJSON<{ success: boolean }>(routes.detail(agentId, webhookId), {
        method: 'DELETE',
        authToken: opts?.authToken,
    });
}

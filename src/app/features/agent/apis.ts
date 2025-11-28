// ----------------------------------------------
// src/features/agent/apis.ts
// Thin fetch wrappers for the Nest controller.
// All functions accept optional { token } to set Bearer auth.
// Works in both browser and server runtimes.
// ----------------------------------------------
import type {
  AllModelOptions,
  CreateAgentPayload,
  PaginatedAgentsEnvelope,
  SingleAgentEnvelope,
  UpdateAgentPayload,
  ListAgentsQuery,
} from './types';

/** Resolve base URL safely for browser & server */
function resolveBase(): string {
  const env =
    process.env.NEXT_PUBLIC_BACKEND_API_URL ||
    process.env.API_URL || // optional fallback
    '';

  if (env) return env.replace(/\/$/, '');

  // Browser fallback: same origin
  if (typeof window !== 'undefined') {
    return `${window.location.protocol}//${window.location.host}`;
  }

  // Last resort (dev): localhost:3000
  return 'http://localhost:3000';
}

const API_BASE = resolveBase();

/** Optional richer error */
export class HttpError extends Error {
  status: number;
  body: unknown;
  constructor(status: number, message: string, body?: unknown) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.body = body;
  }
}

export type FetchOpts = RequestInit & { token?: string; timeoutMs?: number };

function buildHeaders(init?: HeadersInit): Headers {
  // Clone any incoming headers regardless of type (Headers | tuple[] | record)
  const h = new Headers(init);
  return h;
}

/** Unified fetch with better parsing + timeout, and typed headers */
async function http<T>(path: string, opts: FetchOpts = {}): Promise<T> {
  const controller =
    typeof AbortController !== 'undefined' ? new AbortController() : undefined;
  const id =
    controller && opts.timeoutMs
      ? setTimeout(() => controller.abort(), opts.timeoutMs)
      : undefined;

  // Only attach JSON header if we’re sending a body (and not GET/HEAD)
  const hasBody =
    opts.body != null && opts.method != null && !/^GET|HEAD$/i.test(opts.method || '');

  const headers = buildHeaders(opts.headers);
  if (hasBody && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (opts.token) {
    headers.set('Authorization', `Bearer ${opts.token}`);
  }

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...opts,
      headers,
      signal: controller?.signal,
      // If calling a different origin, include allows credentials (CORS must allow it).
      credentials: 'include',
    });

    // Fast exit for 204/205 (no body)
    if (res.status === 204 || res.status === 205) {
      // @ts-expect-error: callers can type void where needed
      return undefined;
    }

    const text = await res.text();
    const parse = () => {
      try {
        return text ? JSON.parse(text) : {};
      } catch {
        return { message: text };
      }
    };

    if (!res.ok) {
      const body = parse();
      const message = (body as any)?.message || (body as any)?.error || res.statusText;
      throw new HttpError(res.status, message, body);
    }

    return (text ? JSON.parse(text) : {}) as T;
  } finally {
    if (id) clearTimeout(id);
  }
}

/** Robust query serializer (arrays → CSV, booleans & numbers handled) */
function toQuery(q?: ListAgentsQuery) {
  if (!q) return '';
  const p = new URLSearchParams();

  const set = (k: string, v: unknown) => {
    if (v === undefined || v === null || v === '') return;

    if (Array.isArray(v)) {
      // Most of these endpoints expect CSV for arrays (e.g., ids)
      p.set(k, v.map((x) => String(x)).join(','));
      return;
    }

    switch (typeof v) {
      case 'boolean':
        p.set(k, v ? 'true' : 'false');
        break;
      case 'number':
        if (!Number.isNaN(v)) p.set(k, String(v));
        break;
      default:
        p.set(k, String(v));
    }
  };

  Object.entries(q).forEach(([k, v]) => set(k, v as any));
  const s = p.toString();
  return s ? `?${s}` : '';
}

/* ---------------------------------------------------
 * Model options
 * --------------------------------------------------- */
export const getAllModelOptions = (opts?: FetchOpts) =>
  http<AllModelOptions>('/agents/models', { method: 'GET', ...opts });

export const getProviders = (opts?: FetchOpts) =>
  http<{ value: string; label: string }[]>('/agents/models/providers', {
    method: 'GET',
    ...opts,
  });

export const getOpenAIModels = (opts?: FetchOpts) =>
  http<{ value: string; label: string }[]>('/agents/models/openai', {
    method: 'GET',
    ...opts,
  });

export const getGeminiModels = (opts?: FetchOpts) =>
  http<{ value: string; label: string }[]>('/agents/models/gemini', {
    method: 'GET',
    ...opts,
  });

export const getClaudeModels = (opts?: FetchOpts) =>
  http<{ value: string; label: string }[]>('/agents/models/claude', {
    method: 'GET',
    ...opts,
  });

/* ---------------------------------------------------
 * CRUD — My agents
 * --------------------------------------------------- */

/** List MY agents (paginated, filterable) — envelope { data, meta, links, http } */
export const listMyAgents = (query?: ListAgentsQuery, opts?: FetchOpts) =>
  http<PaginatedAgentsEnvelope>(`/agents${toQuery(query)}`, { method: 'GET', ...opts });

/** Back-compat alias (previous name) */
export const listAgents = listMyAgents;

/** Get ONE agent by id — envelope { data, links, meta } */
export const getAgentById = (id: string, opts?: FetchOpts) =>
  http<SingleAgentEnvelope>(`/agents/${encodeURIComponent(id)}`, {
    method: 'GET',
    ...opts,
  });

/** Back-compat alias (previous name) */
export const getAgent = getAgentById;

/** Create agent — envelope { data, links, meta } */
export const createAgent = (payload: CreateAgentPayload, opts?: FetchOpts) =>
  http<SingleAgentEnvelope>(`/agents`, {
    method: 'POST',
    body: JSON.stringify(payload),
    ...opts,
  });

/** Update agent — envelope { data, links, meta } */
export const updateAgent = (
  id: string,
  payload: UpdateAgentPayload,
  opts?: FetchOpts,
) =>
  http<SingleAgentEnvelope>(`/agents/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
    ...opts,
  });

/** Delete agent — 204 No Content */
export const deleteAgent = (id: string, opts?: FetchOpts) =>
  http<void>(`/agents/${encodeURIComponent(id)}`, { method: 'DELETE', ...opts });

/* ---------------------------------------------------
 * CRUD — By explicit user (403 if not me)
 * --------------------------------------------------- */

/** List agents for a specific user (same envelope as list) */
export const listAgentsByUser = (
  userId: string,
  query?: ListAgentsQuery,
  opts?: FetchOpts,
) =>
  http<PaginatedAgentsEnvelope>(
    `/agents/user/${encodeURIComponent(userId)}${toQuery(query)}`,
    { method: 'GET', ...opts },
  );

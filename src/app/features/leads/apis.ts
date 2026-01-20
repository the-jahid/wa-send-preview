// src/app/features/leads/apis.ts
import type {
  ListLeadsQuery,
  PaginatedLeadsResult,
  Lead,
  WithToken,
  WithSignal,
  TokenLike,
} from './types';
import { LeadSchema, PaginatedLeadsResultSchema } from './schemas';

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

function toISO(v?: string | Date): string | undefined {
  if (!v) return undefined;
  if (typeof v === 'string') return v;
  return v.toISOString();
}

function normalizeQuery(q?: ListLeadsQuery): Record<string, string> {
  const query = q ?? {};
  const params: Record<string, string> = {};

  if (query.status) params.status = String(query.status);
  if (query.source) params.source = query.source;
  if (query.sortBy) params.sortBy = query.sortBy;
  if (query.sortOrder) params.sortOrder = query.sortOrder;
  if (query.page) params.page = String(query.page);
  if (query.limit) params.limit = String(query.limit);
  const ca = toISO(query.createdAfter);
  const cb = toISO(query.createdBefore);
  if (ca) params.createdAfter = ca;
  if (cb) params.createdBefore = cb;

  return params;
}

function withQuery(base: string, params?: Record<string, string>): string {
  if (!params || Object.keys(params).length === 0) return base;
  const qs = new URLSearchParams(params);
  return `${base}?${qs.toString()}`;
}

/** -------- API calls -------- */

export async function listLeads(
  params?: ListLeadsQuery,
  opts?: WithToken & WithSignal
): Promise<PaginatedLeadsResult> {
  const url = withQuery(`${resolveBase()}/leads`, normalizeQuery(params));
  const res = await fetch(url, {
    headers: await authHeaders(opts?.token),
    signal: opts?.signal,
    cache: 'no-store',
  });

  if (!res.ok) throw new Error(await safeErr(res));

  const json = await res.json();
  return PaginatedLeadsResultSchema.parse(json);
}

export async function listLeadsByAgent(
  agentId: string,
  params?: ListLeadsQuery,
  opts?: WithToken & WithSignal
): Promise<PaginatedLeadsResult> {
  const url = withQuery(`${resolveBase()}/leads/agent/${agentId}`, normalizeQuery(params));

  const res = await fetch(url, {
    headers: await authHeaders(opts?.token),
    signal: opts?.signal,
    cache: 'no-store',
  });

  if (!res.ok) throw new Error(await safeErr(res));

  const json = await res.json();
  return PaginatedLeadsResultSchema.parse(json);
}

export async function getLeadById(
  leadId: string,
  agentId: string,
  opts?: WithToken & WithSignal
): Promise<Lead> {
  const url = `${resolveBase()}/leads/${leadId}/agent/${agentId}`;
  const res = await fetch(url, {
    headers: await authHeaders(opts?.token),
    signal: opts?.signal,
    cache: 'no-store',
  });

  if (!res.ok) throw new Error(await safeErr(res));

  const json = await res.json();
  return LeadSchema.parse(json);
}

export async function deleteLead(
  leadId: string,
  agentId: string,
  opts?: WithToken & WithSignal
): Promise<Lead> {
  const url = `${resolveBase()}/leads/${leadId}/agent/${agentId}`;
  const res = await fetch(url, {
    method: 'DELETE',
    headers: await authHeaders(opts?.token),
    signal: opts?.signal,
  });

  if (!res.ok) throw new Error(await safeErr(res));

  const json = await res.json();
  return LeadSchema.parse(json);
}

export type CreateLeadPayload = {
  agentId: string;
  status?: string;
  source?: string;
  data?: Record<string, any>;
};

export async function createLead(
  payload: CreateLeadPayload,
  opts?: WithToken & WithSignal
): Promise<Lead> {
  const url = `${resolveBase()}/leads`;
  const res = await fetch(url, {
    method: 'POST',
    headers: await authHeaders(opts?.token),
    body: JSON.stringify(payload),
    signal: opts?.signal,
  });

  if (!res.ok) throw new Error(await safeErr(res));

  const json = await res.json();
  return LeadSchema.parse(json);
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

// src/app/features/outbound-broadcast-settings/apis.ts
import type {
  CampaignStatusResponse,
  PauseCampaignResponse,
  ResumeCampaignResponse,
  StartCampaignResponse,
  UpdateBroadcastSettingsBody,
  UpdateBroadcastSettingsResponse,
} from './types';
import type { TokenGetter } from '@/lib/api-token-provider';

const BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_API_URL?.replace(/\/$/, '') ??
  'http://localhost:3000';

/* ------------------------------ fetch helper ------------------------------ */

async function authFetch<T = any>(
  getToken: TokenGetter,
  input: RequestInfo | URL,
  init: RequestInit = {}
): Promise<T> {
  // get Clerk token; may be null
  let token: string | null = null;
  try {
    token = await getToken();
  } catch {
    token = null;
  }

  const headers = new Headers(init.headers || {});
  headers.set('Accept', 'application/json');
  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const res = await fetch(input, { ...init, headers });

  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      // Try JSON error first
      const data = await res.json();
      msg =
        (Array.isArray(data?.message)
          ? data.message.join(', ')
          : data?.message) ||
        data?.error ||
        msg;
    } catch {
      // Fallback to text body
      try {
        const text = await res.text();
        if (text) msg = text;
      } catch {
        /* ignore */
      }
    }
    throw new Error(msg);
  }

  if (res.status === 204) return null as T;

  const ct = res.headers.get('content-type') || '';
  return (ct.includes('application/json') ? res.json() : res.text()) as Promise<T>;
}

/* -------------------------- small payload normalizer -------------------------- */
/** Preserve explicit null for startAt (so BE can clear it), and ISO-ify Date */
function normalizeUpdatePayload(body: UpdateBroadcastSettingsBody) {
  const out: Record<string, unknown> = { ...body };
  if (Object.prototype.hasOwnProperty.call(body, 'startAt')) {
    const v = body.startAt;
    out.startAt =
      v === null ? null : v instanceof Date ? v.toISOString() : v;
  }
  return out;
}

/* -------------------------------- Endpoints -------------------------------- */

export async function apiStartBroadcast(
  getToken: TokenGetter,
  agentId: string,
  campaignId: string
): Promise<StartCampaignResponse> {
  const url = `${BASE_URL}/outbound-broadcast/agents/${agentId}/campaigns/${campaignId}/start`;
  return authFetch(getToken, url, { method: 'POST' });
}

export async function apiPauseBroadcast(
  getToken: TokenGetter,
  agentId: string,
  campaignId: string
): Promise<PauseCampaignResponse> {
  const url = `${BASE_URL}/outbound-broadcast/agents/${agentId}/campaigns/${campaignId}/pause`;
  return authFetch(getToken, url, { method: 'POST' });
}

export async function apiResumeBroadcast(
  getToken: TokenGetter,
  agentId: string,
  campaignId: string
): Promise<ResumeCampaignResponse> {
  const url = `${BASE_URL}/outbound-broadcast/agents/${agentId}/campaigns/${campaignId}/resume`;
  return authFetch(getToken, url, { method: 'POST' });
}

export async function apiUpdateBroadcastSettings(
  getToken: TokenGetter,
  agentId: string,
  campaignId: string,
  body: UpdateBroadcastSettingsBody
): Promise<UpdateBroadcastSettingsResponse> {
  const url = `${BASE_URL}/outbound-broadcast/agents/${agentId}/campaigns/${campaignId}/settings`;
  const normalized = normalizeUpdatePayload(body);
  return authFetch(getToken, url, {
    method: 'PATCH',
    body: JSON.stringify(normalized),
  });
}

/** GET status (agent-agnostic route) */
export async function apiGetBroadcastStatus(
  getToken: TokenGetter,
  campaignId: string
): Promise<CampaignStatusResponse> {
  const url = `${BASE_URL}/outbound-broadcast/campaigns/${campaignId}/status`;
  return authFetch(getToken, url, { method: 'GET' });
}

/** GET campaign overview with agent path (alias of status, validates path params) */
export async function apiGetCampaignOverview(
  getToken: TokenGetter,
  agentId: string,
  campaignId: string
): Promise<CampaignStatusResponse> {
  const url = `${BASE_URL}/outbound-broadcast/agents/${agentId}/campaigns/${campaignId}`;
  return authFetch(getToken, url, { method: 'GET' });
}

/** One-off cron trigger (useful in Postman/testing) */
export async function apiRunCronOnce(
  getToken: TokenGetter
): Promise<{ ok: true }> {
  const url = `${BASE_URL}/outbound-broadcast/cron/run-once`;
  return authFetch(getToken, url, { method: 'POST' });
}

/* ------------------------- Template convenience APIs ------------------------ */
/** Use the dedicated endpoints we added in the controller for template picking. */

export async function apiSetBroadcastTemplate(
  getToken: TokenGetter,
  agentId: string,
  campaignId: string,
  templateId: string
): Promise<UpdateBroadcastSettingsResponse> {
  const url = `${BASE_URL}/outbound-broadcast/agents/${agentId}/campaigns/${campaignId}/template/${templateId}`;
  return authFetch(getToken, url, { method: 'PUT' });
}

export async function apiClearBroadcastTemplate(
  getToken: TokenGetter,
  agentId: string,
  campaignId: string
): Promise<UpdateBroadcastSettingsResponse> {
  const url = `${BASE_URL}/outbound-broadcast/agents/${agentId}/campaigns/${campaignId}/template`;
  return authFetch(getToken, url, { method: 'DELETE' });
}

/* --------------------------------- Health ---------------------------------- */

export async function apiOutboundBroadcastHealth(
  getToken: TokenGetter
): Promise<{ ok: boolean; service: string }> {
  const url = `${BASE_URL}/outbound-broadcast/health`;
  return authFetch(getToken, url, { method: 'GET' });
}

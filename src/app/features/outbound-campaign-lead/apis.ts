// src/app/features/outbound-campaign-lead/apis.ts
import { z } from 'zod';
import type { IOutboundLead, Paginated, QueryOutboundLeadsInput } from './types';
import {
  CreateOutboundLeadSchema,
  UpdateOutboundLeadSchema,
  SetLeadStatusSchema,
  RecordAttemptSchema,
  UpsertCustomFieldsSchema,
  QueryOutboundLeadsSchema,
  OutboundLeadResponseSchema,
} from './schemas';

// --- BASE: include /api if your Nest has a global prefix ---
const RAW_BASE = process.env.NEXT_PUBLIC_BACKEND_API_URL ?? '';
const BASE = RAW_BASE.replace(/\/+$/, ''); // strip trailing slashes

type FetchOpts = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  token?: string | null;
  body?: unknown;
  query?: Record<string, any>;
};

function buildQS(query?: Record<string, any>) {
  if (!query) return '';
  const qs = new URLSearchParams();
  const append = (k: string, v: any) => {
    if (v === undefined || v === null || v === '') return;
    if (Array.isArray(v)) v.forEach((item) => append(k, item));
    else if (v instanceof Date) qs.append(k, v.toISOString());
    else qs.append(k, String(v));
  };
  Object.entries(query).forEach(([k, v]) => append(k, v));
  const s = qs.toString();
  return s ? `?${s}` : '';
}

async function apiFetch<T>(path: string, opts: FetchOpts = {}): Promise<T> {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const url = `${BASE}${cleanPath}${buildQS(opts.query)}`;

  const headers: Record<string, string> = { Accept: 'application/json' };
  if (opts.body !== undefined) headers['Content-Type'] = 'application/json';
  if (opts.token) headers['Authorization'] = `Bearer ${opts.token}`;

  const res = await fetch(url, {
    method: opts.method ?? 'GET',
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    credentials: 'include',
  });

  const ct = res.headers.get('content-type') ?? '';
  const isJson = ct.includes('application/json');
  const text = await res.text();

  let json: any = undefined;
  if (isJson && text) {
    try {
      json = JSON.parse(text);
    } catch {
      // if server lies about content-type, fall back to text
      json = undefined;
    }
  }

  if (!res.ok) {
    // Prefer JSON message when possible; otherwise, show a short HTML snippet
    const msg =
      (json && (json.message || json.error || json.msg)) ||
      (text?.startsWith('<') ? `HTTP ${res.status} ${res.statusText} — non-JSON response` : text) ||
      `HTTP ${res.status} ${res.statusText}`;

    // Extra hint when HTML came back (e.g., wrong base URL/prefix)
    const hint = text?.startsWith('<')
      ? 'Tip: check NEXT_PUBLIC_API_BASE_URL (and /api prefix). The endpoint likely returned an HTML 404.'
      : '';

    throw new Error(hint ? `${msg}. ${hint}` : msg);
  }

  if (!isJson) {
    throw new Error('Server returned non-JSON payload for a JSON endpoint.');
  }

  return json as T;
}

// ----------------- API calls (unchanged below) -----------------

export async function listOutboundCampaignLeads(
  campaignId: string,
  input: QueryOutboundLeadsInput,
  token?: string | null,
): Promise<Paginated<IOutboundLead>> {
  const safe = QueryOutboundLeadsSchema.parse(input);
  const payload = await apiFetch<Paginated<IOutboundLead>>(
    `/outbound-campaigns/${campaignId}/leads`,
    { method: 'GET', token, query: safe as any },
  );
  if (Array.isArray(payload?.data) && payload.data[0]) {
    OutboundLeadResponseSchema.parse(payload.data[0]);
  }
  return payload;
}

export async function createOutboundLead(
  campaignId: string,
  body: z.infer<typeof CreateOutboundLeadSchema>,
  token?: string | null,
): Promise<IOutboundLead> {
  const dto = CreateOutboundLeadSchema.parse(body);
  const payload = await apiFetch<IOutboundLead>(
    `/outbound-campaigns/${campaignId}/leads`,
    { method: 'POST', token, body: dto },
  );
  return OutboundLeadResponseSchema.parse(payload);
}

export async function getLead(id: string, token?: string | null): Promise<IOutboundLead> {
  const payload = await apiFetch<IOutboundLead>(`/leads/${id}`, { method: 'GET', token });
  return OutboundLeadResponseSchema.parse(payload);
}

export async function updateLead(
  id: string,
  body: z.infer<typeof UpdateOutboundLeadSchema>,
  token?: string | null,
): Promise<IOutboundLead> {
  const dto = UpdateOutboundLeadSchema.parse(body);
  const payload = await apiFetch<IOutboundLead>(`/leads/${id}`, {
    method: 'PATCH',
    token,
    body: dto,
  });
  return OutboundLeadResponseSchema.parse(payload);
}

export async function deleteLead(id: string, token?: string | null): Promise<IOutboundLead> {
  const payload = await apiFetch<IOutboundLead>(`/leads/${id}`, { method: 'DELETE', token });
  return OutboundLeadResponseSchema.parse(payload);
}

export async function setLeadStatus(
  id: string,
  body: z.infer<typeof SetLeadStatusSchema>,
  token?: string | null,
): Promise<IOutboundLead> {
  const dto = SetLeadStatusSchema.parse(body);
  const payload = await apiFetch<IOutboundLead>(`/leads/${id}/status`, {
    method: 'PATCH',
    token,
    body: dto,
  });
  return OutboundLeadResponseSchema.parse(payload);
}

export async function recordLeadAttempt(
  id: string,
  body: z.infer<typeof RecordAttemptSchema>,
  token?: string | null,
): Promise<IOutboundLead> {
  const dto = RecordAttemptSchema.parse(body);
  const payload = await apiFetch<IOutboundLead>(`/leads/${id}/record-attempt`, {
    method: 'PATCH',
    token,
    body: dto,
  });
  return OutboundLeadResponseSchema.parse(payload);
}

export async function upsertLeadCustomFields(
  id: string,
  body: z.infer<typeof UpsertCustomFieldsSchema>,
  token?: string | null,
): Promise<IOutboundLead> {
  const dto = UpsertCustomFieldsSchema.parse(body);
  const payload = await apiFetch<IOutboundLead>(`/leads/${id}/custom-fields`, {
    method: 'PATCH',
    token,
    body: dto,
  });
  return OutboundLeadResponseSchema.parse(payload);
}

import {
  CreateLeadCustomFieldIntakeSchema,
  UpdateLeadCustomFieldIntakeSchema,
  QueryLeadCustomFieldIntakesSchema,
  PaginatedLeadCustomFieldIntakeSchema,
  LeadCustomFieldIntakeSchema,
  UUID_ANY,
} from './schemas';
import type {
  CreateLeadCustomFieldIntakeBody,
  UpdateLeadCustomFieldIntakeBody,
  QueryLeadCustomFieldIntakes,
  PaginatedLeadCustomFieldIntake,
  LeadCustomFieldIntake,
} from './types';
import type { TokenGetter } from '@/lib/api-token-provider';

const BASE = process.env.NEXT_PUBLIC_BACKEND_API_URL || '';

function headers(token?: string | null): HeadersInit {
  const h: HeadersInit = { 'Content-Type': 'application/json' };
  if (token) h['Authorization'] = `Bearer ${token}`;
  return h;
}

async function maybeToken(getToken?: TokenGetter): Promise<string | null> {
  return getToken ? await getToken() : null;
}

async function handle<T>(res: Response, parse: (data: any) => T): Promise<T> {
  const txt = await res.text();
  const data = txt ? JSON.parse(txt) : null;

  if (!res.ok) {
    const msg = data?.message || data?.error || res.statusText || 'Request failed';
    throw new Error(Array.isArray(msg) ? msg.join(', ') : msg);
  }
  return parse(data);
}

// -----------------------------
// CRUD
// -----------------------------

export async function apiCreateLeadCFI(
  campaignId: string,
  body: CreateLeadCustomFieldIntakeBody,
  opts?: { getToken?: TokenGetter }
): Promise<LeadCustomFieldIntake> {
  UUID_ANY.parse(campaignId);
  CreateLeadCustomFieldIntakeSchema.parse(body);

  const token = await maybeToken(opts?.getToken);
  const res = await fetch(`${BASE}/outbound-campaigns/${campaignId}/custom-fields`, {
    method: 'POST',
    headers: headers(token),
    body: JSON.stringify(body),
  });
  return handle(res, (d) => LeadCustomFieldIntakeSchema.parse(d));
}

export async function apiListLeadCFI(
  campaignId: string,
  query?: QueryLeadCustomFieldIntakes,
  opts?: { getToken?: TokenGetter }
): Promise<PaginatedLeadCustomFieldIntake> {
  UUID_ANY.parse(campaignId);
  const q = QueryLeadCustomFieldIntakesSchema.parse(query ?? {});
  const params = new URLSearchParams();
  if (q.page) params.set('page', String(q.page));
  if (q.limit) params.set('limit', String(q.limit));
  if (q.q) params.set('q', q.q);
  if (q.sortBy) params.set('sortBy', q.sortBy);
  if (q.sortOrder) params.set('sortOrder', q.sortOrder);

  const token = await maybeToken(opts?.getToken);
  const res = await fetch(
    `${BASE}/outbound-campaigns/${campaignId}/custom-fields?${params.toString()}`,
    { headers: headers(token) }
  );
  return handle(res, (d) => PaginatedLeadCustomFieldIntakeSchema.parse(d));
}

export async function apiGetLeadCFI(
  id: string,
  opts?: { getToken?: TokenGetter }
): Promise<LeadCustomFieldIntake> {
  UUID_ANY.parse(id);
  const token = await maybeToken(opts?.getToken);
  const res = await fetch(`${BASE}/custom-fields/${id}`, {
    headers: headers(token),
  });
  return handle(res, (d) => LeadCustomFieldIntakeSchema.parse(d));
}

export async function apiUpdateLeadCFI(
  id: string,
  body: UpdateLeadCustomFieldIntakeBody,
  opts?: { getToken?: TokenGetter }
): Promise<LeadCustomFieldIntake> {
  UUID_ANY.parse(id);
  UpdateLeadCustomFieldIntakeSchema.parse(body);

  const token = await maybeToken(opts?.getToken);
  const res = await fetch(`${BASE}/custom-fields/${id}`, {
    method: 'PATCH',
    headers: headers(token),
    body: JSON.stringify(body),
  });
  return handle(res, (d) => LeadCustomFieldIntakeSchema.parse(d));
}

export async function apiDeleteLeadCFI(
  id: string,
  opts?: { getToken?: TokenGetter }
): Promise<LeadCustomFieldIntake> {
  UUID_ANY.parse(id);
  const token = await maybeToken(opts?.getToken);
  const res = await fetch(`${BASE}/custom-fields/${id}`, {
    method: 'DELETE',
    headers: headers(token),
  });
  return handle(res, (d) => LeadCustomFieldIntakeSchema.parse(d));
}

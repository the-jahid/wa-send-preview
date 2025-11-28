import type {
  ExternalCalendarConnection,
  CreateCalendarConnectionInput,
  UpdateCalendarConnectionInput,
  ListEnvelope,
  ItemEnvelope,
} from './types';
import type { TokenGetter } from '@/lib/api-token-provider';

const BASE = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:3000';

async function authorizedFetch<T>(
  path: string,
  getToken: TokenGetter,
  init: RequestInit = {},
): Promise<T> {
  const token = await getToken();
  if (!token) {
    const err = new Error('Not authenticated');
    (err as any).status = 401;
    throw err;
  }

  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(init.headers || {}),
    },
    cache: 'no-store',
  });

  if (res.status === 204) return undefined as unknown as T;

  let payload: any = null;
  try {
    payload = await res.json();
  } catch {
    // ignore parse error for empty/invalid JSON responses
  }

  if (!res.ok) {
    const message =
      payload?.message || payload?.error || `Request failed with status ${res.status}`;
    const error = new Error(message);
    (error as any).status = res.status;
    (error as any).details = payload;
    throw error;
  }

  return payload as T;
}

// ---- Endpoints ----
export async function apiListConnections(getToken: TokenGetter, page = 1, pageSize = 20) {
  const q = new URLSearchParams({ page: String(page), pageSize: String(pageSize) }).toString();
  const env = await authorizedFetch<ListEnvelope<ExternalCalendarConnection>>(
    `/calendar-connections?${q}`,
    getToken,
  );
  return {
    items: env.data,
    page: env.meta.pagination.page,
    pageSize: env.meta.pagination.pageSize,
    total: env.meta.pagination.total,
    totalPages: env.meta.pagination.totalPages,
  };
}

export async function apiGetConnection(getToken: TokenGetter, id: string) {
  const env = await authorizedFetch<ItemEnvelope<ExternalCalendarConnection>>(
    `/calendar-connections/${id}`,
    getToken,
  );
  return env.data;
}

export async function apiCreateConnection(
  getToken: TokenGetter,
  payload: CreateCalendarConnectionInput,
) {
  const env = await authorizedFetch<ItemEnvelope<ExternalCalendarConnection>>(
    `/calendar-connections`,
    getToken,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
  );
  return env.data;
}

export async function apiUpdateConnection(
  getToken: TokenGetter,
  id: string,
  payload: UpdateCalendarConnectionInput,
) {
  const env = await authorizedFetch<ItemEnvelope<ExternalCalendarConnection>>(
    `/calendar-connections/${id}`,
    getToken,
    {
      method: 'PATCH',
      body: JSON.stringify(payload),
    },
  );
  return env.data;
}

export async function apiDeleteConnection(getToken: TokenGetter, id: string) {
  await authorizedFetch<void>(`/calendar-connections/${id}`, getToken, { method: 'DELETE' });
}

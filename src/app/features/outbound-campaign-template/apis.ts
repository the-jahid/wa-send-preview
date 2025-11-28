// src/app/features/outbound-campaign-template/apis.ts
import type {
  ApiResponse,
  ListTemplatesRequest,
  ListTemplatesResponse,
  Template,
  CreateTemplateDto,
  UpdateTemplateDto,
} from './types';

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_API_URL ?? '';

function stripHtml(input: string) {
  try {
    const titleMatch = input.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch?.[1]) return titleMatch[1].trim();
    return input.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  } catch {
    return input;
  }
}

async function extractErrorMessage(res: Response) {
  const ct = res.headers.get('content-type') || '';
  try {
    if (ct.includes('application/json')) {
      const json = await res.json().catch(() => ({}));
      const msg = (json?.message ?? json?.error ?? json?.msg) as string | undefined;
      if (msg) return msg;
    } else {
      const text = await res.text();
      const cleaned = stripHtml(text);
      if (cleaned && !/^html|doctype/i.test(cleaned)) return cleaned;
    }
  } catch {
    /* ignore */
  }
  return `HTTP ${res.status} ${res.statusText || ''}`.trim();
}

async function apiFetch<T>(path: string, token: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const message = await extractErrorMessage(res);
    throw new Error(message);
  }

  if (res.status === 204) {
 
    return undefined as T;
  }

  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) {
    return (await res.json()) as T;
  }
  return (await res.blob()) as T;
}

/** Unwrap either `{ data }` envelopes or raw payloads */
function unwrap<T>(payload: any): T {
  return (payload && typeof payload === 'object' && 'data' in payload ? payload.data : payload) as T;
}

/* ------------------ REST calls ------------------ */

export async function listTemplatesApi(
  req: ListTemplatesRequest,
  token: string
): Promise<ListTemplatesResponse> {
  const params = new URLSearchParams();
  params.set('agentId', req.agentId);
  if (req.q) params.set('q', req.q);
  if (req.skip != null) params.set('skip', String(req.skip));
  if (req.take != null) params.set('take', String(req.take));
  if (req.orderBy) params.set('orderBy', req.orderBy);
  if (req.orderDir) params.set('orderDir', req.orderDir);

  // Backend returns { items, total, skip, take } (raw), but we also
  // accept envelopes if you switch later.
  const raw = await apiFetch<any>(`/outbound/templates?${params.toString()}`, token);

  if (raw && typeof raw === 'object') {
    if (Array.isArray(raw.items)) {
      return {
        items: raw.items as Template[],
        total: Number(raw.total ?? raw.items.length) || 0,
        skip: Number(raw.skip ?? req.skip ?? 0) || 0,
        take: Number(raw.take ?? req.take ?? raw.items.length) || 0,
      };
    }
    if (Array.isArray(raw.data)) {
      const items = raw.data as Template[];
      return {
        items,
        total: Number(raw.meta?.total ?? items.length) || items.length,
        skip: Number(raw.meta?.skip ?? req.skip ?? 0) || 0,
        take: Number(raw.meta?.take ?? req.take ?? items.length) || items.length,
      };
    }
  }

  // As a last resort, if the server returned an array
  if (Array.isArray(raw)) {
    return {
      items: raw as Template[],
      total: raw.length,
      skip: req.skip ?? 0,
      take: req.take ?? raw.length,
    };
  }

  // Defensive default
  return { items: [], total: 0, skip: req.skip ?? 0, take: req.take ?? 0 };
}

export async function getTemplateApi(id: string, token: string): Promise<Template> {
  const raw = await apiFetch<ApiResponse<Template> | Template>(`/outbound/templates/${id}`, token);
  return unwrap<Template>(raw);
}

export async function createTemplateApi(
  dto: CreateTemplateDto & { mediaFile?: File | null },
  token: string
): Promise<Template> {
  const fd = new FormData();
  fd.set('agentId', dto.agentId);
  fd.set('name', dto.name);
  if (dto.body) fd.set('body', dto.body);
  (dto.variables ?? []).forEach((v) => fd.append('variables', v));
  if (dto.mediaFile) fd.append('media', dto.mediaFile);

  const raw = await apiFetch<ApiResponse<Template> | Template>(`/outbound/templates`, token, {
    method: 'POST',
    body: fd,
  });
  return unwrap<Template>(raw);
}

export async function updateTemplateApi(
  id: string,
  dto: UpdateTemplateDto,
  token: string
): Promise<Template> {
  const raw = await apiFetch<ApiResponse<Template> | Template>(`/outbound/templates/${id}`, token, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dto),
  });
  return unwrap<Template>(raw);
}

export async function replaceTemplateMediaApi(
  id: string,
  file: File,
  token: string
): Promise<Template> {
  const fd = new FormData();
  fd.append('media', file);
  const raw = await apiFetch<ApiResponse<Template> | Template>(`/outbound/templates/${id}/media`, token, {
    method: 'PUT',
    body: fd,
  });
  return unwrap<Template>(raw);
}

export async function clearTemplateMediaApi(id: string, token: string): Promise<Template> {
  const raw = await apiFetch<ApiResponse<Template> | Template>(`/outbound/templates/${id}/media`, token, {
    method: 'DELETE',
  });
  return unwrap<Template>(raw);
}

export async function deleteTemplateApi(id: string, token: string): Promise<{ id: string; deleted: true }> {
  await apiFetch<void>(`/outbound/templates/${id}`, token, { method: 'DELETE' });
  // 204 from backend; fabricate a small confirmation for the UI
  return { id, deleted: true };
}

/* ---- Helpers to fetch/download media ---- */

export function getTemplateMediaUrl(id: string) {
  return `${API_BASE}/outbound/templates/${id}/media`;
}

export async function fetchTemplateMediaBlob(id: string, token: string): Promise<Blob> {
  return await apiFetch<Blob>(`/outbound/templates/${id}/media`, token);
}

// src/app/features/lead-item/apis.ts
import { z } from "zod";
import type { TokenGetter } from "@/lib/api-token-provider";
import {
  apiEnvelopeSchema,
  leadItemSchema,
  paginatedLeadItemsSchema,
} from "./schemas";
import type {
  CreateLeadItemInput,
  UpdateLeadItemInput,
  ListLeadItemsQuery,
  LeadItem,
  PaginatedLeadItems,
} from "./types";

/** Resolve base URL safely for browser & server */
function resolveBase(): string {
  const env =
    process.env.NEXT_PUBLIC_BACKEND_API_URL ||
    process.env.API_URL ||
    "";
  if (env) return env.replace(/\/$/, "");
  if (typeof window !== "undefined") {
    return `${window.location.protocol}//${window.location.host}`;
  }
  return "http://localhost:3000";
}

async function authFetch(
  path: string,
  init: RequestInit = {},
  getToken?: TokenGetter
): Promise<Response> {
  const url = `${resolveBase()}${path.startsWith("/") ? "" : "/"}${path}`;
  const headers = new Headers(init.headers || {});
  headers.set("Content-Type", "application/json");

  if (getToken) {
    const token = await getToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }
  return fetch(url, { ...init, headers });
}

/** Validate standard envelope and return the typed `data` */
function unwrap<TOut>(json: unknown, dataSchema: z.ZodType<TOut>): TOut {
  const env = apiEnvelopeSchema(dataSchema);
  const parsed = env.parse(json);          // throws if invalid -> strongly typed
  return parsed.data;                      // <- TOut
}

/** ------------------ Thin API wrappers ------------------ */

export async function apiCreateLeadItem(
  payload: CreateLeadItemInput,
  getToken?: TokenGetter
): Promise<LeadItem> {
  const res = await authFetch(`/lead-items`, {
    method: "POST",
    body: JSON.stringify(payload),
  }, getToken);

  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.message || `HTTP ${res.status}`);
  return unwrap(json, leadItemSchema);
}

export async function apiListLeadItemsForAgent(
  agentId: string,
  query: ListLeadItemsQuery = {},
  getToken?: TokenGetter
): Promise<PaginatedLeadItems> {
  const params = new URLSearchParams();
  if (query.page) params.set("page", String(query.page));
  if (query.limit) params.set("limit", String(query.limit));
  if (query.sortBy) params.set("sortBy", query.sortBy);
  if (query.sortOrder) params.set("sortOrder", query.sortOrder);
  if (query.name) params.set("name", query.name);
  if (query.description) params.set("description", query.description);

  const res = await authFetch(
    `/lead-items/agent/${agentId}?${params.toString()}`,
    {},
    getToken
  );

  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.message || `HTTP ${res.status}`);
  return unwrap(json, paginatedLeadItemsSchema);
}

export async function apiGetLeadItem(
  id: string,
  getToken?: TokenGetter
): Promise<LeadItem> {
  const res = await authFetch(`/lead-items/${id}`, {}, getToken);
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.message || `HTTP ${res.status}`);
  return unwrap(json, leadItemSchema);
}

export async function apiUpdateLeadItem(
  id: string,
  payload: UpdateLeadItemInput,
  getToken?: TokenGetter
): Promise<LeadItem> {
  const res = await authFetch(`/lead-items/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  }, getToken);

  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.message || `HTTP ${res.status}`);
  return unwrap(json, leadItemSchema);
}

export async function apiDeleteLeadItem(
  id: string,
  getToken?: TokenGetter
): Promise<void> {
  const res = await authFetch(`/lead-items/${id}`, { method: "DELETE" }, getToken);
  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const j = await res.json();
      message = j?.message || message;
    } catch {}
    throw new Error(message);
  }
}

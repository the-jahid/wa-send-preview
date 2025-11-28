// app/features/appointment-lead-item/apis.ts
import type {
  AppointmentLeadItem,
  CreatePayload,
  ListParams,
  ListResponse,
  SingleResponse,
  UpdatePayload,
} from "./types";
import { listResponseSchema, singleResponseSchema } from "./schemas";

const BASE = process.env.NEXT_PUBLIC_BACKEND_API_URL ?? "http://localhost:3000";

function isValidTake(n: unknown): n is number {
  return typeof n === "number" && Number.isInteger(n) && n >= 1 && n <= 100;
}

/**
 * Auth-aware fetch that gracefully handles 204/empty responses.
 */
async function authFetch<T>(
  url: string,
  init: RequestInit & { token?: string },
): Promise<T> {
  const { token, ...rest } = init;
  const res = await fetch(url, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(rest.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} ${res.statusText}: ${errText}`);
  }

  // No content to parse
  if (res.status === 204 || res.status === 205) {
    return undefined as unknown as T;
  }

  const ct = res.headers.get("content-type") ?? "";
  if (!ct.includes("application/json")) {
    // Try text; if empty, return undefined
    const txt = await res.text().catch(() => "");
    return (txt ? (txt as unknown as T) : (undefined as unknown as T));
  }

  // Some servers send 200 with empty body; guard it.
  const raw = await res.text();
  if (!raw) return undefined as unknown as T;

  return JSON.parse(raw) as T;
}

// ---------- API calls ----------
export async function apiListAppointmentLeadItems(
  params: ListParams,
  token?: string,
): Promise<ListResponse<AppointmentLeadItem>> {
  const q = new URLSearchParams();
  if (params.search && params.search.trim()) q.set("search", params.search.trim());
  if (params.cursor) q.set("cursor", params.cursor);
  if (isValidTake(params.take)) q.set("take", String(params.take));

  const url = `${BASE}/agents/${params.agentId}/appointment-lead-items${q.toString() ? `?${q}` : ""}`;
  const json = await authFetch<ListResponse<AppointmentLeadItem>>(url, { method: "GET", token });
  return listResponseSchema.parse(json);
}

export async function apiGetAppointmentLeadItem(
  agentId: string,
  id: string,
  token?: string,
): Promise<SingleResponse<AppointmentLeadItem>> {
  const url = `${BASE}/agents/${agentId}/appointment-lead-items/${id}`;
  const json = await authFetch<SingleResponse<AppointmentLeadItem>>(url, { method: "GET", token });
  return singleResponseSchema.parse(json);
}

export async function apiCreateAppointmentLeadItem(
  agentId: string,
  payload: CreatePayload,
  token?: string,
): Promise<SingleResponse<AppointmentLeadItem>> {
  const url = `${BASE}/agents/${agentId}/appointment-lead-items`;
  const json = await authFetch<SingleResponse<AppointmentLeadItem>>(url, {
    method: "POST",
    body: JSON.stringify(payload),
    token,
  });
  return singleResponseSchema.parse(json);
}

export async function apiUpdateAppointmentLeadItem(
  agentId: string,
  id: string,
  payload: UpdatePayload,
  token?: string,
): Promise<SingleResponse<AppointmentLeadItem>> {
  const url = `${BASE}/agents/${agentId}/appointment-lead-items/${id}`;
  const json = await authFetch<SingleResponse<AppointmentLeadItem>>(url, {
    method: "PATCH",
    body: JSON.stringify(payload),
    token,
  });
  return singleResponseSchema.parse(json);
}

export async function apiDeleteAppointmentLeadItem(
  agentId: string,
  id: string,
  token?: string,
): Promise<void> {
  const url = `${BASE}/agents/${agentId}/appointment-lead-items/${id}`;
  await authFetch<void>(url, { method: "DELETE", token }); // will not try to parse JSON now
}

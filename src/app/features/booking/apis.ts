import { z } from 'zod';
import type { TokenGetter } from '@/lib/api-token-provider';
import {
  bookingSettingsSchema,
  upsertBookingSettingsSchema,
  patchBookingSettingsSchema,
  weeklyAvailabilityRowSchema,
  upsertWeeklyAvailabilitySchema,
  deleteWeeklyAvailabilitySchema,
  assignedCalendarSchema,
  assignCalendarResponseSchema,
  assignCalendarBodySchema,
} from './schemas';
import type {
  UpsertBookingSettingsInput,
  PatchBookingSettingsInput,
  UpsertWeeklyAvailabilityInput,
  DeleteWeeklyAvailabilityInput,
} from './types';

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_API_URL ?? '';

async function authFetch<T = unknown>(
  path: string,
  init: RequestInit & { getToken?: TokenGetter } = {}
): Promise<T> {
  const { getToken, headers, ...rest } = init;
  const token = getToken ? await getToken() : undefined;

  // ✅ Only send Content-Type when there is a body (avoids preflight on bodyless DELETE)
  const computedHeaders: Record<string, string> = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  
  // Safely merge headers if they exist
  if (headers) {
    const headerEntries = headers instanceof Headers 
      ? Array.from(headers.entries())
      : Array.isArray(headers)
      ? headers
      : Object.entries(headers);
    
    for (const [key, value] of headerEntries) {
      if (typeof value === 'string') {
        computedHeaders[key] = value;
      }
    }
  }
  
  if (rest.body !== undefined && !('Content-Type' in computedHeaders)) {
    computedHeaders['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...rest,
    headers: computedHeaders,
    cache: 'no-store',
    mode: 'cors',
  });

  if (res.status === 204) return undefined as T;

  const text = await res.text();
  const json = text ? JSON.parse(text) : null;

  if (!res.ok) {
    throw Object.assign(new Error(json?.message || res.statusText), {
      status: res.status,
      details: json,
    });
  }
  return json as T;
}

/** -------- Settings -------- */

export async function apiGetBookingSettings(agentId: string, getToken?: TokenGetter) {
  const data = await authFetch(`/agents/${agentId}/booking/settings`, { method: 'GET', getToken });
  return bookingSettingsSchema.nullable().parse(data);
}

export async function apiUpsertBookingSettings(
  agentId: string,
  body: UpsertBookingSettingsInput,
  getToken?: TokenGetter,
) {
  const payload = upsertBookingSettingsSchema.parse(body);
  const data = await authFetch(`/agents/${agentId}/booking/settings`, {
    method: 'PUT',
    body: JSON.stringify(payload),
    getToken,
  });
  return bookingSettingsSchema.parse(data);
}

export async function apiPatchBookingSettings(
  agentId: string,
  body: PatchBookingSettingsInput,
  getToken?: TokenGetter,
) {
  const payload = patchBookingSettingsSchema.parse(body);
  const data = await authFetch(`/agents/${agentId}/booking/settings`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
    getToken,
  });
  return bookingSettingsSchema.parse(data);
}

export async function apiDeleteBookingSettings(agentId: string, getToken?: TokenGetter) {
  // No body, so no Content-Type → no preflight
  await authFetch(`/agents/${agentId}/booking/settings`, { method: 'DELETE', getToken });
}

/** -------- Availability -------- */

export async function apiGetAvailability(agentId: string, getToken?: TokenGetter) {
  const data = await authFetch(`/agents/${agentId}/booking/availability`, { method: 'GET', getToken });
  return z.array(weeklyAvailabilityRowSchema).parse(data);
}

export async function apiUpsertAvailability(
  agentId: string,
  body: UpsertWeeklyAvailabilityInput,
  getToken?: TokenGetter,
) {
  const payload = upsertWeeklyAvailabilitySchema.parse(body);
  const data = await authFetch(`/agents/${agentId}/booking/availability`, {
    method: 'PUT',
    body: JSON.stringify(payload),
    getToken,
  });
  return z.array(weeklyAvailabilityRowSchema).parse(data);
}

export async function apiDeleteAvailability(
  agentId: string,
  body: DeleteWeeklyAvailabilityInput,
  getToken?: TokenGetter,
) {
  const payload = deleteWeeklyAvailabilitySchema.parse(body);
  const data = await authFetch(`/agents/${agentId}/booking/availability`, {
    method: 'DELETE',
    body: JSON.stringify(payload),
    getToken,
  });
  return z.object({ count: z.number().int().nonnegative() }).parse(data);
}

/** -------- Calendar assignment -------- */

export async function apiGetAssignedCalendar(agentId: string, getToken?: TokenGetter) {
  const data = await authFetch(`/agents/${agentId}/booking/calendar`, { method: 'GET', getToken });
  return assignedCalendarSchema.parse(data);
}

export async function apiAssignCalendar(
  agentId: string,
  calendarConnectionId: string,
  getToken?: TokenGetter,
) {
  const payload = assignCalendarBodySchema.parse({ calendarConnectionId });
  const data = await authFetch(`/agents/${agentId}/booking/calendar/assign`, {
    method: 'POST',
    body: JSON.stringify(payload),
    getToken,
  });
  return assignCalendarResponseSchema.parse(data);
}

export async function apiUnassignCalendar(agentId: string, getToken?: TokenGetter) {
  const data = await authFetch(`/agents/${agentId}/booking/calendar/assign`, {
    method: 'DELETE',
    getToken,
  });
  return z.object({ removed: z.boolean() }).parse(data);
}
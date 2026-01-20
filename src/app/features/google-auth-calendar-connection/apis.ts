// src/app/features/google-auth-calendar-connection/apis.ts
import type { GoogleAuthUrlResponse, GoogleCallbackBody, BasicMessageResponse } from './types';

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3000';

// Adjust if your backend uses different paths:
const PATH_URL = '/auth/google/url';
const PATH_CALLBACK = '/auth/google/callback';

/** shared auth-aware fetch that handles 204/empty bodies safely */
async function authFetch<T>(url: string, init: RequestInit & { token?: string | null }) {
  const { token, ...rest } = init;
  const res = await fetch(url, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(rest.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} ${res.statusText}: ${text}`);
  }

  if (res.status === 204 || res.status === 205) return undefined as unknown as T;

  const ct = res.headers.get('content-type') ?? '';
  if (!ct.includes('application/json')) {
    const txt = await res.text().catch(() => '');
    return (txt ? (txt as unknown as T) : (undefined as unknown as T));
  }

  const raw = await res.text();
  if (!raw) return undefined as unknown as T;
  return JSON.parse(raw) as T;
}

/** Guarded (Bearer) variant */
export async function apiGetGoogleAuthUrl(
  token: string | null,
  opts?: { agentId?: string; returnTo?: string },
): Promise<GoogleAuthUrlResponse> {
  const qs = new URLSearchParams();
  if (opts?.agentId) qs.set('agentId', opts.agentId);
  if (opts?.returnTo) qs.set('returnTo', opts.returnTo);

  const url = `${BASE}${PATH_URL}${qs.toString() ? `?${qs}` : ''}`;
  return authFetch<GoogleAuthUrlResponse>(url, { method: 'GET', token });
}

/** Simple (unauthenticated) dev helper */
export async function apiGetGoogleAuthUrlSimple(
  opts?: { agentId?: string; returnTo?: string },
): Promise<GoogleAuthUrlResponse> {
  const qs = new URLSearchParams();
  if (opts?.agentId) qs.set('agentId', opts.agentId);
  if (opts?.returnTo) qs.set('returnTo', opts.returnTo);

  const url = `${BASE}${PATH_URL}${qs.toString() ? `?${qs}` : ''}`;
  const res = await fetch(url, { method: 'GET' });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} ${res.statusText}: ${text}`);
  }
  const raw = await res.text();
  return (raw ? JSON.parse(raw) : { url: '' }) as GoogleAuthUrlResponse;
}

export async function apiGoogleCallback(
  token: string | null,
  body: GoogleCallbackBody,
): Promise<BasicMessageResponse> {
  const url = `${BASE}${PATH_CALLBACK}`;
  return authFetch<BasicMessageResponse>(url, {
    method: 'POST',
    body: JSON.stringify(body),
    token,
  });
}

'use client';

import { useAuth } from '@clerk/nextjs';
import { useApiToken } from './api-token-provider';

/**
 * Client fetcher that:
 * 1) Uses the server-provided token from ApiTokenProvider if present;
 * 2) Otherwise falls back to Clerk's useAuth().getToken() on the client.
 */
export function useApiClient() {
  const ctxToken = useApiToken();           // <- server token if provided
  const { getToken } = useAuth();
  const API = process.env.NEXT_PUBLIC_BACKEND_API_URL;

  if (!API) throw new Error('Missing NEXT_PUBLIC_BACKEND_API_URL env var.');

  async function request<T = unknown>(path: string, init?: RequestInit): Promise<T> {
    const token = ctxToken ?? (await getToken()); // prefer the server token
    if (!token) throw new Error('No Clerk session token (user not signed in).');

    const res = await fetch(`${API}${path}`, {
      ...init,
      headers: {
        ...(init?.headers || {}),
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`API ${res.status} ${res.statusText}: ${text}`);
    }

    if (res.status === 204) return undefined as T; // No Content
    const ct = res.headers.get('content-type') || '';
    return (ct.includes('application/json') ? await res.json() : await res.text()) as T;
  }

  return { request };
}

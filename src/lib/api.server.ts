import { auth } from '@clerk/nextjs/server';

const API = process.env.NEXT_PUBLIC_BACKEND_API_URL;
if (!API) throw new Error('Missing NEXT_PUBLIC_BACKEND_API_URL env var.');

export async function apiServer<T = unknown>(path: string, init?: RequestInit): Promise<T> {
  const { getToken } = await auth();
  const token = await getToken();
  if (!token) throw new Error('No Clerk session token (server).');

  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      ...(init?.headers || {}),
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`API ${res.status} ${res.statusText}: ${text}`);
  }

  if (res.status === 204) return undefined as T;
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) return (await res.json()) as T;
  return (await res.text()) as unknown as T;
}

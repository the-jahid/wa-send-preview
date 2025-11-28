// Single fetch helper usable from SERVER and CLIENT
// - Builds absolute URL on server (for Route Handlers)
// - Supports query string and override of cache/credentials/etc.

export const apiBase =
  typeof window === "undefined"
    ? process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"
    : "";

export type Query = Record<string, string | number | boolean | undefined | null>;

export type FetcherOptions = RequestInit & {
  query?: Query;
  /**
   * If you use ISR on the server, pass: { next: { revalidate: N } } via init.
   * If you want live SSR: set { cache: "no-store" } (default below).
   */
};

export class HttpError extends Error {
  status: number;
  body?: unknown;
  constructor(message: string, status: number, body?: unknown) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

function buildUrl(path: string, query?: Query) {
  const url = new URL(path, apiBase);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== null) url.searchParams.append(k, String(v));
    }
  }
  return url.toString();
}

export async function fetchJson<T>(path: string, options: FetcherOptions = {}): Promise<T> {
  const { query, headers, ...init } = options;

  const url = buildUrl(path, query);
  const res = await fetch(url, {
    // "no-store" avoids Next edge cache by default; override per-call as needed.
    cache: "no-store",
    credentials: "include",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(headers || {}),
    },
  });

  const isJson = res.headers.get("content-type")?.includes("application/json");
  const body = isJson ? await res.json().catch(() => undefined) : await res.text().catch(() => undefined);

  if (!res.ok) {
    const message =
      (isJson && (body as any)?.message) ||
      (typeof body === "string" && body.slice(0, 200)) ||
      `${res.status} ${res.statusText}`;
    throw new HttpError(message, res.status, body);
  }

  return body as T;
}

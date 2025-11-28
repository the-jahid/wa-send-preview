import { fetchJson, type FetcherOptions } from "./fetcher";

type Body = Record<string, unknown> | undefined;

export const http = {
  get:  <T>(path: string, opts?: FetcherOptions) => fetchJson<T>(path, { method: "GET",  ...opts }),
  post: <T>(path: string, body?: Body, opts?: FetcherOptions) =>
    fetchJson<T>(path, { method: "POST", body: body ? JSON.stringify(body) : undefined, ...opts }),
  patch:<T>(path: string, body?: Body, opts?: FetcherOptions) =>
    fetchJson<T>(path, { method: "PATCH", body: body ? JSON.stringify(body) : undefined, ...opts }),
  put:  <T>(path: string, body?: Body, opts?: FetcherOptions) =>
    fetchJson<T>(path, { method: "PUT", body: body ? JSON.stringify(body) : undefined, ...opts }),
  del:  <T>(path: string, opts?: FetcherOptions) => fetchJson<T>(path, { method: "DELETE", ...opts }),
};

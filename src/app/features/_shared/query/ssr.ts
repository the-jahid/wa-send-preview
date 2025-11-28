// Small helpers for SSR prefetch + hydration (TanStack v5)
import {
  dehydrate,
  QueryClient,
  type FetchQueryOptions,
  type QueryKey,
} from "@tanstack/react-query";

/** Minimal shape we need from queryOptions(...) / useQuery options */
type AnyQuery = {
  queryKey?: QueryKey;
  queryFn?: (...args: any[]) => unknown;
  // allow everything else without fighting generics
  [k: string]: any;
};

function toFetchOptions(q: AnyQuery): FetchQueryOptions {
  const { queryKey, queryFn, ...rest } = q;
  if (!queryKey || !queryFn) {
    throw new Error("prefetch requires both queryKey and queryFn.");
  }
  return {
    ...(rest as any),
    queryKey: queryKey as QueryKey,
    queryFn: queryFn as any,
  } as FetchQueryOptions;
}

/** Prefetch a single query built with queryOptions(...) */
export async function prefetchOne(qc: QueryClient, q: AnyQuery) {
  return qc.prefetchQuery(toFetchOptions(q));
}

/** Prefetch many queries built with queryOptions(...) */
export async function prefetchAll(qc: QueryClient, queries: ReadonlyArray<AnyQuery>) {
  await Promise.all(queries.map((q) => qc.prefetchQuery(toFetchOptions(q))));
  return qc;
}

export function dehydrateState(qc: QueryClient) {
  return dehydrate(qc);
}

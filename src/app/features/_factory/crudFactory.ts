// Generic CRUD factory for TanStack Query (App Router friendly)
"use client";

import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
  type QueryKey,
  type UndefinedInitialDataOptions,
} from "@tanstack/react-query";

/**
 * Your API layer must implement these methods for a resource.
 */
export type CrudApi<Resource, CreateDto, UpdateDto, ListQuery = any> = {
  list: (query?: ListQuery) => Promise<Resource[] | { items: Resource[]; total?: number }>;
  get: (id: string) => Promise<Resource>;
  create: (dto: CreateDto) => Promise<Resource>;
  update: (id: string, dto: UpdateDto) => Promise<Resource>;
  remove: (id: string) => Promise<{ success: boolean } | Resource | void>;
};

export function makeCrud<Resource, CreateDto, UpdateDto, ListQuery = any>(
  resourceKey: string,
  api: CrudApi<Resource, CreateDto, UpdateDto, ListQuery>,
  opts?: {
    /** default staleTime for queries (ms). */
    staleTime?: number;
  },
) {
  const staleTime = opts?.staleTime ?? 60_000;

  // ----- Keys (stable) -----
  const keys = {
    all: [resourceKey] as const,
    lists: () => [resourceKey, "lists"] as const,
    list: (q?: ListQuery) => [resourceKey, "list", q ?? {}] as const,
    details: () => [resourceKey, "details"] as const,
    detail: (id: string) => [resourceKey, "detail", id] as const,
  };

  // ----- QueryOptions builders (SSR-friendly) -----
  const queries = {
    list: (q?: ListQuery) =>
      queryOptions({
        queryKey: keys.list(q),
        queryFn: () => api.list(q),
        staleTime,
      }),
    detail: (id: string) =>
      queryOptions({
        queryKey: keys.detail(id),
        queryFn: () => api.get(id),
        staleTime,
        enabled: !!id,
      }),
  };

  // ----- Client hooks -----
  const useList = (
    q?: ListQuery,
    extra?: Partial<
      UndefinedInitialDataOptions<
        Awaited<ReturnType<typeof api.list>>,
        Error,
        Awaited<ReturnType<typeof api.list>>,
        QueryKey
      >
    >,
  ) => useQuery({ ...queries.list(q), ...(extra as any) });

  const useDetail = (
    id: string,
    extra?: Partial<
      UndefinedInitialDataOptions<Resource, Error, Resource, QueryKey>
    >,
  ) => useQuery({ ...queries.detail(id), ...(extra as any) });

  const useCreate = () => {
    const qc = useQueryClient();
    return useMutation({
      mutationFn: (dto: CreateDto) => api.create(dto),
      onSuccess: () => qc.invalidateQueries({ queryKey: keys.all as QueryKey }),
    });
  };

  const useUpdate = (id: string) => {
    const qc = useQueryClient();
    return useMutation({
      mutationFn: (dto: UpdateDto) => api.update(id, dto),
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: keys.detail(id) as QueryKey });
        qc.invalidateQueries({ queryKey: keys.lists() as QueryKey });
      },
    });
  };

  const useRemove = () => {
    const qc = useQueryClient();
    return useMutation({
      mutationFn: (id: string) => api.remove(id),
      onSuccess: () => qc.invalidateQueries({ queryKey: keys.all as QueryKey }),
    });
  };

  return {
    keys,
    queries,
    hooks: { useList, useDetail, useCreate, useUpdate, useRemove },
  };
}

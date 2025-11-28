import { queryOptions } from "@tanstack/react-query";
import { PostsAPI } from "./posts.api";
import { postKeys } from "./posts.keys";

export const postQueries = {
  list: (q?: { limit?: number }) =>
    queryOptions({
      queryKey: postKeys.list(q),
      queryFn: () => PostsAPI.list(q),
      staleTime: 60_000, // keep fresh for 60s
    }),

  detail: (id: number) =>
    queryOptions({
      queryKey: postKeys.detail(id),
      queryFn: () => PostsAPI.get(id),
      staleTime: 60_000,
      enabled: !!id,
    }),
};

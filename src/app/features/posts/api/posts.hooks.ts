"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { PostsAPI } from "./posts.api";
import { postKeys } from "./posts.keys";
import type { CreatePostDto, UpdatePostDto } from "./posts.types";
import { postQueries } from "./posts.query";

export const usePosts = (q?: { limit?: number }) => useQuery(postQueries.list(q));
export const usePost  = (id: number) => useQuery(postQueries.detail(id));

export const useCreatePost = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreatePostDto) => PostsAPI.create(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: postKeys.all }),
  });
};

export const useUpdatePost = (id: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdatePostDto) => PostsAPI.update(id, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: postKeys.detail(id) });
      qc.invalidateQueries({ queryKey: postKeys.list() });
    },
  });
};

export const useDeletePost = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => PostsAPI.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: postKeys.all }),
  });
};

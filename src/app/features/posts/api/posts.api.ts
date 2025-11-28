
import { http } from "../../_shared/api/http";
import type { Post, CreatePostDto, UpdatePostDto } from "./posts.types";

const BASE = "https://jsonplaceholder.typicode.com";

export const PostsAPI = {
  list: (q?: { limit?: number }) =>
    http.get<Post[]>(`${BASE}/posts`, { query: { _limit: q?.limit ?? 10 } }),

  get: (id: number) => http.get<Post>(`${BASE}/posts/${id}`),

  create: (dto: CreatePostDto) => http.post<Post>(`${BASE}/posts`, dto),

  update: (id: number, dto: UpdatePostDto) => http.put<Post>(`${BASE}/posts/${id}`, dto),

  remove: (id: number) => http.del<{ success: true }>(`${BASE}/posts/${id}`),
};

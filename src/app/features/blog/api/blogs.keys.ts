import type { BlogListParams } from "./blogs.types";

export const blogKeys = {
    all: ["blogs"] as const,
    lists: () => [...blogKeys.all, "list"] as const,
    list: (params?: BlogListParams) => [...blogKeys.lists(), params] as const,
    details: () => [...blogKeys.all, "detail"] as const,
    detail: (idOrSlug: string) => [...blogKeys.details(), idOrSlug] as const,
    myBlogs: (params?: BlogListParams) => [...blogKeys.all, "my", params] as const,
};

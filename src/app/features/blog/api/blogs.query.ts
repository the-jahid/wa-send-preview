import { queryOptions } from "@tanstack/react-query";
import { BlogsPublicAPI } from "./blogs.api";
import { blogKeys } from "./blogs.keys";
import type { BlogListParams } from "./blogs.types";

export const blogQueries = {
    list: (params?: BlogListParams) =>
        queryOptions({
            queryKey: blogKeys.list(params),
            queryFn: () => BlogsPublicAPI.list(params),
        }),

    byId: (id: string) =>
        queryOptions({
            queryKey: blogKeys.detail(id),
            queryFn: () => BlogsPublicAPI.getById(id),
            enabled: !!id,
        }),
};

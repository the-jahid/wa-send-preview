"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";

import { BlogsAuthAPI } from "./blogs.api";
import { blogKeys } from "./blogs.keys";
import { blogQueries } from "./blogs.query";
import type { BlogListParams, CreateBlogWithImageDto, UpdateBlogWithImageDto } from "./blogs.types";

// ============================================
// PUBLIC HOOKS (No authentication required)
// ============================================

/** Fetch paginated published blogs */
export const useBlogs = (params?: BlogListParams) => useQuery(blogQueries.list(params));

/** Fetch single blog by ID */
export const useBlogById = (id: string) => useQuery(blogQueries.byId(id));

// ============================================
// AUTHENTICATED HOOKS (Requires sign-in)
// ============================================

/** Fetch current user's blogs */
export const useMyBlogs = (params?: BlogListParams) => {
    const { getToken } = useAuth();

    return useQuery({
        queryKey: blogKeys.myBlogs(params),
        queryFn: async () => {
            const token = await getToken();
            if (!token) throw new Error("Not authenticated");
            return BlogsAuthAPI.listMyBlogs(token, params);
        },
    });
};

/** Create a new blog with optional image */
export const useCreateBlog = () => {
    const qc = useQueryClient();
    const { getToken } = useAuth();

    return useMutation({
        mutationFn: async (dto: CreateBlogWithImageDto) => {
            const token = await getToken();
            if (!token) throw new Error("Not authenticated");
            return BlogsAuthAPI.create(token, dto);
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: blogKeys.all });
        },
    });
};

/** Update an existing blog with optional image */
export const useUpdateBlog = (id: string) => {
    const qc = useQueryClient();
    const { getToken } = useAuth();

    return useMutation({
        mutationFn: async (dto: UpdateBlogWithImageDto) => {
            const token = await getToken();
            if (!token) throw new Error("Not authenticated");
            return BlogsAuthAPI.update(token, id, dto);
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: blogKeys.detail(id) });
            qc.invalidateQueries({ queryKey: blogKeys.lists() });
            qc.invalidateQueries({ queryKey: blogKeys.myBlogs() });
        },
    });
};

/** Delete image from a blog */
export const useDeleteBlogImage = (id: string) => {
    const qc = useQueryClient();
    const { getToken } = useAuth();

    return useMutation({
        mutationFn: async () => {
            const token = await getToken();
            if (!token) throw new Error("Not authenticated");
            return BlogsAuthAPI.deleteImage(token, id);
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: blogKeys.detail(id) });
            qc.invalidateQueries({ queryKey: blogKeys.lists() });
        },
    });
};

/** Delete a blog */
export const useDeleteBlog = () => {
    const qc = useQueryClient();
    const { getToken } = useAuth();

    return useMutation({
        mutationFn: async (id: string) => {
            const token = await getToken();
            if (!token) throw new Error("Not authenticated");
            return BlogsAuthAPI.delete(token, id);
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: blogKeys.all });
        },
    });
};

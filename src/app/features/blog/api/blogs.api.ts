import type {
    Blog,
    PaginatedBlogs,
    CreateBlogWithImageDto,
    UpdateBlogWithImageDto,
    BlogListParams,
} from "./blogs.types";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL ?? "http://localhost:3000";
const BASE = `${API_URL}/blogs`;

// Helper to build query string
function buildQueryString(params?: BlogListParams): string {
    if (!params) return "";
    const query = new URLSearchParams();
    if (params.page) query.set("page", String(params.page));
    if (params.limit) query.set("limit", String(params.limit));
    if (params.search) query.set("search", params.search);
    const str = query.toString();
    return str ? `?${str}` : "";
}

// ============================================
// PUBLIC API (No authentication required)
// ============================================
export const BlogsPublicAPI = {
    /** Get paginated published blogs */
    list: async (params?: BlogListParams): Promise<PaginatedBlogs> => {
        const res = await fetch(`${BASE}${buildQueryString(params)}`);
        if (!res.ok) throw await res.json();
        return res.json();
    },

    /** Get single blog by ID (increments view count) */
    getById: async (id: string): Promise<Blog> => {
        const res = await fetch(`${BASE}/${id}`);
        if (!res.ok) throw await res.json();
        return res.json();
    },

    /** Get image URL for a blog */
    getImageUrl: (id: string): string => `${BASE}/${id}/image`,
};

// ============================================
// AUTHENTICATED API (Requires Bearer token)
// ============================================
export const BlogsAuthAPI = {
    /** Get current user's blogs */
    listMyBlogs: async (token: string, params?: BlogListParams): Promise<PaginatedBlogs> => {
        const res = await fetch(`${BASE}/my${buildQueryString(params)}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw await res.json();
        return res.json();
    },

    /** Create a new blog with optional image (uses FormData) */
    create: async (token: string, dto: CreateBlogWithImageDto): Promise<Blog> => {
        const formData = new FormData();
        formData.append("title", dto.title);
        formData.append("content", dto.content);
        if (dto.image) {
            formData.append("image", dto.image);
        }

        const res = await fetch(`${BASE}`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: formData, // Don't set Content-Type, browser handles multipart boundary
        });
        if (!res.ok) throw await res.json();
        return res.json();
    },

    /** Update an existing blog with optional image (uses FormData) */
    update: async (token: string, id: string, dto: UpdateBlogWithImageDto): Promise<Blog> => {
        const formData = new FormData();
        if (dto.title !== undefined) formData.append("title", dto.title);
        if (dto.content !== undefined) formData.append("content", dto.content);
        if (dto.image) {
            formData.append("image", dto.image);
        }

        const res = await fetch(`${BASE}/${id}`, {
            method: "PATCH",
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
        });
        if (!res.ok) throw await res.json();
        return res.json();
    },

    /** Delete image from a blog (keeps the blog itself) */
    deleteImage: async (token: string, id: string): Promise<Blog> => {
        const res = await fetch(`${BASE}/${id}/image`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw await res.json();
        return res.json();
    },

    /** Delete a blog */
    delete: async (token: string, id: string): Promise<void> => {
        const res = await fetch(`${BASE}/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw await res.json();
    },
};

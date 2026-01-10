import { z } from "zod";

// Full Blog schema - matches API spec with image support
export const Blog = z.object({
    id: z.string().uuid(),
    title: z.string(),
    content: z.string(),
    viewCount: z.number(),
    createdAt: z.string(),
    updatedAt: z.string(),
    oauthId: z.string(), // Clerk user ID of author
    // Image fields
    hasImage: z.boolean(),
    imageMimeType: z.string().nullable(),
    imageFileName: z.string().nullable(),
    imageSize: z.number().nullable(),
});
export type Blog = z.infer<typeof Blog>;

// Paginated blogs response
export const PaginatedBlogs = z.object({
    blogs: z.array(Blog),
    total: z.number(),
    page: z.number(),
    limit: z.number(),
});
export type PaginatedBlogs = z.infer<typeof PaginatedBlogs>;

// Create Blog DTO (form validation only - text fields)
export const CreateBlogDto = z.object({
    title: z.string().min(1).max(200),
    content: z.string().min(1),
});
export type CreateBlogDto = z.infer<typeof CreateBlogDto>;

// Create Blog with optional image (for API calls)
export interface CreateBlogWithImageDto {
    title: string;
    content: string;
    image?: File;
}

// Update Blog DTO (all fields optional)
export const UpdateBlogDto = CreateBlogDto.partial();
export type UpdateBlogDto = z.infer<typeof UpdateBlogDto>;

// Update Blog with optional image (for API calls)
export interface UpdateBlogWithImageDto {
    title?: string;
    content?: string;
    image?: File;
}

// Query parameters for listing blogs
export interface BlogListParams {
    page?: number;
    limit?: number;
    search?: string;
}

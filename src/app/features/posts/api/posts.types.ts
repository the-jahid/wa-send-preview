import { z } from "zod";

export const Post = z.object({
  userId: z.number(),
  id: z.number(),
  title: z.string(),
  body: z.string(),
});
export type Post = z.infer<typeof Post>;

export const CreatePostDto = z.object({
  title: z.string().min(1),
  body: z.string().min(1),
  userId: z.number().default(1),
});
export type CreatePostDto = z.infer<typeof CreatePostDto>;

export const UpdatePostDto = CreatePostDto.partial();
export type UpdatePostDto = z.infer<typeof UpdatePostDto>;

import { z } from "zod";

/** Offset pagination (classic page/size) */
export const OffsetPageQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  size: z.coerce.number().int().min(1).max(200).default(20),
  q: z.string().optional(),
  sort: z.string().optional(), // e.g., "createdAt:desc"
});
export type OffsetPageQuery = z.infer<typeof OffsetPageQuery>;

export type Paginated<T> = {
  items: T[];
  page: number;
  size: number;
  total: number;
};

/** Cursor pagination (for infinite lists) */
export const CursorPageQuery = z.object({
  cursor: z.string().nullish(),     // opaque cursor
  limit: z.coerce.number().int().min(1).max(200).default(20),
  q: z.string().optional(),
});
export type CursorPageQuery = z.infer<typeof CursorPageQuery>;

export type CursorPaginated<T> = {
  items: T[];
  nextCursor?: string | null;
};

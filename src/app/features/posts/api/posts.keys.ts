export const postKeys = {
  all: ["posts"] as const,
  list: (q?: object) => ["posts", "list", q ?? {}] as const,
  detail: (id: number) => ["posts", "detail", id] as const,
};

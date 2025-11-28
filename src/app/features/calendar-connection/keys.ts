export const calendarConnectionKeys = {
  all: ['calendarConnections'] as const,
  list: (page: number, pageSize: number) =>
    [...calendarConnectionKeys.all, 'list', { page, pageSize }] as const,
  detail: (id: string) => [...calendarConnectionKeys.all, 'detail', id] as const,
};

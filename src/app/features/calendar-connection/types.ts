export type CalendarProvider = 'GOOGLE' | string;

export type ExternalCalendarConnection = {
  id: string;
  provider: CalendarProvider;
  accountEmail: string;
  accessTokenExpiresAt: string | null;
  calendarId: string | null;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
};

export type ListEnvelope<T> = {
  data: T[];
  meta: {
    pagination: { page: number; pageSize: number; total: number; totalPages: number };
  };
  links: { self: string; first: string; prev: string | null; next: string | null; last: string };
  http: { status: number };
};

export type ItemEnvelope<T> = {
  data: T;
  links?: Record<string, string | null>;
  http?: { status: number };
};

// ---- DTOs (match backend Zod) ----
export type CreateCalendarConnectionInput = {
  provider: CalendarProvider;
  accountEmail: string;
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt?: string | null;
  calendarId?: string | null;
  isPrimary?: boolean;
};

export type UpdateCalendarConnectionInput = {
  isPrimary?: boolean;
  calendarId?: string;
};

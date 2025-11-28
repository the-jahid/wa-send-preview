// app/features/appointment-lead-item/types.ts
export type UUID = string;

export type AppointmentLeadItem = {
  id: UUID;
  agentId: UUID;
  name: string;
  description?: string | null;
  createdAt: string; // ISO
  updatedAt: string; // ISO
};

export type ListParams = {
  agentId: UUID;
  search?: string;
  take?: number;      // optional; 1..100
  cursor?: string;    // last id from previous page
};

export type CreatePayload = {
  name: string;
  description?: string;
};

export type UpdatePayload = {
  name?: string;
  description?: string;
};

export type ListResponse<T> = {
  data: T[];
  nextCursor?: string;
};

export type SingleResponse<T> = {
  data: T;
};

// src/app/features/outbound-campaign-template/types.ts

/* ---- API envelope ---- */
export type ApiResponse<T> = {
  success: boolean;
  data: T;
  meta?: Record<string, unknown>;
};

/* ---- Enums (mirror Prisma) ---- */
export type TemplateMediaType = 'NONE' | 'IMAGE' | 'VIDEO' | 'DOCUMENT';

/* ---- Entity (public shape from backend) ---- */
export type Template = {
  id: string;
  name: string;
  body: string;
  variables: string[];

  mediaType: TemplateMediaType;
  mediaMimeType?: string | null;
  mediaFileName?: string | null;
  mediaSize?: number | null;
  mediaWidth?: number | null;
  mediaHeight?: number | null;

  createdAt: string;
  updatedAt: string;
  agentId: string;

  hasMedia: boolean; // computed by backend
};

/* ---- List ---- */
export type ListTemplatesRequest = {
  agentId: string;
  q?: string;
  skip?: number;
  take?: number;
  orderBy?: 'createdAt' | 'updatedAt' | 'name';
  orderDir?: 'asc' | 'desc';
};

export type ListTemplatesResponse = {
  items: Template[];
  total: number;
  skip: number;
  take: number;
};

/* ---- DTOs ---- */
export type CreateTemplateDto = {
  agentId: string;
  name: string;
  body?: string;
  variables?: string[];
};

export type UpdateTemplateDto = Partial<Omit<CreateTemplateDto, 'agentId'>>;

// ----------------------------------------------
// src/features/agent/types.ts
// Shape mirrors the Nest controller envelopes.
// Envelopes are generic so they can be reused.
// Enum-like fields are string unions with a string
// fallback for forward-compat.
// ----------------------------------------------

export type UUID = string;

/* ---------- Provider / Model enums (string unions) ---------- */
export type AIModel = 'CHATGPT' | 'GEMINI' | 'CLAUDE' | string;

export type OpenAIModel = string;
export type GeminiModel = string;
export type ClaudeModel = string;

// MemoryType from backend (keep string-friendly)
export type MemoryType = 'BUFFER' | 'NONE' | 'RAG' | 'VECTOR' | string;

/* ---------- Core Agent (response) ---------- */
export interface AgentResponse {
  id: UUID;
  name: string;
  prompt: string | null;

  /** Masked alias for UI (****abcd). Never raw. */
  apiKey: string | null;

  isActive: boolean;
  isLeadsActive: boolean;
  isEmailActive: boolean;

  createdAt: string; // ISO
  updatedAt: string; // ISO

  userId: UUID;
  memoryType: MemoryType;

  isKnowledgebaseActive: boolean;
  isBookingActive: boolean;

  modelType: AIModel;
  useOwnApiKey: boolean;

  /** Also masked. */
  userProvidedApiKey: string | null;

  openAIModel: OpenAIModel | null;
  geminiModel: GeminiModel | null;
  claudeModel: ClaudeModel | null;

  historyLimit: number | null;
}

/** Friendly alias used by apis.ts */
export type Agent = AgentResponse;

/* ---------- Links & Meta ---------- */
export interface ResourceLinks {
  self: string;
  update: string;
  delete: string;
}

export interface HttpMeta {
  statusCode: number;
  message: string;
  timestamp: string; // ISO
  path: string;
}

/* ---------- Generic envelopes ---------- */
export type SingleEnvelope<T> = {
  data: T;
  links: ResourceLinks;
  meta: HttpMeta;
};

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginationLinks {
  self: string;
  first: string;
  prev: string | null;
  next: string | null;
  last: string;
}

export type PaginatedEnvelope<T> = {
  data: T[];
  meta: PaginationMeta;
  links: PaginationLinks;
  http: HttpMeta; // separate from pagination meta
};

/* ---------- Concrete agent envelopes (generic-compatible) ---------- */
export type SingleAgentEnvelope<T = Agent> = SingleEnvelope<T>;
export type PaginatedAgentsEnvelope<T = Agent> = PaginatedEnvelope<T>;

/* ---------- Create / Update payloads (client-side) ---------- */
/** What the UI sends on create; controller injects userId. */
export interface CreateAgentPayload {
  name: string;
  memoryType: MemoryType;

  // toggles
  isActive?: boolean;
  isLeadsActive?: boolean;
  isEmailActive?: boolean;

  // alias for server field userProvidedApiKey (controller maps)
  apiKey?: string | null;

  prompt?: string | null;

  // provider & models
  modelType?: AIModel;
  openAIModel?: OpenAIModel | null;
  geminiModel?: GeminiModel | null;
  claudeModel?: ClaudeModel | null;

  useOwnApiKey?: boolean;

  /** Optional default history length for BUFFER memory */
  historyLimit?: number | null;
}

export interface UpdateAgentPayload {
  name?: string;
  memoryType?: MemoryType;

  isActive?: boolean;
  isLeadsActive?: boolean;
  isEmailActive?: boolean;

  // alias; controller maps apiKey -> userProvidedApiKey
  apiKey?: string | null;
  userProvidedApiKey?: string | null;

  prompt?: string | null;

  modelType?: AIModel;
  openAIModel?: OpenAIModel | null;
  geminiModel?: GeminiModel | null;
  claudeModel?: ClaudeModel | null;

  useOwnApiKey?: boolean;

  historyLimit?: number | null;
}

/* ---------- Aliases used by apis.ts ---------- */
export type CreateAgentInput = CreateAgentPayload;
export type UpdateAgent = UpdateAgentPayload;

/* ---------- Query params for list endpoints ---------- */
export type ListAgentsQuery = {
  page?: number;
  limit?: number;

  // Sorting
  sort?: string; // "createdAt:desc,name:asc"
  sortBy?:
    | 'id'
    | 'name'
    | 'prompt'
    | 'apiKey'
    | 'isActive'
    | 'memoryType'
    | 'isLeadsActive'
    | 'isEmailActive'
    | 'isKnowledgebaseActive'
    | 'isBookingActive'
    | 'useOwnApiKey'
    | 'historyLimit'
    | 'modelType'
    | 'openAIModel'
    | 'geminiModel'
    | 'claudeModel'
    | 'createdAt'
    | 'updatedAt';
  sortOrder?: 'asc' | 'desc';

  // IDs
  id?: string;
  ids?: string; // csv

  // Booleans
  isActive?: boolean;
  isLeadsActive?: boolean;
  isEmailActive?: boolean;
  isKnowledgebaseActive?: boolean;
  isBookingActive?: boolean;
  useOwnApiKey?: boolean;

  // Enums
  memoryType?: MemoryType;
  modelType?: AIModel;
  openAIModel?: OpenAIModel;
  geminiModel?: GeminiModel;
  claudeModel?: ClaudeModel;

  // Numeric
  historyLimit?: number;

  // Partial text
  name?: string;
  prompt?: string;
  apiKey?: string;

  // Global search
  search?: string;

  // Date ranges (ISO datetime)
  createdAtFrom?: string;
  createdAtTo?: string;
  updatedAtFrom?: string;
  updatedAtTo?: string;
};

/** Alias used by apis.ts */
export type AgentsListParams = ListAgentsQuery;

/* ---------- Model options endpoints ---------- */
export type ModelOption = { value: string; label: string };

export interface AllModelOptions {
  providers: ModelOption[];
  modelsByProvider: {
    CHATGPT: ModelOption[];
    GEMINI: ModelOption[];
    CLAUDE: ModelOption[];
    [k: string]: ModelOption[];
  };
}

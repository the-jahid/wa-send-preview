// app/(lib)/knowledgebase/types.ts
// Shared frontend types for Knowledgebase (Next.js side).
// Mirrors Nest backend interfaces & Prisma models,
// using ISO strings for dates (transport-friendly).

/* =========================================
 * Enums (mirror backend)
 * ========================================= */
export type KnowledgeSourceType = 'TEXT' | 'FILE' | 'URL';
export type KnowledgeItemStatus = 'PROCESSING' | 'ACTIVE' | 'FAILED' | 'DELETED';

/* =========================================
 * Core Entities
 * ========================================= */
export interface KnowledgeBase {
  id: string;
  agentId: string; // Pinecone namespace == agentId
  freeText?: string | null;
  companyName?: string | null;
  companyDescription?: string | null;

  // Default embedding config for this KB
  embeddingModel: string;         // e.g., "text-embedding-3-large"
  embeddingDimensions: number;    // e.g., 3072

  createdAt: string; // ISO
  updatedAt: string; // ISO
}

export interface KnowledgeBaseDocument {
  id: string;
  knowledgeBaseId: string;

  title: string;
  content?: string | null; // extracted or raw text (for TEXT docs)
  tags: string[];

  sourceType: KnowledgeSourceType;
  status: KnowledgeItemStatus;
  deletedAt?: string | null;

  // File metadata (when sourceType === 'FILE')
  fileName?: string | null;
  fileExt?: string | null;
  mimeType?: string | null;
  fileSize?: number | null;
  checksum?: string | null;
  storagePath?: string | null;

  // Pinecone mapping
  vectorNamespace: string; // equals agentId
  vectorIdPrefix: string;  // prefix used to build chunk IDs
  vectorCount: number;
  lastUpsertedAt?: string | null;

  // Persisted embedding/chunking settings
  embeddingModel: string;
  embeddingDimensions: number;
  chunkSize: number;
  chunkOverlap: number;
  tokenCount?: number | null;

  metadata?: Record<string, unknown> | null;

  createdAt: string; // ISO
  updatedAt: string; // ISO
}

export interface Paginated<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface KnowledgeSearchMatch {
  id: string;
  score?: number;
  metadata?: Record<string, unknown>;
  documentId?: string;
  chunkIndex?: number;
  text?: string;
}

/* =========================================
 * API helpers
 * ========================================= */
export interface KBRouteParams {
  agentId: string;
  documentId?: string;
}

export interface APIError {
  status: number;
  message: string;
  details?: unknown;
}

/** Optional auth token (Clerk JWT) passed to API calls */
export interface WithAuth {
  authToken?: string;
}

/* =========================================
 * Re-export DTO input types from schemas.ts
 * (so callers can import from a single place)
 * ========================================= */
export type {
  UpdateKnowledgeBaseInput,
  CreateTextDocumentInput,
  CreateFileDocumentMetaInput,
  CreateFileUploadInput,        // <- added for one-shot upload route
  UpsertExtractionInput,
  ListDocumentsQuery,
  UpdateDocumentPatch,
  DeleteDocumentQuery,
  KnowledgeSearchInput,
} from './schemas';

/* =========================================
 * Type guards
 * ========================================= */
export function isAPIError(x: unknown): x is APIError {
  return (
    typeof x === 'object' &&
    x !== null &&
    'status' in x &&
    typeof (x as any).status === 'number' &&
    'message' in x &&
    typeof (x as any).message === 'string'
  );
}

// app/(lib)/knowledgebase/schemas.ts
// Zod schemas + Types for the Next.js (TanStack Query) client.
// Mirrors the Nest DTOs to keep client ↔ server payloads in sync.

import { z } from 'zod';

/* ================================
 * Client defaults (env-safe)
 * ================================ */
export const DEFAULT_EMBEDDING_MODEL =
  process.env.NEXT_PUBLIC_EMBEDDING_MODEL || 'text-embedding-3-large';
export const DEFAULT_EMBEDDING_DIMENSIONS = Number(
  process.env.NEXT_PUBLIC_EMBEDDING_DIMENSIONS || 3072
);

/* ================================
 * Enums (mirror backend)
 * ================================ */
export const KnowledgeSourceTypeEnum = z.enum(['TEXT', 'FILE', 'URL']);
export const KnowledgeItemStatusEnum = z.enum([
  'PROCESSING',
  'ACTIVE',
  'FAILED',
  'DELETED',
]);

export const SortEnum = z.enum([
  'createdAt:desc',
  'createdAt:asc',
  'updatedAt:desc',
  'updatedAt:asc',
]);

/* ================================
 * Shared bits
 * ================================ */
export const PaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

/** Aligned to backend clamps (service/repo) */
export const ChunkingSchema = z.object({
  chunkSize: z.coerce.number().int().min(200).max(2000).default(800),
  chunkOverlap: z.coerce.number().int().min(0).max(1000).default(200),
});

/* ================================
 * KnowledgeBase
 * ================================ */
export const UpdateKnowledgeBaseSchema = z
  .object({
    freeText: z.string().max(50_000).optional(),
    companyName: z.string().max(300).optional(),
    companyDescription: z.string().max(10_000).optional(),
    embeddingModel: z.string().optional(),
    embeddingDimensions: z.coerce.number().int().min(128).max(8192).optional(),
  })
  .strict();

/* ================================
 * Documents – Create (TEXT)
 * ================================ */
export const CreateTextDocumentSchema = z
  .object({
    title: z.string().min(1).max(200).default('Untitled'),
    content: z.string().min(1, 'Content is required'),
    tags: z.array(z.string().trim().min(1)).max(20).default([]),

    // Optional overrides
    embeddingModel: z.string().default(DEFAULT_EMBEDDING_MODEL),
    embeddingDimensions: z
      .coerce.number()
      .int()
      .min(128)
      .max(8192)
      .default(DEFAULT_EMBEDDING_DIMENSIONS),

    // Chunking
    chunkSize: ChunkingSchema.shape.chunkSize.default(800),
    chunkOverlap: ChunkingSchema.shape.chunkOverlap.default(200),

    // Optional stable vector id prefix
    vectorIdPrefix: z
      .string()
      .regex(/^[a-zA-Z0-9_\-:.]+$/)
      .max(120)
      .optional(),

    // Free-form metadata
    metadata: z.record(z.string(), z.any()).optional(),
  })
  .strict();

/* ================================
 * Documents – Create (FILE meta)
 * (binary handled by upload pipeline)
 * ================================ */
export const CreateFileDocumentMetaSchema = z
  .object({
    title: z.string().min(1).max(200),
    tags: z.array(z.string().trim().min(1)).max(20).default([]),

    fileName: z.string().min(1),
    mimeType: z.string().min(1),
    fileSize: z.coerce.number().int().min(1),
    checksum: z.string().max(128).optional(),

    embeddingModel: z.string().default(DEFAULT_EMBEDDING_MODEL),
    embeddingDimensions: z
      .coerce.number()
      .int()
      .min(128)
      .max(8192)
      .default(DEFAULT_EMBEDDING_DIMENSIONS),

    chunkSize: ChunkingSchema.shape.chunkSize.default(800),
    chunkOverlap: ChunkingSchema.shape.chunkOverlap.default(200),

    vectorIdPrefix: z
      .string()
      .regex(/^[a-zA-Z0-9_\-:.]+$/)
      .max(120)
      .optional(),

    metadata: z.record(z.string(), z.any()).optional(),
  })
  .strict();

/* ================================
 * Documents – One-shot Upload (FILE)
 * Client-side schema for POST /documents/file
 * ================================ */
export const CreateFileUploadSchema = z
  .object({
    title: z.string().min(1).max(200),

    /** Accept either array or CSV string; normalize on submit */
    tags: z.union([
      z.array(z.string().trim().min(1)).max(20),
      z.string().trim().min(1),
    ]).optional(),

    checksum: z.string().max(128).optional(),
    storagePath: z.string().optional(),
    vectorIdPrefix: z
      .string()
      .regex(/^[a-zA-Z0-9_\-:.]+$/)
      .max(120)
      .optional(),

    embeddingModel: z.string().optional(),
    embeddingDimensions: z.coerce.number().int().min(128).max(8192).optional(),

    chunkSize: ChunkingSchema.shape.chunkSize.optional(),
    chunkOverlap: ChunkingSchema.shape.chunkOverlap.optional(),

    /** Optional JSON metadata (stringified when sent via multipart) */
    metadata: z.union([
      z.record(z.string(), z.any()),
      z.string().min(2), // allow JSON string
    ]).optional(),
  })
  .strict();

/* ================================
 * Documents – Upsert Extraction (FILE)
 * ================================ */
export const UpsertExtractionSchema = z
  .object({
    extractedText: z.string().min(1, 'extractedText is required'),
    embeddingModel: z.string().optional(),
    embeddingDimensions: z.coerce.number().int().min(128).max(8192).optional(),
    chunkSize: ChunkingSchema.shape.chunkSize.optional(),
    chunkOverlap: ChunkingSchema.shape.chunkOverlap.optional(),
  })
  .strict();

/* ================================
 * Documents – List / Query
 * ================================ */
export const ListDocumentsQuerySchema = PaginationSchema.extend({
  q: z.string().max(500).optional(),
  sourceType: KnowledgeSourceTypeEnum.optional(),
  status: KnowledgeItemStatusEnum.optional(),
  tag: z.string().optional(),
  includeDeleted: z.coerce.boolean().default(false),
  sort: SortEnum.default('createdAt:desc'),
}).strict();

/* ================================
 * Documents – Update / Patch
 * ================================ */
export const UpdateDocumentPatchSchema = z
  .object({
    title: z.string().min(1).max(200).optional(),
    tags: z.array(z.string().trim().min(1)).max(20).optional(),
    metadata: z.record(z.string(), z.any()).optional(),
    content: z.union([z.string(), z.null()]).optional(),
    reembed: z.coerce.boolean().optional(),
    chunkSize: ChunkingSchema.shape.chunkSize.optional(),
    chunkOverlap: ChunkingSchema.shape.chunkOverlap.optional(),
    embeddingModel: z.string().optional(),
    embeddingDimensions: z.coerce.number().int().min(128).max(8192).optional(),
  })
  .strict();

/* ================================
 * Delete (soft/hard)
 * ================================ */
export const DeleteDocumentQuerySchema = z
  .object({
    hard: z.coerce.boolean().default(false),
  })
  .strict();

/* ================================
 * Search
 * ================================ */
export const KnowledgeSearchSchema = z
  .object({
    query: z.string().min(1),
    topK: z.coerce.number().int().min(1).max(50).default(8),
    includeMetadata: z.coerce.boolean().default(true),
    filter: z.record(z.string(), z.any()).optional(),
    hybridAlpha: z.coerce.number().min(0).max(1).optional(),
  })
  .strict();

/* ================================
 * Types
 * ================================ */
export type UpdateKnowledgeBaseInput = z.infer<typeof UpdateKnowledgeBaseSchema>;
export type CreateTextDocumentInput = z.infer<typeof CreateTextDocumentSchema>;
export type CreateFileDocumentMetaInput = z.infer<
  typeof CreateFileDocumentMetaSchema
>;
export type CreateFileUploadInput = z.infer<typeof CreateFileUploadSchema>;
export type UpsertExtractionInput = z.infer<typeof UpsertExtractionSchema>;
export type ListDocumentsQuery = z.infer<typeof ListDocumentsQuerySchema>;
export type UpdateDocumentPatch = z.infer<typeof UpdateDocumentPatchSchema>;
export type DeleteDocumentQuery = z.infer<typeof DeleteDocumentQuerySchema>;
export type KnowledgeSearchInput = z.infer<typeof KnowledgeSearchSchema>;

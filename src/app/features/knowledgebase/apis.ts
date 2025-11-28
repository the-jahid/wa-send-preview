// app/(lib)/knowledgebase/apis.ts
// Lightweight, typed client for the Nest Knowledgebase API.
// Works in both client & server contexts (Next.js).
//
// Auth: pass a Clerk JWT as `authToken` (useAuth()/auth()).
//
// Base URL: NEXT_PUBLIC_API_BASE_URL (or NEXT_PUBLIC_BACKEND_API_URL)

import type {
  KnowledgeBase,
  KnowledgeBaseDocument,
  KnowledgeSearchMatch,
  Paginated,
  WithAuth,
  KBRouteParams,
  UpdateKnowledgeBaseInput,
  CreateTextDocumentInput,
  CreateFileDocumentMetaInput,
  UpsertExtractionInput,
  ListDocumentsQuery,
  UpdateDocumentPatch,
  DeleteDocumentQuery,
  KnowledgeSearchInput,
  APIError,
  CreateFileUploadInput, // ← one-shot upload DTO (non-binary fields)
} from './types';

const API_BASE = (
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  process.env.NEXT_PUBLIC_BACKEND_API_URL ??
  'http://localhost:3001'
).replace(/\/+$/, '');

/* --------------------------------
 * Helpers
 * -------------------------------- */
type FetchOpts = RequestInit & WithAuth;

function authHeaders(authToken?: string | null): Record<string, string> {
  return authToken ? { Authorization: `Bearer ${authToken}` } : {};
}

/** Merge any HeadersInit with an extra Record<string,string> into a concrete Headers */
function mergeHeaders(
  init?: HeadersInit,
  extra?: Record<string, string>
): Headers {
  const h = new Headers();

  // apply init first
  if (init) {
    if (init instanceof Headers) {
      init.forEach((v, k) => h.set(k, v));
    } else if (Array.isArray(init)) {
      for (const [k, v] of init) h.set(k, v);
    } else {
      for (const [k, v] of Object.entries(init)) h.set(k, String(v));
    }
  }

  // then apply extras (override)
  if (extra) {
    for (const [k, v] of Object.entries(extra)) h.set(k, v);
  }

  return h;
}

function isFormDataBody(body: unknown): body is FormData {
  return typeof FormData !== 'undefined' && body instanceof FormData;
}

async function fetchJSON<T>(path: string, opts: FetchOpts = {}): Promise<T> {
  const url = `${API_BASE}${path}`;

  // Build base headers
  const base: Record<string, string> = {
    Accept: 'application/json',
    ...authHeaders(opts.authToken ?? undefined),
  };

  // Only set JSON content-type when the body is NOT FormData
  if (opts.body !== undefined && opts.body !== null && !isFormDataBody(opts.body)) {
    base['Content-Type'] = 'application/json';
  }

  const headers = mergeHeaders(opts.headers, base);

  const res = await fetch(url, {
    ...opts,
    headers,
    cache: 'no-store',
  });

  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const data = isJson ? await res.json() : await res.text();

  if (!res.ok) {
    const err: APIError = {
      status: res.status,
      message: (isJson && (data as any)?.message) || res.statusText,
      details: data,
    };
    throw err;
  }

  return data as T;
}

/** Build a query string from primitives/arrays (objects are skipped). */
function toQuery(params: Record<string, unknown> = {}): string {
  const parts: string[] = [];

  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === '') continue;

    if (Array.isArray(v)) {
      for (const vv of v) {
        if (vv === undefined || vv === null || vv === '') continue;
        parts.push(`${encodeURIComponent(k)}=${encodeURIComponent(String(vv))}`);
      }
    } else if (typeof v !== 'object') {
      // primitives only; objects should be POST bodies
      parts.push(`${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`);
    }
  }

  return parts.length ? `?${parts.join('&')}` : '';
}

/* For the re-embed endpoint */
export type ReembedDocumentInput = {
  embeddingModel?: string;
  embeddingDimensions?: number;
  chunkSize?: number;
  chunkOverlap?: number;
  force?: boolean;
};

/* --------------------------------
 * Route builders
 * -------------------------------- */
const routes = {
  kb: (agentId: string) => `/agents/${agentId}/knowledgebase`,
  docs: (agentId: string) => `/agents/${agentId}/knowledgebase/documents`,
  doc: (agentId: string, documentId: string) =>
    `/agents/${agentId}/knowledgebase/documents/${documentId}`,
  docUpload: (agentId: string) =>
    `/agents/${agentId}/knowledgebase/documents/file`, // ← one-shot upload
  docExtraction: (agentId: string, documentId: string) =>
    `/agents/${agentId}/knowledgebase/documents/${documentId}/extraction`,
  docReembed: (agentId: string, documentId: string) =>
    `/agents/${agentId}/knowledgebase/documents/${documentId}/reembed`,
  search: (agentId: string) => `/agents/${agentId}/knowledgebase/search`,
};

/* --------------------------------
 * API functions
 * -------------------------------- */

// KnowledgeBase

export async function getKnowledgeBase(
  { agentId }: KBRouteParams,
  opts?: WithAuth
): Promise<KnowledgeBase> {
  return fetchJSON<KnowledgeBase>(routes.kb(agentId), { authToken: opts?.authToken });
}

export async function updateKnowledgeBase(
  { agentId }: KBRouteParams,
  payload: UpdateKnowledgeBaseInput,
  opts?: WithAuth
): Promise<KnowledgeBase> {
  return fetchJSON<KnowledgeBase>(routes.kb(agentId), {
    method: 'PATCH',
    body: JSON.stringify(payload),
    authToken: opts?.authToken,
  });
}

// Documents (create)

export async function createTextDocument(
  { agentId }: KBRouteParams,
  payload: CreateTextDocumentInput,
  opts?: WithAuth
): Promise<KnowledgeBaseDocument> {
  return fetchJSON<KnowledgeBaseDocument>(`${routes.docs(agentId)}/text`, {
    method: 'POST',
    body: JSON.stringify(payload),
    authToken: opts?.authToken,
  });
}

export async function createFileDocumentMeta(
  { agentId }: KBRouteParams,
  payload: CreateFileDocumentMetaInput,
  opts?: WithAuth
): Promise<KnowledgeBaseDocument> {
  return fetchJSON<KnowledgeBaseDocument>(`${routes.docs(agentId)}/file/meta`, {
    method: 'POST',
    body: JSON.stringify(payload),
    authToken: opts?.authToken,
  });
}

/**
 * One-shot upload + extract + embed + upsert vectors (activates the document).
 * `file` should be a `File` or `Blob` (browser). Pass non-binary fields in `fields`.
 */
export async function uploadFileAndEmbed(
  { agentId }: KBRouteParams,
  file: File | Blob,
  fields: CreateFileUploadInput,
  opts?: WithAuth
): Promise<KnowledgeBaseDocument> {
  const form = new FormData();
  const filename = (file as File).name ?? 'upload';
  form.append('file', file, filename);

  // Append non-binary fields; mirror controller expectations
  form.append('title', fields.title);

  if (fields.tags) {
    if (Array.isArray(fields.tags)) {
      // backend also supports CSV; choose CSV to be explicit
      form.append('tags', fields.tags.join(','));
    } else {
      form.append('tags', fields.tags);
    }
  }
  if (fields.checksum) form.append('checksum', fields.checksum);
  if (fields.storagePath) form.append('storagePath', fields.storagePath);
  if (fields.vectorIdPrefix) form.append('vectorIdPrefix', fields.vectorIdPrefix);
  if (fields.embeddingModel) form.append('embeddingModel', fields.embeddingModel);
  if (fields.embeddingDimensions !== undefined)
    form.append('embeddingDimensions', String(fields.embeddingDimensions));
  if (fields.chunkSize !== undefined) form.append('chunkSize', String(fields.chunkSize));
  if (fields.chunkOverlap !== undefined) form.append('chunkOverlap', String(fields.chunkOverlap));
  if (fields.metadata) {
    const m =
      typeof fields.metadata === 'string'
        ? fields.metadata
        : JSON.stringify(fields.metadata);
    form.append('metadata', m);
  }

  return fetchJSON<KnowledgeBaseDocument>(routes.docUpload(agentId), {
    method: 'POST',
    body: form, // NOTE: fetchJSON will NOT set Content-Type for FormData
    authToken: opts?.authToken,
  });
}

/**
 * Convenience for the file pipeline:
 * attach extractedText and immediately embed + upsert vectors.
 */
export async function upsertExtraction(
  { agentId, documentId }: Required<KBRouteParams>,
  payload: UpsertExtractionInput,
  opts?: WithAuth
): Promise<KnowledgeBaseDocument> {
  return fetchJSON<KnowledgeBaseDocument>(routes.docExtraction(agentId, documentId), {
    method: 'POST',
    body: JSON.stringify(payload),
    authToken: opts?.authToken,
  });
}

// Documents (read)

export async function listDocuments(
  { agentId }: KBRouteParams,
  query: Partial<ListDocumentsQuery> = {},
  opts?: WithAuth
): Promise<Paginated<KnowledgeBaseDocument>> {
  return fetchJSON<Paginated<KnowledgeBaseDocument>>(
    `${routes.docs(agentId)}${toQuery(query as Record<string, unknown>)}`,
    { authToken: opts?.authToken }
  );
}

export async function getDocument(
  { agentId, documentId }: Required<KBRouteParams>,
  opts?: WithAuth
): Promise<KnowledgeBaseDocument> {
  return fetchJSON<KnowledgeBaseDocument>(routes.doc(agentId, documentId), {
    authToken: opts?.authToken,
  });
}

// Documents (update)

export async function updateDocument(
  { agentId, documentId }: Required<KBRouteParams>,
  patch: UpdateDocumentPatch,
  opts?: WithAuth
): Promise<KnowledgeBaseDocument> {
  return fetchJSON<KnowledgeBaseDocument>(routes.doc(agentId, documentId), {
    method: 'PATCH',
    body: JSON.stringify(patch),
    authToken: opts?.authToken,
  });
}

// Documents (delete)

export async function deleteDocument(
  { agentId, documentId }: Required<KBRouteParams>,
  query?: DeleteDocumentQuery,
  opts?: WithAuth
): Promise<{ deleted: boolean; vectorsPurged?: number }> {
  const q = toQuery(query as Record<string, unknown>);
  return fetchJSON<{ deleted: boolean; vectorsPurged?: number }>(
    `${routes.doc(agentId, documentId)}${q}`,
    {
      method: 'DELETE',
      authToken: opts?.authToken,
    }
  );
}

// Documents (re-embed)

export async function reembedDocument(
  { agentId, documentId }: Required<KBRouteParams>,
  payload?: ReembedDocumentInput,
  opts?: WithAuth
): Promise<{ vectorCount: number; lastUpsertedAt: string }> {
  return fetchJSON<{ vectorCount: number; lastUpsertedAt: string }>(
    routes.docReembed(agentId, documentId),
    {
      method: 'POST',
      body: JSON.stringify(payload ?? {}),
      authToken: opts?.authToken,
    }
  );
}

// Semantic search

export async function searchKnowledge(
  { agentId }: KBRouteParams,
  payload: KnowledgeSearchInput,
  opts?: WithAuth
): Promise<KnowledgeSearchMatch[]> {
  return fetchJSON<KnowledgeSearchMatch[]>(routes.search(agentId), {
    method: 'POST',
    body: JSON.stringify(payload),
    authToken: opts?.authToken,
  });
}

/* --------------------------------
 * Convenience grouped export
 * -------------------------------- */
export const KBApi = {
  getKnowledgeBase,
  updateKnowledgeBase,
  createTextDocument,
  createFileDocumentMeta,
  uploadFileAndEmbed, // ← new
  upsertExtraction,
  listDocuments,
  getDocument,
  updateDocument,
  deleteDocument,
  reembedDocument,
  searchKnowledge,
};

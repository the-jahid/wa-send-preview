// app/(lib)/knowledgebase/query.ts
// TanStack Query hooks for the Knowledgebase API (Nest backend).
// Uses the ApiTokenProvider to attach a fresh Clerk JWT to each request.

import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { KBApi, ReembedDocumentInput } from './apis';
import type {
  KnowledgeBase,
  KnowledgeBaseDocument,
  KnowledgeSearchMatch,
  Paginated,
  UpdateKnowledgeBaseInput,
  CreateTextDocumentInput,
  CreateFileDocumentMetaInput,
  CreateFileUploadInput,
  UpsertExtractionInput,
  ListDocumentsQuery,
  UpdateDocumentPatch,
  DeleteDocumentQuery,
  KnowledgeSearchInput,
} from './types';

import { KBKeys } from './keys';
import { useApiToken } from '@/lib/api-token-provider';

/* --------------------------------
 * Internal helper to call APIs with token
 * -------------------------------- */
function useAuthed<T>() {
  const getToken = useApiToken();
  return useCallback(
    async (cb: (authToken: string | null) => Promise<T>) => {
      const authToken = await getToken();
      return cb(authToken);
    },
    [getToken],
  );
}

/* --------------------------------
 * KB Queries
 * -------------------------------- */

export function useKnowledgeBase(agentId?: string) {
  const authed = useAuthed<KnowledgeBase>();
  const enabled = Boolean(agentId);

  return useQuery({
    queryKey: KBKeys.base(agentId ?? 'missing'),
    enabled,
    queryFn: () =>
      authed((authToken) =>
        KBApi.getKnowledgeBase(
          { agentId: agentId! },
          { authToken: authToken ?? undefined },
        ),
      ),
    staleTime: 10_000,
  });
}

export function useUpdateKnowledgeBase(agentId: string) {
  const qc = useQueryClient();
  const authed = useAuthed<KnowledgeBase>();

  return useMutation({
    mutationFn: (payload: UpdateKnowledgeBaseInput) =>
      authed((authToken) =>
        KBApi.updateKnowledgeBase(
          { agentId },
          payload,
          { authToken: authToken ?? undefined },
        ),
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KBKeys.base(agentId) });
    },
  });
}

/* --------------------------------
 * Document List / Get
 * -------------------------------- */

export function useDocuments(agentId?: string, params?: Partial<ListDocumentsQuery>) {
  const authed = useAuthed<Paginated<KnowledgeBaseDocument>>();
  const enabled = Boolean(agentId);

  return useQuery({
    queryKey: KBKeys.docs(agentId ?? 'missing', params),
    enabled,
    queryFn: () =>
      authed((authToken) =>
        KBApi.listDocuments(
          { agentId: agentId! },
          params ?? {},
          { authToken: authToken ?? undefined },
        ),
      ),
    // v5 replacement for keepPreviousData
    placeholderData: (prev) => prev,
    staleTime: 10_000,
  });
}

export function useDocument(agentId?: string, documentId?: string) {
  const authed = useAuthed<KnowledgeBaseDocument>();
  const enabled = Boolean(agentId && documentId);

  return useQuery({
    queryKey: KBKeys.doc(agentId ?? 'missing', documentId ?? 'missing'),
    enabled,
    queryFn: () =>
      authed((authToken) =>
        KBApi.getDocument(
          { agentId: agentId!, documentId: documentId! },
          { authToken: authToken ?? undefined },
        ),
      ),
    staleTime: 10_000,
  });
}

/* --------------------------------
 * Create (TEXT / FILE meta / FILE upload) + Extraction Upsert
 * -------------------------------- */

export function useCreateTextDocument(agentId: string) {
  const qc = useQueryClient();
  const authed = useAuthed<KnowledgeBaseDocument>();

  return useMutation({
    mutationFn: (payload: CreateTextDocumentInput) =>
      authed((authToken) =>
        KBApi.createTextDocument(
          { agentId },
          payload,
          { authToken: authToken ?? undefined },
        ),
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KBKeys.docs(agentId) });
      qc.invalidateQueries({ queryKey: KBKeys.base(agentId) });
    },
  });
}

export function useCreateFileDocumentMeta(agentId: string) {
  const qc = useQueryClient();
  const authed = useAuthed<KnowledgeBaseDocument>();

  return useMutation({
    mutationFn: (payload: CreateFileDocumentMetaInput) =>
      authed((authToken) =>
        KBApi.createFileDocumentMeta(
          { agentId },
          payload,
          { authToken: authToken ?? undefined },
        ),
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KBKeys.docs(agentId) });
    },
  });
}

/** One-shot multipart upload + extract + embed. */
export function useUploadFileAndEmbed(agentId: string) {
  const qc = useQueryClient();
  const authed = useAuthed<KnowledgeBaseDocument>();

  return useMutation({
    // payload: { file: File|Blob, fields: CreateFileUploadInput }
    mutationFn: (payload: { file: File | Blob; fields: CreateFileUploadInput }) =>
      authed((authToken) =>
        KBApi.uploadFileAndEmbed(
          { agentId },
          payload.file,
          payload.fields,
          { authToken: authToken ?? undefined },
        ),
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KBKeys.docs(agentId) });
      qc.invalidateQueries({ queryKey: KBKeys.base(agentId) });
    },
  });
}

export function useUpsertExtraction(agentId: string, documentId: string) {
  const qc = useQueryClient();
  const authed = useAuthed<KnowledgeBaseDocument>();

  return useMutation({
    mutationFn: (payload: UpsertExtractionInput) =>
      authed((authToken) =>
        KBApi.upsertExtraction(
          { agentId, documentId },
          payload,
          { authToken: authToken ?? undefined },
        ),
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KBKeys.doc(agentId, documentId) });
      qc.invalidateQueries({ queryKey: KBKeys.docs(agentId) });
    },
  });
}

/* --------------------------------
 * Update / Delete / Re-embed
 * -------------------------------- */

export function useUpdateDocument(agentId: string, documentId: string) {
  const qc = useQueryClient();
  const authed = useAuthed<KnowledgeBaseDocument>();

  return useMutation({
    mutationFn: (patch: UpdateDocumentPatch) =>
      authed((authToken) =>
        KBApi.updateDocument(
          { agentId, documentId },
          patch,
          { authToken: authToken ?? undefined },
        ),
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KBKeys.doc(agentId, documentId) });
      qc.invalidateQueries({ queryKey: KBKeys.docs(agentId) });
    },
  });
}

export function useDeleteDocument(agentId: string, documentId: string) {
  const qc = useQueryClient();
  const authed = useAuthed<{ deleted: boolean; vectorsPurged?: number }>();

  return useMutation({
    mutationFn: (query?: DeleteDocumentQuery) =>
      authed((authToken) =>
        KBApi.deleteDocument(
          { agentId, documentId },
          query,
          { authToken: authToken ?? undefined },
        ),
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KBKeys.docs(agentId) });
      qc.removeQueries({ queryKey: KBKeys.doc(agentId, documentId) });
    },
  });
}

export function useReembedDocument(agentId: string, documentId: string) {
  const qc = useQueryClient();
  const authed = useAuthed<{ vectorCount: number; lastUpsertedAt: string }>();

  return useMutation({
    mutationFn: (payload?: ReembedDocumentInput) =>
      authed((authToken) =>
        KBApi.reembedDocument(
          { agentId, documentId },
          payload,
          { authToken: authToken ?? undefined },
        ),
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KBKeys.doc(agentId, documentId) });
    },
  });
}

/* --------------------------------
 * Semantic search
 * -------------------------------- */

export function useKBSearch(agentId: string) {
  const authed = useAuthed<KnowledgeSearchMatch[]>();

  // Accept a partial payload from UI and normalize to the required shape
  const normalize = (p: Partial<KnowledgeSearchInput>): KnowledgeSearchInput => ({
    query: p.query ?? '',
    topK: p.topK ?? 8,
    includeMetadata: p.includeMetadata ?? true,
    filter: p.filter as Record<string, unknown> | undefined,
    hybridAlpha: p.hybridAlpha,
  });

  return useMutation({
    mutationFn: (payload: Partial<KnowledgeSearchInput>) =>
      authed((authToken) =>
        KBApi.searchKnowledge(
          { agentId },
          normalize(payload),
          { authToken: authToken ?? undefined },
        ),
      ),
  });
}

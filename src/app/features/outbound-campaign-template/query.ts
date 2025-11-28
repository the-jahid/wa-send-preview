// src/app/features/outbound-campaign-template/query.ts
'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useApiToken } from '@/lib/api-token-provider';
import { TEMPLATE_KEYS } from './keys';
import {
  clearTemplateMediaApi,
  createTemplateApi,
  deleteTemplateApi,
  fetchTemplateMediaBlob,
  getTemplateApi,
  listTemplatesApi,
  replaceTemplateMediaApi,
  updateTemplateApi,
  getTemplateMediaUrl,
} from './apis';
import type { CreateTemplateDto, ListTemplatesRequest, UpdateTemplateDto } from './types';

/* ---------------- Helpers ---------------- */

async function requireToken(getToken: () => Promise<string | null>) {
  const t = await getToken();
  if (!t) throw new Error('Not authenticated');
  return t;
}
const invalidateList = (qc: ReturnType<typeof useQueryClient>, agentId?: string) => {
  if (agentId) qc.invalidateQueries({ queryKey: TEMPLATE_KEYS.list(agentId) });
  else qc.invalidateQueries({ queryKey: TEMPLATE_KEYS.all });
};

/* ---------------- Queries ---------------- */

export function useTemplates(params: ListTemplatesRequest | undefined, opts?: { enabled?: boolean }) {
  const getToken = useApiToken();
  return useQuery({
    queryKey: params ? TEMPLATE_KEYS.list(params.agentId, params) : TEMPLATE_KEYS.list('nil'),
    queryFn: async () => {
      if (!params) throw new Error('Missing params');
      const token = await requireToken(getToken);
      return listTemplatesApi(params, token);
    },
    enabled: !!params && (opts?.enabled ?? true),
  });
}

export function useTemplate(id: string | undefined, opts?: { enabled?: boolean }) {
  const getToken = useApiToken();
  return useQuery({
    queryKey: id ? TEMPLATE_KEYS.detail(id) : TEMPLATE_KEYS.detail('nil'),
    queryFn: async () => {
      const token = await requireToken(getToken);
      return getTemplateApi(id!, token);
    },
    enabled: !!id && (opts?.enabled ?? true),
  });
}

/* ---------------- Mutations ---------------- */

export function useCreateTemplate(agentId?: string) {
  const getToken = useApiToken();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateTemplateDto & { mediaFile?: File | null }) => {
      const token = await requireToken(getToken);
      return createTemplateApi(payload, token);
    },
    onSuccess: (tpl: any) => {
      invalidateList(qc, agentId ?? tpl?.agentId);
    },
  });
}

export function useUpdateTemplate(agentId?: string) {
  const getToken = useApiToken();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateTemplateDto }) => {
      const token = await requireToken(getToken);
      return updateTemplateApi(id, data, token);
    },
    onSuccess: (tpl: any) => {
      if (tpl?.id) qc.invalidateQueries({ queryKey: TEMPLATE_KEYS.detail(tpl.id) });
      invalidateList(qc, agentId ?? tpl?.agentId);
    },
  });
}

export function useReplaceTemplateMedia(agentId?: string) {
  const getToken = useApiToken();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, file }: { id: string; file: File }) => {
      const token = await requireToken(getToken);
      return replaceTemplateMediaApi(id, file, token);
    },
    onSuccess: (tpl: any) => {
      if (tpl?.id) qc.invalidateQueries({ queryKey: TEMPLATE_KEYS.detail(tpl.id) });
      invalidateList(qc, agentId ?? tpl?.agentId);
    },
  });
}

export function useClearTemplateMedia(agentId?: string) {
  const getToken = useApiToken();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const token = await requireToken(getToken);
      return clearTemplateMediaApi(id, token);
    },
    onSuccess: (tpl: any) => {
      if (tpl?.id) qc.invalidateQueries({ queryKey: TEMPLATE_KEYS.detail(tpl.id) });
      invalidateList(qc, agentId ?? tpl?.agentId);
    },
  });
}

export function useDeleteTemplate(agentId?: string) {
  const getToken = useApiToken();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const token = await requireToken(getToken);
      return deleteTemplateApi(id, token);
    },
    onSuccess: (_res, id) => {
      qc.removeQueries({ queryKey: TEMPLATE_KEYS.detail(id) });
      invalidateList(qc, agentId);
    },
  });
}

/* ---------------- Media helpers for components ---------------- */

export async function getTemplateMediaObjectUrl(id: string, token: string) {
  const blob = await fetchTemplateMediaBlob(id, token);
  return URL.createObjectURL(blob);
}
export { getTemplateMediaUrl } from './apis';

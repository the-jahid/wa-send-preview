// src/app/features/outbound-campaign-lead/query.ts
'use client';

import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { leadKeys } from './keys';
import type { IOutboundLead, Paginated, QueryOutboundLeadsInput } from './types';
import {
  listOutboundCampaignLeads,
  createOutboundLead,
  getLead,
  updateLead,
  deleteLead,
  setLeadStatus,
  recordLeadAttempt,
  upsertLeadCustomFields,
} from './apis';
import type {
  CreateOutboundLeadInput,
  UpdateOutboundLeadInput,
  SetLeadStatusInput,
  RecordAttemptInput,
  UpsertCustomFieldsInput,
} from './schemas';
import { useApiToken } from '@/lib/api-token-provider';

// ------------- Queries -------------

export function useCampaignLeads(campaignId: string, params: QueryOutboundLeadsInput) {
  const getToken = useApiToken();
  return useQuery({
    queryKey: leadKeys.list(campaignId, params),
    queryFn: async () => {
      const token = await getToken();
      return listOutboundCampaignLeads(campaignId, params, token);
    },
    enabled: !!campaignId,
  });
}

export function useLead(leadId?: string) {
  const getToken = useApiToken();
  return useQuery({
    queryKey: leadId ? leadKeys.one(leadId) : ['__noop__'],
    queryFn: async () => {
      if (!leadId) throw new Error('leadId is required');
      const token = await getToken();
      return getLead(leadId, token);
    },
    enabled: !!leadId,
  });
}

// ------------- Mutations -------------

export function useCreateOutboundLead(campaignId: string) {
  const qc = useQueryClient();
  const getToken = useApiToken();

  return useMutation({
    mutationFn: async (body: CreateOutboundLeadInput) => {
      const token = await getToken();
      return createOutboundLead(campaignId, body, token);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: leadKeys.campaign(campaignId) });
    },
  });
}

export function useUpdateLead() {
  const qc = useQueryClient();
  const getToken = useApiToken();

  return useMutation({
    mutationFn: async (args: { id: string; body: UpdateOutboundLeadInput }) => {
      const token = await getToken();
      return updateLead(args.id, args.body, token);
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: leadKeys.one(data.id) });
      qc.invalidateQueries({ queryKey: leadKeys.campaign(data.outboundCampaignId) });
    },
  });
}

export function useDeleteLead() {
  const qc = useQueryClient();
  const getToken = useApiToken();

  return useMutation({
    mutationFn: async (id: string) => {
      const token = await getToken();
      return deleteLead(id, token);
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: leadKeys.campaign(data.outboundCampaignId) });
    },
  });
}

export function useSetLeadStatus() {
  const qc = useQueryClient();
  const getToken = useApiToken();

  return useMutation({
    mutationFn: async (args: { id: string; body: SetLeadStatusInput }) => {
      const token = await getToken();
      return setLeadStatus(args.id, args.body, token);
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: leadKeys.one(data.id) });
      qc.invalidateQueries({ queryKey: leadKeys.campaign(data.outboundCampaignId) });
    },
  });
}

export function useRecordLeadAttempt() {
  const qc = useQueryClient();
  const getToken = useApiToken();

  return useMutation({
    mutationFn: async (args: { id: string; body: RecordAttemptInput }) => {
      const token = await getToken();
      return recordLeadAttempt(args.id, args.body, token);
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: leadKeys.one(data.id) });
      qc.invalidateQueries({ queryKey: leadKeys.campaign(data.outboundCampaignId) });
    },
  });
}

export function useUpsertLeadCustomFields() {
  const qc = useQueryClient();
  const getToken = useApiToken();

  return useMutation({
    mutationFn: async (args: { id: string; body: UpsertCustomFieldsInput }) => {
      const token = await getToken();
      return upsertLeadCustomFields(args.id, args.body, token);
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: leadKeys.one(data.id) });
      qc.invalidateQueries({ queryKey: leadKeys.campaign(data.outboundCampaignId) });
    },
  });
}

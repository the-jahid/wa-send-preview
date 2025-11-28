// src/features/whatsapp/query.ts
'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  waGenerateQr,
  waValidateQr,
  waLoginStatus,
  waLoginConfirm,
  waStart,
  waStartByPhone,
  waToggleAgent,
  waEnforcePolicy,
  waStatus,
  waLogout,
  waSendMessage,
} from './apis';
import { waKeys } from './keys';
import type {
  EnforcePolicyData,
  LoginConfirmData,
  LoginStatusData,
  QrNewData,
  QrValidateData,
  SendMessageBody,
  SendMessageResponseData,
  StartByPhoneResponseData,
  StartResponseData,
  StatusResponseData,
  ToggleAgentResponseData,
} from './types';
import { useApiToken } from '@/lib/api-token-provider';

/** -------- Queries -------- */

export function useWaLoginStatus(agentId: string, refetchMs = 2000) {
  const getToken = useApiToken();
  return useQuery<LoginStatusData>({
    queryKey: waKeys.loginStatus(agentId),
    queryFn: () => waLoginStatus(agentId, getToken),
    refetchInterval: refetchMs,
  });
}

export function useWaStatus(agentId: string, refetchMs?: number) {
  const getToken = useApiToken();
  return useQuery<StatusResponseData>({
    queryKey: waKeys.status(agentId),
    queryFn: () => waStatus(agentId, getToken),
    refetchInterval: refetchMs,
  });
}

/** -------- Mutations -------- */

export function useWaStart(agentId: string) {
  const getToken = useApiToken();
  return useMutation<StartResponseData>({
    mutationFn: () => waStart(agentId, getToken),
  });
}

export function useWaStartByPhone(agentId: string) {
  const getToken = useApiToken();
  return useMutation<StartByPhoneResponseData, Error, { phone: string }>({
    mutationFn: ({ phone }) => waStartByPhone(agentId, { phone }, getToken),
  });
}

export function useWaGenerateQr(agentId: string) {
  const getToken = useApiToken();
  return useMutation<QrNewData>({
    mutationFn: () => waGenerateQr(agentId, getToken),
  });
}

export function useWaValidateQr(agentId: string) {
  const getToken = useApiToken();
  return useMutation<QrValidateData, Error, { qrId: string }>({
    mutationFn: ({ qrId }) => waValidateQr(agentId, qrId, getToken),
  });
}

export function useWaLoginConfirm(agentId: string) {
  const getToken = useApiToken();
  const qc = useQueryClient();
  return useMutation<LoginConfirmData>({
    mutationFn: () => waLoginConfirm(agentId, getToken),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: waKeys.loginStatus(agentId) });
      qc.invalidateQueries({ queryKey: waKeys.status(agentId) });
    },
  });
}

export function useWaToggleAgent(agentId: string) {
  const getToken = useApiToken();
  const qc = useQueryClient();
  return useMutation<ToggleAgentResponseData, Error, { isActive: boolean }>({
    mutationFn: ({ isActive }) => waToggleAgent(agentId, { isActive }, getToken),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: waKeys.status(agentId) });
      qc.invalidateQueries({ queryKey: waKeys.loginStatus(agentId) });
    },
  });
}

export function useWaEnforcePolicy(agentId: string) {
  const getToken = useApiToken();
  const qc = useQueryClient();
  return useMutation<EnforcePolicyData>({
    mutationFn: () => waEnforcePolicy(agentId, getToken),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: waKeys.status(agentId) });
      qc.invalidateQueries({ queryKey: waKeys.loginStatus(agentId) });
    },
  });
}

export function useWaLogout(agentId: string) {
  const getToken = useApiToken();
  const qc = useQueryClient();
  return useMutation<{ message: string }>({
    mutationFn: () => waLogout(agentId, getToken),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: waKeys.status(agentId) });
      qc.invalidateQueries({ queryKey: waKeys.loginStatus(agentId) });
    },
  });
}

export function useWaSendMessage(agentId: string) {
  const getToken = useApiToken();
  return useMutation<SendMessageResponseData, Error, SendMessageBody>({
    mutationFn: (body) => waSendMessage(agentId, body, getToken),
  });
}

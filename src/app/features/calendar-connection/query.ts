'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiToken } from '@/lib/api-token-provider';
import { calendarConnectionKeys as keys } from './keys';
import {
  apiListConnections,
  apiGetConnection,
  apiCreateConnection,
  apiUpdateConnection,
  apiDeleteConnection,
} from './apis';
import type {
  ExternalCalendarConnection,
  CreateCalendarConnectionInput,
  UpdateCalendarConnectionInput,
} from './types';

export function useConnections(page = 1, pageSize = 20) {
  const getToken = useApiToken();
  return useQuery({
    queryKey: keys.list(page, pageSize),
    queryFn: () => apiListConnections(getToken, page, pageSize),
    // keepPreviousData helps smooth pagination
    placeholderData: (prev) => prev,
  });
}

export function useConnection(id: string) {
  const getToken = useApiToken();
  return useQuery({
    enabled: Boolean(id),
    queryKey: keys.detail(id),
    queryFn: () => apiGetConnection(getToken, id),
  });
}

export function useCreateConnection() {
  const qc = useQueryClient();
  const getToken = useApiToken();
  return useMutation({
    mutationFn: (payload: CreateCalendarConnectionInput) =>
      apiCreateConnection(getToken, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['calendarConnections'] });
    },
  });
}

export function useUpdateConnection(id: string) {
  const qc = useQueryClient();
  const getToken = useApiToken();
  return useMutation({
    mutationFn: (payload: UpdateCalendarConnectionInput) =>
      apiUpdateConnection(getToken, id, payload),
    onSuccess: (updated: ExternalCalendarConnection) => {
      qc.invalidateQueries({ queryKey: ['calendarConnections'] });
      qc.setQueryData(keys.detail(id), updated);
    },
  });
}

export function useDeleteConnection() {
  const qc = useQueryClient();
  const getToken = useApiToken();
  return useMutation({
    mutationFn: (id: string) => apiDeleteConnection(getToken, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['calendarConnections'] });
    },
  });
}

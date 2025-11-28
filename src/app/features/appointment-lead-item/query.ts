// app/features/appointment-lead-item/query.ts
"use client";

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useApiToken } from "@/lib/api-token-provider";
import {
  apiCreateAppointmentLeadItem,
  apiDeleteAppointmentLeadItem,
  apiGetAppointmentLeadItem,
  apiListAppointmentLeadItems,
  apiUpdateAppointmentLeadItem,
} from "./apis";
import { appointmentLeadItemKeys } from "./keys";
import type { CreatePayload, ListParams, UUID, UpdatePayload } from "./types";

export function useInfiniteAppointmentLeadItems(params: Omit<ListParams, "cursor">) {
  const getToken = useApiToken();
  const enabled = !!params.agentId;

  return useInfiniteQuery({
    queryKey: appointmentLeadItemKeys.list(params.agentId, params.search, params.take),
    queryFn: async ({ pageParam }) => {
      const token = await getToken();
      return apiListAppointmentLeadItems(
        { ...params, cursor: pageParam as string | undefined },
        token ?? undefined,
      );
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled,
  });
}

export function useAppointmentLeadItem(agentId: UUID, id: UUID) {
  const getToken = useApiToken();
  return useQuery({
    queryKey: appointmentLeadItemKeys.detail(agentId, id),
    queryFn: async () => {
      const token = await getToken();
      return apiGetAppointmentLeadItem(agentId, id, token ?? undefined);
    },
    enabled: !!agentId && !!id,
  });
}

export function useCreateAppointmentLeadItem(agentId: UUID) {
  const qc = useQueryClient();
  const getToken = useApiToken();
  return useMutation({
    mutationFn: async (payload: CreatePayload) => {
      const token = await getToken();
      return apiCreateAppointmentLeadItem(agentId, payload, token ?? undefined);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: appointmentLeadItemKeys.agent(agentId) });
    },
  });
}

export function useUpdateAppointmentLeadItem(agentId: UUID, id: UUID) {
  const qc = useQueryClient();
  const getToken = useApiToken();
  return useMutation({
    mutationFn: async (payload: UpdatePayload) => {
      const token = await getToken();
      return apiUpdateAppointmentLeadItem(agentId, id, payload, token ?? undefined);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: appointmentLeadItemKeys.detail(agentId, id) });
      qc.invalidateQueries({ queryKey: appointmentLeadItemKeys.agent(agentId) });
    },
  });
}

export function useDeleteAppointmentLeadItem(agentId: UUID, id: UUID) {
  const qc = useQueryClient();
  const getToken = useApiToken();
  return useMutation({
    mutationFn: async () => {
      const token = await getToken();
      return apiDeleteAppointmentLeadItem(agentId, id, token ?? undefined);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: appointmentLeadItemKeys.agent(agentId) });
    },
  });
}

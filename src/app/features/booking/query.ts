'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { TokenGetter } from '@/lib/api-token-provider';
import { bookingKeys } from './keys';
import {
  apiGetBookingSettings,
  apiUpsertBookingSettings,
  apiPatchBookingSettings,
  apiDeleteBookingSettings,
  apiGetAvailability,
  apiUpsertAvailability,
  apiDeleteAvailability,
  apiGetAssignedCalendar,
  apiAssignCalendar,
  apiUnassignCalendar,
} from './apis';
import type {
  UpsertBookingSettingsInput,
  PatchBookingSettingsInput,
  UpsertWeeklyAvailabilityInput,
  DeleteWeeklyAvailabilityInput,
} from './types';

/** -------- Settings -------- */

export function useBookingSettings(agentId: string, getToken?: TokenGetter) {
  return useQuery({
    queryKey: bookingKeys.settings(agentId),
    queryFn: () => apiGetBookingSettings(agentId, getToken),
    enabled: !!agentId,
    staleTime: 15_000,
  });
}

export function useUpsertBookingSettings(agentId: string, getToken?: TokenGetter) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: UpsertBookingSettingsInput) =>
      apiUpsertBookingSettings(agentId, body, getToken),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: bookingKeys.settings(agentId) });
    },
  });
}

export function usePatchBookingSettings(agentId: string, getToken?: TokenGetter) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: PatchBookingSettingsInput) =>
      apiPatchBookingSettings(agentId, body, getToken),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: bookingKeys.settings(agentId) });
    },
  });
}

export function useDeleteBookingSettings(agentId: string, getToken?: TokenGetter) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => apiDeleteBookingSettings(agentId, getToken),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: bookingKeys.settings(agentId) });
    },
  });
}

/** -------- Availability -------- */

export function useAvailability(agentId: string, getToken?: TokenGetter) {
  return useQuery({
    queryKey: bookingKeys.availability(agentId),
    queryFn: () => apiGetAvailability(agentId, getToken),
    enabled: !!agentId,
    staleTime: 15_000,
  });
}

export function useUpsertAvailability(agentId: string, getToken?: TokenGetter) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: UpsertWeeklyAvailabilityInput) =>
      apiUpsertAvailability(agentId, body, getToken),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: bookingKeys.availability(agentId) });
    },
  });
}

export function useDeleteAvailability(agentId: string, getToken?: TokenGetter) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: DeleteWeeklyAvailabilityInput) =>
      apiDeleteAvailability(agentId, body, getToken),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: bookingKeys.availability(agentId) });
    },
  });
}

/** -------- Calendar assignment -------- */

export function useAssignedCalendar(agentId: string, getToken?: TokenGetter) {
  return useQuery({
    queryKey: bookingKeys.calendar(agentId),
    queryFn: () => apiGetAssignedCalendar(agentId, getToken),
    enabled: !!agentId,
    staleTime: 15_000,
  });
}

export function useAssignCalendar(agentId: string, getToken?: TokenGetter) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (calendarConnectionId: string) =>
      apiAssignCalendar(agentId, calendarConnectionId, getToken),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: bookingKeys.calendar(agentId) });
    },
  });
}

export function useUnassignCalendar(agentId: string, getToken?: TokenGetter) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => apiUnassignCalendar(agentId, getToken),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: bookingKeys.calendar(agentId) });
    },
  });
}


import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiToken } from "@/lib/api-token-provider";
import {
    listWebhooks,
    getWebhook,
    createWebhook,
    updateWebhook,
    deleteWebhook,
    replaceWebhook,
} from "./apis";
import type {
    CreateWebhookInput,
    UpdateWebhookInput,
    WebhookListQuery,
} from "./types";

const KEYS = {
    all: (agentId: string) => ["agent", agentId, "webhooks"] as const,
    list: (agentId: string, query: WebhookListQuery) => [...KEYS.all(agentId), "list", query] as const,
    detail: (agentId: string, webhookId: string) => [...KEYS.all(agentId), "detail", webhookId] as const,
};

export function useWebhooks(agentId: string, query: WebhookListQuery = {}) {
    const getToken = useApiToken();
    return useQuery({
        queryKey: KEYS.list(agentId, query),
        queryFn: async () => {
            const token = await getToken();
            return listWebhooks({ agentId }, query, { authToken: token });
        },
        enabled: !!agentId,
    });
}

export function useWebhook(agentId: string, webhookId: string) {
    const getToken = useApiToken();
    return useQuery({
        queryKey: KEYS.detail(agentId, webhookId),
        queryFn: async () => {
            const token = await getToken();
            return getWebhook({ agentId, webhookId }, { authToken: token });
        },
        enabled: !!agentId && !!webhookId,
    });
}

export function useCreateWebhook(agentId: string) {
    const getToken = useApiToken();
    const qc = useQueryClient();

    return useMutation({
        mutationFn: async (payload: CreateWebhookInput) => {
            const token = await getToken();
            return createWebhook({ agentId }, payload, { authToken: token });
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: KEYS.all(agentId) });
        },
    });
}

export function useUpdateWebhook(agentId: string, webhookId: string) {
    const getToken = useApiToken();
    const qc = useQueryClient();

    return useMutation({
        mutationFn: async (payload: UpdateWebhookInput) => {
            const token = await getToken();
            return updateWebhook({ agentId, webhookId }, payload, { authToken: token });
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: KEYS.all(agentId) });
        },
    });
}

// Including PUT as requested
export function useReplaceWebhook(agentId: string, webhookId: string) {
    const getToken = useApiToken();
    const qc = useQueryClient();

    return useMutation({
        mutationFn: async (payload: CreateWebhookInput) => {
            const token = await getToken();
            return replaceWebhook({ agentId, webhookId }, payload, { authToken: token });
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: KEYS.all(agentId) });
        },
    });
}

export function useDeleteWebhook(agentId: string) {
    const getToken = useApiToken();
    const qc = useQueryClient();

    return useMutation({
        mutationFn: async (webhookId: string) => {
            const token = await getToken();
            return deleteWebhook({ agentId, webhookId }, { authToken: token });
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: KEYS.all(agentId) });
        },
    });
}

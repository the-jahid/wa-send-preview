
export interface Webhook {
    id: string;
    agentId: string;
    url: string;
    events: string[];
    active: boolean;
    secret: string;
    createdAt: string;
    updatedAt: string;
    lastDeliveryStatus?: 'success' | 'failure' | 'pending';
    lastDeliveryTime?: string;
    metadata?: Record<string, any>;
}

export type CreateWebhookInput = {
    url: string;
    events: string[];
    active?: boolean;
    metadata?: Record<string, any>;
};

export type UpdateWebhookInput = Partial<CreateWebhookInput>;

export interface WebhookListQuery {
    page?: number;
    limit?: number;
    active?: boolean;
}

export interface PaginatedWebhooks {
    data: Webhook[];
    total: number;
    page: number;
    totalPages: number;
}

export interface WebhookRouteParams {
    agentId: string;
    webhookId?: string;
}

export interface WithAuth {
    authToken?: string | null;
}

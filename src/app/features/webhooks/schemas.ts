import { z } from "zod";

export const createWebhookSchema = z.object({
    url: z.string().url("Must be a valid HTTPS URL").startsWith("https://", "Must use HTTPS"),
    events: z.array(z.string()).min(1, "Select at least one event"),
    active: z.boolean().optional().default(true),
    metadata: z.record(z.string(), z.any()).optional(),
});

export const updateWebhookSchema = createWebhookSchema.partial();





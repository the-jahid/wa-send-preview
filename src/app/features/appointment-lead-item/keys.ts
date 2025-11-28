// app/features/appointment-lead-item/keys.ts
import type { UUID } from "./types";

export const appointmentLeadItemKeys = {
  all: ["appointmentLeadItems"] as const,
  agent: (agentId: UUID) =>
    [...appointmentLeadItemKeys.all, "agent", agentId] as const,
  list: (agentId: UUID, search?: string, take?: number) =>
    [...appointmentLeadItemKeys.agent(agentId), "list", { search: search ?? "", take }] as const,
  detail: (agentId: UUID, id: UUID) =>
    [...appointmentLeadItemKeys.agent(agentId), "detail", id] as const,
};

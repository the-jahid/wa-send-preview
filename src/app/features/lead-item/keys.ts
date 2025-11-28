/** Query Keys — stable & serializable */
export const leadItemKeys = {
  all: ["lead-items"] as const,
  agent: (agentId: string) => [...leadItemKeys.all, "agent", agentId] as const,
  agentList: (agentId: string, params?: unknown) =>
    [...leadItemKeys.agent(agentId), "list", params ?? {}] as const,
  detail: (id: string) => [...leadItemKeys.all, "detail", id] as const,
};

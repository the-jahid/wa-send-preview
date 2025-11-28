/** Query keys (helps with cache + devtools) */
export const bookingKeys = {
  root: (agentId: string) => ['booking', agentId] as const,

  // settings
  settings: (agentId: string) => [...bookingKeys.root(agentId), 'settings'] as const,

  // availability
  availability: (agentId: string) => [...bookingKeys.root(agentId), 'availability'] as const,

  // calendar assignment
  calendar: (agentId: string) => [...bookingKeys.root(agentId), 'calendar'] as const,
};

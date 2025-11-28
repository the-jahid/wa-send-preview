// src/features/whatsapp/keys.ts

// Keep a single root tuple and build everything from it.
// NOTE: we provide both `root` and `all` to avoid future mismatches.
export const waKeys = {
  root: ['wa'] as const,
  all: ['wa'] as const, // alias for backward compatibility

  // Scope per agent
  agent: (agentId: string) => [...waKeys.root, agentId] as const,

  // Status of the socket (in-memory)
  status: (agentId: string) => [...waKeys.agent(agentId), 'status'] as const,

  // 🔧 Login status (polling endpoint) — this was missing
  loginStatus: (agentId: string) => [...waKeys.agent(agentId), 'login-status'] as const,

  // QR related (if you cache it)
  qr: (agentId: string) => [...waKeys.agent(agentId), 'qr'] as const,

  // Pairing related
  pairing: (agentId: string) => [...waKeys.agent(agentId), 'pairing'] as const,

  // Messages (placeholder if you add message lists later)
  messages: (agentId: string) => [...waKeys.agent(agentId), 'messages'] as const,
};

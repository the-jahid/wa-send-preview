// ----------------------------------------------
// src/features/agent/index.ts
// Barrel exports + compatibility aliases
// ----------------------------------------------

// Types & constants
export * from './types';
export * from './keys';

// Hooks
export {
  // queries
  useAgents as useAgentsList, // v1 alias
  useAgents,                  // canonical
  useAgentsByUser,
  useAgent,
  useModelOptions,
  useProviders,
  useOpenAIModels,
  useGeminiModels,
  useClaudeModels,

  // mutations
  useCreateAgent,
  useUpdateAgent,
  useDeleteAgent,
} from './query';

// Low-level fetchers
export {
  // Canonical names
  listMyAgents,
  listAgentsByUser,
  getAgentById,
  createAgent,
  updateAgent,
  deleteAgent,
  getAllModelOptions,
  getProviders,
  getOpenAIModels,
  getGeminiModels,
  getClaudeModels,

  // Back-compat aliases
  listAgents,
  getAgent,

  // Utilities
  HttpError,
} from './apis';

// Types from low-level fetchers
export type { FetchOpts } from './apis';



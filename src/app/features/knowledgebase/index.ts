// app/(lib)/knowledgebase/index.ts
// Barrel file for the Knowledgebase client (types, schemas, API, hooks, keys).

/* =============================
 * Types & type guards
 * ============================= */
export * from './types';

/* =============================
 * Zod Schemas & client defaults
 * ============================= */
export * from './schemas';

/* =============================
 * Lightweight REST client (KBApi)
 * ============================= */
export * from './apis';

/* =============================
 * React Query hooks
 * ============================= */
export * from './query';

/* =============================
 * Query Keys
 * ============================= */
// Named + type export
export { KBKeys } from './keys';
export type { KBKey } from './keys';

// Also expose default as KBKeysDefault (optional convenience)
export { default as KBKeysDefault } from './keys';

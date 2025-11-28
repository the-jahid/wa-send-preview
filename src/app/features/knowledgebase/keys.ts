// app/(lib)/knowledgebase/keys.ts
// Central place for TanStack Query keys (stable & serialized)

import type { ListDocumentsQuery } from './types';

/**
 * Deterministically stringify objects/arrays for query keys.
 * - Deep-sorts object keys
 * - Drops undefined fields
 * - Handles Date (toISOString) and bigint (toString)
 * - Leaves primitives as-is (stringified)
 * - Returns '{}' for null/undefined so keys never contain `undefined`
 */
export function serialize(obj?: unknown): string {
  const sort = (v: unknown): unknown => {
    if (v === undefined) return undefined;
    if (v === null) return null;

    const t = typeof v;

    if (t === 'bigint') return v.toString();
    if (t === 'number' || t === 'string' || t === 'boolean') return v;
    if (v instanceof Date) return v.toISOString();

    if (Array.isArray(v)) {
      // Keep array order; sort each element recursively
      return v.map(sort);
    }

    if (t === 'object') {
      const inObj = v as Record<string, unknown>;
      const out: Record<string, unknown> = {};
      for (const k of Object.keys(inObj).sort()) {
        const sv = sort(inObj[k]);
        if (sv !== undefined) out[k] = sv;
      }
      return out;
    }

    // functions, symbols, etc. -> omit
    return undefined;
  };

  if (obj === undefined || obj === null) return '{}';
  const normalized = sort(obj);
  // If everything got stripped, still return '{}'
  return JSON.stringify(normalized ?? {});
}

export const KBKeys = {
  base: (agentId: string) => ['kb', agentId] as const,

  docs: (agentId: string, params?: Partial<ListDocumentsQuery>) =>
    ['kb', agentId, 'docs', serialize(params)] as const,

  doc: (agentId: string, documentId: string) =>
    ['kb', agentId, 'doc', documentId] as const,

  search: (agentId: string, q: string, extra?: Record<string, unknown>) =>
    ['kb', agentId, 'search', q, serialize(extra)] as const,
};

export type KBKey =
  | ReturnType<typeof KBKeys.base>
  | ReturnType<typeof KBKeys.docs>
  | ReturnType<typeof KBKeys.doc>
  | ReturnType<typeof KBKeys.search>;

export default KBKeys;

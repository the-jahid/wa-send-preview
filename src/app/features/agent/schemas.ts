// ----------------------------------------------
// src/features/agent/schemas.ts
// Zod schemas for client-side validation / forms
// - Robust null/empty handling for strings
// - Safe coercions for numbers/booleans
// - Light cross-field checks for modelType
// ----------------------------------------------
import { z } from 'zod';

/* ----------------- Helpers ----------------- */

// Coerce empty string "" -> null; trim non-empty strings
const nullableTrimmedString = z.preprocess(
  (v) => {
    if (v === undefined) return undefined;
    if (v === null) return null;
    if (typeof v === 'string') {
      const t = v.trim();
      return t.length ? t : null;
    }
    return v;
  },
  z.union([z.string().min(1), z.null()]),
);

// Coerce "true"/"1"/"false"/"0" strings to boolean
const boolish = z.preprocess((v) => {
  if (typeof v === 'string') {
    const s = v.trim().toLowerCase();
    if (s === 'true' || s === '1') return true;
    if (s === 'false' || s === '0') return false;
  }
  return v;
}, z.boolean());

// Coerce numbers (accept numeric strings)
const intCoerce = (min: number, max?: number) =>
  z.coerce.number().int().min(min).refine((n) => (max == null ? true : n <= max), {
    message: 'Number is out of range',
  });

// ISO-ish validator (optional)
const isoDateString = z
  .string()
  .refine((s) => !Number.isNaN(Date.parse(s)), { message: 'Invalid ISO date string' });

/* ----------------- Enums (UI-facing) ----------------- */
// Keep forward-compatible by allowing any string via .or(z.string())

const MemoryTypeEnum = z.enum(['BUFFER', 'NONE', 'RAG', 'VECTOR']).or(z.string());
const ProviderEnum = z.enum(['CHATGPT', 'GEMINI', 'CLAUDE']).or(z.string());

/* ----------------- Create schema ----------------- */

export const createAgentFormSchema = z
  .object({
    name: z.string().trim().min(1, 'Name is required'),
    memoryType: MemoryTypeEnum,

    // toggles
    isActive: boolish.optional().default(true),
    isLeadsActive: boolish.optional().default(false),
    isEmailActive: boolish.optional().default(false),

    // prompt & apiKey (apiKey is UI alias for userProvidedApiKey)
    prompt: nullableTrimmedString.optional(),
    apiKey: nullableTrimmedString.optional(),

    // provider & models
    modelType: ProviderEnum.optional(),
    openAIModel: nullableTrimmedString.optional(),
    geminiModel: nullableTrimmedString.optional(),
    claudeModel: nullableTrimmedString.optional(),

    useOwnApiKey: boolish.optional().default(false),

    // optional default history length for BUFFER
    historyLimit: intCoerce(0, 10_000).nullable().optional(),
  })
  .superRefine((val, ctx) => {
    // If useOwnApiKey is true, apiKey should be present (not empty string)
    if (val.useOwnApiKey && (val.apiKey ?? null) === null) {
      ctx.addIssue({
        path: ['apiKey'],
        code: z.ZodIssueCode.custom,
        message: 'apiKey is required when useOwnApiKey is true',
      });
    }

    // Prevent cross-provider model leakage (if you set a provider, avoid other models)
    if (val.modelType === 'CHATGPT') {
      if (val.geminiModel) {
        ctx.addIssue({
          path: ['geminiModel'],
          code: z.ZodIssueCode.custom,
          message: 'geminiModel should be empty when modelType is CHATGPT',
        });
      }
      if (val.claudeModel) {
        ctx.addIssue({
          path: ['claudeModel'],
          code: z.ZodIssueCode.custom,
          message: 'claudeModel should be empty when modelType is CHATGPT',
        });
      }
    }
    if (val.modelType === 'GEMINI') {
      if (val.openAIModel) {
        ctx.addIssue({
          path: ['openAIModel'],
          code: z.ZodIssueCode.custom,
          message: 'openAIModel should be empty when modelType is GEMINI',
        });
      }
      if (val.claudeModel) {
        ctx.addIssue({
          path: ['claudeModel'],
          code: z.ZodIssueCode.custom,
          message: 'claudeModel should be empty when modelType is GEMINI',
        });
      }
    }
    if (val.modelType === 'CLAUDE') {
      if (val.openAIModel) {
        ctx.addIssue({
          path: ['openAIModel'],
          code: z.ZodIssueCode.custom,
          message: 'openAIModel should be empty when modelType is CLAUDE',
        });
      }
      if (val.geminiModel) {
        ctx.addIssue({
          path: ['geminiModel'],
          code: z.ZodIssueCode.custom,
          message: 'geminiModel should be empty when modelType is CLAUDE',
        });
      }
    }
  });

/* ----------------- Update schema ----------------- */

export const updateAgentFormSchema = z
  .object({
    name: z.string().trim().min(1).optional(),
    memoryType: MemoryTypeEnum.optional(),

    isActive: boolish.optional(),
    isLeadsActive: boolish.optional(),
    isEmailActive: boolish.optional(),

    prompt: nullableTrimmedString.optional(),
    apiKey: nullableTrimmedString.optional(), // alias; controller maps to userProvidedApiKey

    modelType: ProviderEnum.optional(),
    openAIModel: nullableTrimmedString.optional(),
    geminiModel: nullableTrimmedString.optional(),
    claudeModel: nullableTrimmedString.optional(),

    useOwnApiKey: boolish.optional(),
    historyLimit: intCoerce(0, 10_000).nullable().optional(),
  })
  .superRefine((val, ctx) => {
    if (val.useOwnApiKey === true && (val.apiKey ?? undefined) === undefined) {
      // For PATCH, if they explicitly enable useOwnApiKey but omit apiKey, warn.
      ctx.addIssue({
        path: ['apiKey'],
        code: z.ZodIssueCode.custom,
        message: 'apiKey should be provided when enabling useOwnApiKey',
      });
    }

    // Same cross-provider model guard on update
    if (val.modelType === 'CHATGPT') {
      if (val.geminiModel) {
        ctx.addIssue({
          path: ['geminiModel'],
          code: z.ZodIssueCode.custom,
          message: 'geminiModel should be empty when modelType is CHATGPT',
        });
      }
      if (val.claudeModel) {
        ctx.addIssue({
          path: ['claudeModel'],
          code: z.ZodIssueCode.custom,
          message: 'claudeModel should be empty when modelType is CHATGPT',
        });
      }
    }
    if (val.modelType === 'GEMINI') {
      if (val.openAIModel) {
        ctx.addIssue({
          path: ['openAIModel'],
          code: z.ZodIssueCode.custom,
          message: 'openAIModel should be empty when modelType is GEMINI',
        });
      }
      if (val.claudeModel) {
        ctx.addIssue({
          path: ['claudeModel'],
          code: z.ZodIssueCode.custom,
          message: 'claudeModel should be empty when modelType is GEMINI',
        });
      }
    }
    if (val.modelType === 'CLAUDE') {
      if (val.openAIModel) {
        ctx.addIssue({
          path: ['openAIModel'],
          code: z.ZodIssueCode.custom,
          message: 'openAIModel should be empty when modelType is CLAUDE',
        });
      }
      if (val.geminiModel) {
        ctx.addIssue({
          path: ['geminiModel'],
          code: z.ZodIssueCode.custom,
          message: 'geminiModel should be empty when modelType is CLAUDE',
        });
      }
    }
  });

/* ----------------- List query schema (UI) ----------------- */

export const listAgentsQuerySchema = z.object({
  page: intCoerce(1).optional(),
  limit: intCoerce(1, 1000).optional(),

  sort: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),

  id: z.string().uuid().optional(),
  ids: z.string().optional(), // CSV handled in request builder

  isActive: boolish.optional(),
  isLeadsActive: boolish.optional(),
  isEmailActive: boolish.optional(),
  isKnowledgebaseActive: boolish.optional(),
  isBookingActive: boolish.optional(),
  useOwnApiKey: boolish.optional(),

  memoryType: z.string().optional(),
  modelType: z.string().optional(),
  openAIModel: z.string().optional(),
  geminiModel: z.string().optional(),
  claudeModel: z.string().optional(),

  historyLimit: z.coerce.number().int().optional(),

  name: z.string().optional(),
  prompt: z.string().optional(),
  apiKey: z.string().optional(),
  search: z.string().optional(),

  createdAtFrom: isoDateString.optional(),
  createdAtTo: isoDateString.optional(),
  updatedAtFrom: isoDateString.optional(),
  updatedAtTo: isoDateString.optional(),
});

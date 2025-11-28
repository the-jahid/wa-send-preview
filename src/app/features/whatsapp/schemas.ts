// src/features/whatsapp/schemas.ts
import { z } from 'zod';

// ---------------- Enums ----------------
export const WaStatusSchema = z.enum(['connecting', 'open', 'close', 'error', 'disconnected']);

// ---------------- Envelope ----------------
export const ApiErrorSchema = z.object({
  statusCode: z.number(),
  message: z.string(),
  error: z.string().optional(),
});

export const ApiEnvelope = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    statusCode: z.number(),
    message: z.string().optional(),
    data: dataSchema.optional(),
  });

// ---------------- Data Schemas ----------------
export const QrNewDataSchema = z.object({
  qrId: z.string().uuid(),
  qr: z.string().min(10),
  expiresAt: z.number(),
  refreshAfterMs: z.number(),
  status: WaStatusSchema,
});

export const QrValidateBodySchema = z.object({
  qrId: z.string().uuid(),
});

export const QrValidateDataSchema = z.union([
  z.object({ valid: z.literal(true), expiresAt: z.number() }),
  z.object({
    valid: z.literal(false),
    reason: z.enum(['expired', 'used', 'mismatch', 'missing', 'logged_in']),
    expiresAt: z.number().optional(),
  }),
]);

export const LoginStatusDataSchema = z.object({
  status: WaStatusSchema,
  loggedIn: z.boolean(),
});

export const LoginConfirmDataSchema = z.object({
  loggedIn: z.boolean(),
  status: WaStatusSchema,
});

export const StartResponseDataSchema = z.object({
  status: WaStatusSchema,
  message: z.string(),
  qr: z.string().min(10).optional(),
});

export const StartByPhoneBodySchema = z.object({
  phone: z.string().regex(/^\+?\d{6,18}$/),
});
export const StartByPhoneResponseDataSchema = z.object({
  status: WaStatusSchema,
  message: z.string(),
  pairingCode: z.string().optional(),
});

export const ToggleAgentBodySchema = z.object({
  isActive: z.boolean(),
});
export const ToggleAgentResponseDataSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  isActive: z.boolean(),
});

export const EnforcePolicyDataSchema = z.object({
  isActive: z.boolean(),
  status: WaStatusSchema,
  paused: z.boolean(),
});

export const StatusResponseDataSchema = z.object({
  status: WaStatusSchema,
});

export const SendMessageBodySchema = z.object({
  to: z.string().regex(/^\+?\d{6,18}$/),
  text: z.string().min(1).max(4096),
});
export const SendMessageResponseDataSchema = z.object({
  to: z.string(),
  messageId: z.string(),
});

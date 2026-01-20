// src/features/whatsapp/apis.ts
import { z } from 'zod';

import type {
  ApiEnvelope,
  LogoutResponse,
  QrNewData,
  QrValidateData,
  LoginStatusData,
  LoginConfirmData,
  StartResponseData,
  StartByPhoneBody,
  StartByPhoneResponseData,
  ToggleAgentBody,
  ToggleAgentResponseData,
  EnforcePolicyData,
  StatusResponseData,
  SendMessageBody,
  SendMessageResponseData,
} from './types';
import {
  ApiEnvelope as ApiEnvelopeSchema,
  QrNewDataSchema,
  QrValidateDataSchema,
  LoginStatusDataSchema,
  LoginConfirmDataSchema,
  StartResponseDataSchema,
  StartByPhoneBodySchema,
  StartByPhoneResponseDataSchema,
  ToggleAgentBodySchema,
  ToggleAgentResponseDataSchema,
  EnforcePolicyDataSchema,
  StatusResponseDataSchema,
  SendMessageBodySchema,
  SendMessageResponseDataSchema,
} from './schemas';
import { TokenGetter } from '@/lib/api-token-provider';

/** Resolve base URL safely for browser & server */
function baseUrl(): string {
  const env =
    process.env.NEXT_PUBLIC_BACKEND_API_URL ||
    process.env.API_URL ||
    '';
  if (env) return env.replace(/\/$/, '');
  if (typeof window !== 'undefined') {
    return `${window.location.protocol}//${window.location.host}`;
  }
  return 'http://localhost:3000';
}

/** Low-level HTTP with optional token getter (Bearer) */
async function http<T>(
  path: string,
  init: RequestInit = {},
  tokenGetter?: TokenGetter
): Promise<T> {
  const token = tokenGetter ? await tokenGetter() : null;

  const res = await fetch(`${baseUrl()}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers || {}),
    },
    cache: 'no-store',
  });

  const text = await res.text();
  const json = text ? JSON.parse(text) : {};

  if (!res.ok) {
    const message = (json?.message as string) || res.statusText || 'Request failed';
    const error = new Error(message) as Error & { status?: number; details?: any };
    error.status = res.status;
    error.details = json;
    throw error;
  }
  return json as T;
}

function unwrap<T extends z.ZodTypeAny>(json: unknown, dataSchema: T): z.infer<T> {
  const schema = ApiEnvelopeSchema(dataSchema);
  const parsed = schema.safeParse(json);
  if (!parsed.success) throw new Error(parsed.error.message);
  return (parsed.data?.data ?? undefined) as z.infer<T>;
}

/** ---------------------- Public API Wrappers ---------------------- */

// 1) Generate QR
export async function waGenerateQr(agentId: string, tokenGetter?: TokenGetter): Promise<QrNewData> {
  const json = await http<ApiEnvelope<QrNewData>>(`/whatsapp/${agentId}/qr/new`, { method: 'POST' }, tokenGetter);
  return unwrap(json, QrNewDataSchema);
}

// 2) Validate QR
export async function waValidateQr(agentId: string, qrId: string, tokenGetter?: TokenGetter): Promise<QrValidateData> {
  const body = { qrId };
  const json = await http<ApiEnvelope<QrValidateData>>(
    `/whatsapp/${agentId}/qr/validate`,
    { method: 'POST', body: JSON.stringify(body) },
    tokenGetter
  );
  return unwrap(json, QrValidateDataSchema);
}

// 3) Login status
export async function waLoginStatus(agentId: string, tokenGetter?: TokenGetter): Promise<LoginStatusData> {
  const json = await http<ApiEnvelope<LoginStatusData>>(`/whatsapp/${agentId}/login-status`, { method: 'GET' }, tokenGetter);
  return unwrap(json, LoginStatusDataSchema);
}

// 4) Login confirm
export async function waLoginConfirm(agentId: string, tokenGetter?: TokenGetter): Promise<LoginConfirmData> {
  const json = await http<ApiEnvelope<LoginConfirmData>>(`/whatsapp/${agentId}/login-confirm`, { method: 'POST' }, tokenGetter);
  return unwrap(json, LoginConfirmDataSchema);
}

// 5) Start (QR flow)
export async function waStart(agentId: string, tokenGetter?: TokenGetter): Promise<StartResponseData> {
  const json = await http<ApiEnvelope<StartResponseData>>(`/whatsapp/start/${agentId}`, { method: 'POST' }, tokenGetter);
  return unwrap(json, StartResponseDataSchema);
}

// 6) Start by phone (pairing)
// Note: This endpoint returns a FLAT response (not wrapped in .data)
export async function waStartByPhone(
  agentId: string,
  body: StartByPhoneBody,
  tokenGetter?: TokenGetter
): Promise<StartByPhoneResponseData> {
  // validate on client too (optional)
  StartByPhoneBodySchema.parse(body);
  const json = await http<{ statusCode: number; status: string; message: string; pairingCode?: string }>(
    `/whatsapp/start-by-phone/${agentId}`,
    { method: 'POST', body: JSON.stringify(body) },
    tokenGetter
  );
  // API returns flat response: { statusCode, status, message, pairingCode }
  // Extract fields directly (not from nested .data)
  return {
    status: json.status as StartByPhoneResponseData['status'],
    message: json.message,
    pairingCode: json.pairingCode,
  };
}

// 7) Toggle agent active
export async function waToggleAgent(
  agentId: string,
  body: { isActive: boolean },
  tokenGetter?: TokenGetter
): Promise<ToggleAgentResponseData> {
  ToggleAgentBodySchema.parse(body);
  const json = await http<ApiEnvelope<ToggleAgentResponseData>>(
    `/whatsapp/agent/${agentId}/toggle`,
    { method: 'PATCH', body: JSON.stringify(body) },
    tokenGetter
  );
  return unwrap(json, ToggleAgentResponseDataSchema);
}

// 8) Enforce policy
export async function waEnforcePolicy(agentId: string, tokenGetter?: TokenGetter): Promise<EnforcePolicyData> {
  const json = await http<ApiEnvelope<EnforcePolicyData>>(`/whatsapp/agent/${agentId}/enforce`, { method: 'POST' }, tokenGetter);
  return unwrap(json, EnforcePolicyDataSchema);
}

// 9) In-memory status
export async function waStatus(agentId: string, tokenGetter?: TokenGetter): Promise<StatusResponseData> {
  const json = await http<ApiEnvelope<StatusResponseData>>(`/whatsapp/status/${agentId}`, { method: 'GET' }, tokenGetter);
  return unwrap(json, StatusResponseDataSchema);
}

// 10) Logout
export async function waLogout(agentId: string, tokenGetter?: TokenGetter): Promise<LogoutResponse> {
  return http<LogoutResponse>(`/whatsapp/logout/${agentId}`, { method: 'POST' }, tokenGetter);
}

// 11) Send message
export async function waSendMessage(
  agentId: string,
  body: SendMessageBody,
  tokenGetter?: TokenGetter
): Promise<SendMessageResponseData> {
  SendMessageBodySchema.parse(body);
  const json = await http<ApiEnvelope<SendMessageResponseData>>(
    `/whatsapp/send/${agentId}`,
    { method: 'POST', body: JSON.stringify(body) },
    tokenGetter
  );
  return unwrap(json, SendMessageResponseDataSchema);
}

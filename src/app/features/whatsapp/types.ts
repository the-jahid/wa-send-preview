// src/features/whatsapp/types.ts
export type WaStatus = 'connecting' | 'open' | 'close' | 'error' | 'disconnected';

export type ApiEnvelope<T = unknown> = {
  statusCode: number;
  message?: string;
  data?: T;
};

export type ApiError = {
  statusCode: number;
  message: string;
  error?: string;
};

export type QrNewData = {
  qrId: string;
  qr: string;            // data URL
  expiresAt: number;     // ms epoch
  refreshAfterMs: number;
  status: WaStatus;
};

export type QrValidateData =
  | { valid: true; expiresAt: number }
  | { valid: false; reason: 'expired'|'used'|'mismatch'|'missing'|'logged_in'; expiresAt?: number };

export type LoginStatusData = {
  status: WaStatus;
  loggedIn: boolean;
};

export type LoginConfirmData = {
  loggedIn: boolean;
  status: WaStatus;
};

export type StartResponseData = {
  status: WaStatus;
  message: string;
  qr?: string;           // data URL if connecting & QR emitted
};

export type StartByPhoneBody = { phone: string };
export type StartByPhoneResponseData = {
  status: WaStatus;
  message: string;
  pairingCode?: string;  // only when generated
};

export type ToggleAgentBody = { isActive: boolean };
export type ToggleAgentResponseData = {
  id: string;
  name: string;
  isActive: boolean;
};

export type EnforcePolicyData = {
  isActive: boolean;
  status: WaStatus;
  paused: boolean;
};

export type StatusResponseData = { status: WaStatus };

export type SendMessageBody = { to: string; text: string };
export type SendMessageResponseData = { to: string; messageId: string };

export type LogoutResponse = { message: string };

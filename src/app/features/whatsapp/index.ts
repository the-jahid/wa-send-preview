// src/features/whatsapp/index.ts

// Types (includes the type alias `ApiEnvelope`)
export * from './types';

// Schemas — alias the schema builder to avoid clashing with the type name
export {
  ApiEnvelope as ApiEnvelopeSchema,
  ApiErrorSchema,
  WaStatusSchema,
  QrNewDataSchema,
  QrValidateBodySchema,
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

// API wrappers, query keys, and React Query hooks
export * from './apis';
export * from './keys';
export * from './query';

// src/app/features/google-auth-calendar-connection/types.ts
export type GoogleAuthUrlResponse = { url: string };

export type GoogleCallbackBody = {
  code: string;
  state?: string;
};

export type BasicMessageResponse = {
  message: string;
};

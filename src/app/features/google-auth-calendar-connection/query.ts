// src/app/features/google-auth-calendar-connection/query.ts
'use client';

import type { MutationOptions } from '@tanstack/react-query';
import type { TokenGetter } from '@/lib/api-token-provider';

import {
  apiGetGoogleAuthUrl,
  apiGetGoogleAuthUrlSimple,
  apiGoogleCallback,
} from './apis';
import type {
  GoogleAuthUrlResponse,
  GoogleCallbackBody,
  BasicMessageResponse,
} from './types';

/** Query keys (helpful for devtools / debugging) */
export const googleAuthKeys = {
  root: ['google-auth-calendar-connection'] as const,
  getUrl: (agentId?: string, returnTo?: string) =>
    [...googleAuthKeys.root, 'url', { agentId, returnTo }] as const,
  callback: () => [...googleAuthKeys.root, 'callback'] as const,
};

/**
 * Build a mutation config for: GET OAuth URL
 *
 * Usage:
 *   const getUrl = useMutation(
 *     getGoogleAuthUrlMutation({ getToken: useApiToken(), agentId, returnTo: window.location.href })
 *   );
 *   const { url } = await getUrl.mutateAsync();
 */
export function getGoogleAuthUrlMutation({
  getToken,
  agentId,
  returnTo,
}: {
  /** Promise-returning token getter (if your endpoint is guarded) */
  getToken?: TokenGetter;
  /** Agent we are connecting the Google calendar for */
  agentId?: string;
  /** Where to come back after OAuth completes */
  returnTo?: string;
} = {}): MutationOptions<GoogleAuthUrlResponse, Error, void> {
  // If NEXT_PUBLIC_API_BASE_URL is not set, fall back to "simple" dev endpoint
  const useSimple = !process.env.NEXT_PUBLIC_API_BASE_URL;

  return {
    mutationKey: googleAuthKeys.getUrl(agentId, returnTo),
    mutationFn: async () => {
      if (useSimple) {
        // e.g. GET http://localhost:3000/auth/google/url?agentId=&returnTo=
        return apiGetGoogleAuthUrlSimple({ agentId, returnTo });
      }
      const token = getToken ? await getToken() : null;
      // e.g. GET <BASE>/auth/google/url?agentId=&returnTo= (Bearer token)
      return apiGetGoogleAuthUrl(token, { agentId, returnTo });
    },
  };
}

/**
 * Build a mutation config for: POST OAuth callback { code, state? }
 *
 * Usage:
 *   const cb = useMutation(googleCallbackMutation({ getToken: useApiToken() }));
 *   await cb.mutateAsync({ code });
 */
export function googleCallbackMutation({
  getToken,
}: {
  getToken?: TokenGetter;
} = {}): MutationOptions<BasicMessageResponse, Error, GoogleCallbackBody> {
  return {
    mutationKey: googleAuthKeys.callback(),
    mutationFn: async (body: GoogleCallbackBody) => {
      const token = getToken ? await getToken() : null;
      return apiGoogleCallback(token, body);
    },
  };
}

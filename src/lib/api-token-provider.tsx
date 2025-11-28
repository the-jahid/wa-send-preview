"use client";

import React, { createContext, useContext, useMemo } from "react";
import { useAuth } from "@clerk/nextjs";

export type TokenGetter = () => Promise<string | null>;

const TokenCtx = createContext<TokenGetter>(() => Promise.resolve(null));

/**
 * Provides a function that returns a FRESH Bearer token on demand.
 * Falls back to the server-provided token if getToken() fails/returns null.
 */
export function ApiTokenProvider({
  initialToken,
  children,
}: {
  initialToken?: string | null;
  children: React.ReactNode;
}) {
  const { getToken } = useAuth();

  const getter: TokenGetter = useMemo(() => {
    return async () => {
      try {
        const fresh = await getToken(); // always hits Clerk for a fresh JWT
        console.log(fresh)
        if (fresh) return fresh;
      } catch {}
      return initialToken ?? null;
    };
  }, [getToken, initialToken]);

  return <TokenCtx.Provider value={getter}>{children}</TokenCtx.Provider>;
}

export function useApiToken(): TokenGetter {
  return useContext(TokenCtx);
}


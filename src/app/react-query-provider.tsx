// src/app/react-query-provider.tsx
"use client";

import { useState, type ReactNode } from "react";
import {
  QueryClient,
  QueryClientProvider,
  HydrationBoundary,
  type DehydratedState,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

export default function ReactQueryProvider({
  children,
  state,
}: {
  children: ReactNode;
  /** Optional dehydrated cache from server prefetching */
  state?: DehydratedState;
}) {
  // Create the client once per browser session
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // reasonable defaults for dashboards
            staleTime: 60_000,            // data is fresh for 1 min
            gcTime: 5 * 60_000,           // garbage collect after 5 min
            refetchOnWindowFocus: false,
            refetchOnReconnect: true,
            retry: 1,
          },
          mutations: {
            retry: 0,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {/* If you server-prefetch and dehydrate, pass the state prop down */}
      <HydrationBoundary state={state}>{children}</HydrationBoundary>
      {process.env.NODE_ENV === "development" ? (
        <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" />
      ) : null}
    </QueryClientProvider>
  );
}

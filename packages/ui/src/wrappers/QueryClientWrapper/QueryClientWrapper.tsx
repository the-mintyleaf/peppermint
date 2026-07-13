"use client";

import React, { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { QueryClientWrapperProps } from "./QueryClientWrapper.types";

const DEFAULT_QUERY_OPTIONS = {
  // A framework default of 30s avoids the refetch storm a 0ms staleTime causes on
  // every remount/refocus-adjacent event.
  staleTime: 30_000,
  gcTime: 1000 * 60 * 10,
  retry: 1,
  refetchOnWindowFocus: false,
};

export function QueryClientWrapper({
  children,
  config,
}: QueryClientWrapperProps) {
  const [queryClient] = useState(
    () =>
      // Deep-merge over defaults so passing a single query option (e.g. staleTime)
      // doesn't silently drop gcTime/retry/refetchOnWindowFocus.
      new QueryClient({
        ...config,
        defaultOptions: {
          ...config?.defaultOptions,
          queries: {
            ...DEFAULT_QUERY_OPTIONS,
            ...config?.defaultOptions?.queries,
          },
        },
      }),
  );
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

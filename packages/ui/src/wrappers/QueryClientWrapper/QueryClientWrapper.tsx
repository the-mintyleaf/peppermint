'use client';

import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { QueryClientWrapperProps } from './QueryClientWrapper.types';

const DEFAULT_CONFIG = {
  defaultOptions: {
    queries: {
      staleTime: 0,
      gcTime: 1000 * 60 * 10,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
} satisfies ConstructorParameters<typeof QueryClient>[0];

export function QueryClientWrapper({ children, config }: QueryClientWrapperProps) {
  const [queryClient] = useState(() => new QueryClient(config ?? DEFAULT_CONFIG));
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

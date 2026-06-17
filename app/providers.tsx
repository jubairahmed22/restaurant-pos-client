'use client';

import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { cacheManager, CacheKeys } from '@/lib/cache-manager';
import { captureAttribution } from '@/lib/attribution';

export default function Providers({ children }: { children: React.ReactNode }) {
  // Capture UTM attribution on every session's first page load
  useEffect(() => { captureAttribution(); }, []);

  const [queryClient] = useState(() => {
    const client = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime:            5 * 60 * 1000, // keep data fresh for 5 min
          gcTime:              10 * 60 * 1000, // hold in cache 10 min after unmount
          refetchOnWindowFocus: true,
          refetchOnReconnect:   true,
          retry: (failureCount, error: unknown) => {
            const status = (error as { response?: { status?: number } })?.response?.status;
            if (status && status >= 400 && status < 500 && status !== 429) return false;
            return failureCount < 3;
          },
          retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30_000),
        },
        mutations: {
          retry: 2,
          retryDelay: 800,
        },
      },
    });

    // Pre-warm from localStorage so first render is instant
    if (typeof window !== 'undefined') {
      const boot = cacheManager.get(CacheKeys.bootstrap());
      if (boot) client.setQueryData(['bootstrap'], boot);

      const tables = cacheManager.get(CacheKeys.tables());
      if (tables) client.setQueryData(['tables'], tables);
    }

    return client;
  });

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster
        position="bottom-right"
        toastOptions={{
          className: 'text-sm font-semibold text-slate-800 bg-white rounded-xl shadow-xl border border-slate-100/50',
          duration: 3500,
        }}
      />
    </QueryClientProvider>
  );
}
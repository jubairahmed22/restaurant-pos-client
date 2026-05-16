'use client';

import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: 1,
        staleTime: 5 * 60 * 1000 // 5 minutes caching threshold
      }
    }
  }));

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
'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useEffect } from 'react';
import { queryClient } from '@/lib/query/query-client';

export function Providers({ children }: { children: ReactNode }) {
  useEffect(() => {
    fetch('/api/auth/csrf', { credentials: 'include' }).catch(() => {
      /* non-fatal */
    });
  }, []);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

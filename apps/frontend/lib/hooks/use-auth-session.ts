'use client';

import { useQuery } from '@tanstack/react-query';
import { meRequest } from '@/lib/api/auth-api';

export function useAuthSession() {
  return useQuery({
    queryKey: ['auth-session'],
    queryFn: () => meRequest(),
    staleTime: 30_000,
  });
}

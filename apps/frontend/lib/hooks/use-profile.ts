'use client';

import { useQuery } from '@tanstack/react-query';
import { getProfile } from '@/lib/api/profile';

export function useProfile(enabled = true) {
  return useQuery({
    queryKey: ['profile-me'],
    queryFn: () => getProfile(),
    enabled,
    staleTime: 60_000,
  });
}

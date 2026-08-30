"use client";

import { useMemo } from "react";
import { isAdminUser, isLegacyAdminRole } from "@/lib/auth/is-admin";
import { useAuthSession } from "@/lib/hooks/use-auth-session";
import { useProfile } from "@/lib/hooks/use-profile";

/** Admin flag for nav chrome — auth session plus profile role fallback (native-safe). */
export function useIsAdmin(): boolean {
  const { data: session } = useAuthSession();
  const profile = useProfile(!!session);

  return useMemo(() => {
    if (isAdminUser(session)) return true;
    if (profile.isFetched && isLegacyAdminRole(profile.data?.role)) return true;
    return false;
  }, [session, profile.isFetched, profile.data?.role]);
}

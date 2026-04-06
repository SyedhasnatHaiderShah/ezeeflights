import { create } from 'zustand';

/**
 * Client-only UI flags. Authentication uses HttpOnly cookies via the Next.js BFF.
 */
interface AuthUiState {
  /** Reserved for future client-only auth UX. */
  _version: number;
}

export const useAuthStore = create<AuthUiState>(() => ({ _version: 1 }));

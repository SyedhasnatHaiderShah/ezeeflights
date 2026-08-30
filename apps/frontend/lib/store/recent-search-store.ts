import { create } from "zustand";

export interface PrefillState {
  origin: string;
  destination: string;
  searchType: string;
  searchDate?: string;
  autoSearch?: boolean;
  metadata?: any;
}

interface RecentSearchStore {
  prefill: PrefillState | null;
  prefillSearch: (state: PrefillState) => void;
  clearPrefill: () => void;
}

export const useRecentSearchStore = create<RecentSearchStore>((set) => ({
  prefill: null,
  prefillSearch: (state) => set({ prefill: state }),
  clearPrefill: () => set({ prefill: null }),
}));

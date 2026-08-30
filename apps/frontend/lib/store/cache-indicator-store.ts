import { create } from 'zustand';

interface CacheIndicatorState {
  fromCache: boolean;
  cachedAgoLabel: string | null;
  setCacheStatus: (fromCache: boolean, cachedAgoLabel: string | null) => void;
}

export const useCacheIndicatorStore = create<CacheIndicatorState>((set) => ({
  fromCache: false,
  cachedAgoLabel: null,
  setCacheStatus: (fromCache, cachedAgoLabel) => set({ fromCache, cachedAgoLabel }),
}));

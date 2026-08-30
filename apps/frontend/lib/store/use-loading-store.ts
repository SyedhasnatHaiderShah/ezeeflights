import { create } from "zustand";

interface LoadingStore {
  isLoading: boolean;
  message: string | null;
  isSimple?: boolean;
  heroMode?: boolean;
  startLoading: (message?: string, isSimple?: boolean, heroMode?: boolean) => void;
  stopLoading: () => void;
}

export const useLoadingStore = create<LoadingStore>((set) => ({
  isLoading: false,
  message: null,
  isSimple: false,
  heroMode: false,
  startLoading: (message = "Processing...", isSimple = false, heroMode = false) =>
    set({ isLoading: true, message, isSimple, heroMode }),
  stopLoading: () => set({ isLoading: false, message: null, isSimple: false, heroMode: false }),
}));


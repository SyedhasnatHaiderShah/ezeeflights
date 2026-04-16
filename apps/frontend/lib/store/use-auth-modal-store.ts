import { create } from "zustand";

type AuthView = "login" | "register";

interface AuthModalStore {
  isOpen: boolean;
  view: AuthView;
  open: (view?: AuthView) => void;
  close: () => void;
  setView: (view: AuthView) => void;
}

export const useAuthModalStore = create<AuthModalStore>((set) => ({
  isOpen: false,
  view: "login",
  open: (view = "login") => set({ isOpen: true, view }),
  close: () => set({ isOpen: false }),
  setView: (view) => set({ view }),
}));

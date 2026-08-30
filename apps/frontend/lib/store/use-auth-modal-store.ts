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
  open: (view = "login") => {
    if (typeof window !== "undefined") {
      if (
        window.sessionStorage.getItem("auth-modal-suppress-next-open") === "1"
      ) {
        window.sessionStorage.removeItem("auth-modal-suppress-next-open");
        return;
      }
    }
    set({ isOpen: true, view });
  },
  close: () => set({ isOpen: false }),
  setView: (view) => set({ view }),
}));

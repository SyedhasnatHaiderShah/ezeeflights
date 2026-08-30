import { create } from "zustand";
import type { MicrophonePermissionStatus } from "@/lib/capacitor/microphone-permission";

type MicrophonePermissionStore = {
  isOpen: boolean;
  status: MicrophonePermissionStatus;
  onGrantedCallback: (() => void) | null;
  open: (
    status: MicrophonePermissionStatus,
    onGranted?: (() => void) | null,
  ) => void;
  close: () => void;
  notifyGranted: () => void;
};

export const useMicrophonePermissionStore = create<MicrophonePermissionStore>(
  (set, get) => ({
    isOpen: false,
    status: "denied",
    onGrantedCallback: null,
    open: (status, onGranted = null) => {
      set({
        isOpen: true,
        status,
        onGrantedCallback: onGranted,
      });
    },
    close: () => {
      set({
        isOpen: false,
        onGrantedCallback: null,
      });
    },
    notifyGranted: () => {
      const callback = get().onGrantedCallback;
      get().close();
      callback?.();
    },
  }),
);

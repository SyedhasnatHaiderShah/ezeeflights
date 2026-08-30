"use client";

import { useEffect, useState } from "react";
import { Mic, Settings } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  ensureMicrophonePermission,
  getMicrophonePermissionMessage,
  isNative,
} from "@/lib/capacitor";
import { openAppSettings } from "@/lib/capacitor/open-app-settings";
import { useMicrophonePermissionStore } from "@/lib/store/microphone-permission-store";

export function MicrophonePermissionModal() {
  const { t } = useTranslation();
  const { isOpen, status, close, notifyGranted } = useMicrophonePermissionStore();
  const [isRequesting, setIsRequesting] = useState(false);

  const retryPermission = async () => {
    setIsRequesting(true);
    try {
      const result = await ensureMicrophonePermission();
      if (result === "granted") {
        notifyGranted();
      }
    } finally {
      setIsRequesting(false);
    }
  };

  useEffect(() => {
    if (!isNative() || !isOpen) return;

    let removeListener: (() => void) | undefined;

    (async () => {
      const { App } = await import("@capacitor/app");
      const handle = await App.addListener("appStateChange", ({ isActive }) => {
        if (isActive) {
          void ensureMicrophonePermission().then((result) => {
            if (result === "granted") {
              notifyGranted();
            }
          });
        }
      });
      removeListener = () => {
        void handle.remove();
      };
    })();

    return () => {
      removeListener?.();
    };
  }, [isOpen, notifyGranted]);

  const handleOpenSettings = async () => {
    await openAppSettings();
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) close();
      }}
    >
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-redmix/10">
            <Mic className="h-6 w-6 text-redmix" />
          </div>
          <DialogTitle className="text-center">
            {status === "unsupported"
              ? t("Microphone unavailable")
              : t("Microphone access needed")}
          </DialogTitle>
          <DialogDescription className="text-center">
            {t(getMicrophonePermissionMessage(status))}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          {status !== "unsupported" && (
            <Button
              type="button"
              variant="brand-red"
              className="w-full rounded-xl"
              disabled={isRequesting}
              onClick={() => void retryPermission()}
            >
              {isRequesting ? t("Checking...") : t("Allow microphone")}
            </Button>
          )}
          {status !== "unsupported" && isNative() && (
            <Button
              type="button"
              variant="outline"
              className="w-full rounded-xl"
              onClick={() => void handleOpenSettings()}
            >
              <Settings className="mr-2 h-4 w-4" />
              {t("Open Settings")}
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            className="w-full rounded-xl"
            onClick={close}
          >
            {t("Not now")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

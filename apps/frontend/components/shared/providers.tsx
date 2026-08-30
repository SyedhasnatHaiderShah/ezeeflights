"use client";

import "@/lib/dom-patch";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useEffect } from "react";
import { queryClient } from "@/lib/query/query-client";
import { useDestinationInsightsStore } from "@/lib/store/destination-insights-store";
import { isNative } from "@/lib/capacitor";
import { nextApiOrigin } from "@/lib/bff/config";
import { CurrencyInitializer } from "./CurrencyInitializer";
import nextDynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useToast } from "@/lib/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { initializeDeviceOrigin } from "@/lib/bff/config";
import { NativeOverscrollFix } from "./NativeOverscrollFix";
import { CapacitorInit } from "./CapacitorInit";

const AuthModal = nextDynamic(
  () => import("@/components/auth/auth-modal").then((m) => m.AuthModal),
  { ssr: false },
);

const FloatingAskEzee = nextDynamic(
  () =>
    import("@/components/ai/FloatingAskEzee").then((m) => m.FloatingAskEzee),
  { ssr: false },
);

const MicrophonePermissionModal = nextDynamic(
  () =>
    import("@/components/ai/MicrophonePermissionModal").then(
      (m) => m.MicrophonePermissionModal,
    ),
  { ssr: false },
);

export function Providers({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { toast } = useToast();
  const { t } = useTranslation();

  useEffect(() => {
    if (!isNative()) return;
    (async () => {
      await initializeDeviceOrigin();
      const url = `${nextApiOrigin()}/api/auth/csrf`;
      fetch(url, { credentials: "include" }).catch(() => {
        /* non-fatal */
      });
      useDestinationInsightsStore.getState().hydratePersisted();
    })();
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const pendingToast = window.sessionStorage.getItem(
        "show_login_success_toast",
      );
      if (pendingToast) {
        window.sessionStorage.removeItem("show_login_success_toast");
        setTimeout(() => {
          toast({
            title: t("Welcome back!"),
            description:
              pendingToast === "google"
                ? t("You have successfully signed in with Google.")
                : t("You have successfully signed in."),
          });
        }, 150);
      }
    }
  }, [toast, t]);

  // Global chunk error handler (fires when a new deployment invalidates old chunks)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleChunkError = (event: ErrorEvent | PromiseRejectionEvent) => {
      const errorMsg =
        (event as ErrorEvent).message ||
        ((event as PromiseRejectionEvent).reason?.message as string) ||
        "";

      if (
        errorMsg.includes("Failed to load chunk") ||
        errorMsg.includes("ChunkLoadError")
      ) {
        const reloadCount = parseInt(
          sessionStorage.getItem("chunk_reload_count") || "0",
          10,
        );
        // Only attempt reload up to 2 times to prevent infinite loops
        if (reloadCount < 2) {
          sessionStorage.setItem("chunk_reload_count", String(reloadCount + 1));
          window.location.reload();
        } else {
          setTimeout(() => {
            sessionStorage.removeItem("chunk_reload_count");
          }, 5000);
        }
      }
    };

    window.addEventListener("error", handleChunkError);
    window.addEventListener("unhandledrejection", handleChunkError);

    return () => {
      window.removeEventListener("error", handleChunkError);
      window.removeEventListener("unhandledrejection", handleChunkError);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <NativeOverscrollFix />
      <CapacitorInit />
      <CurrencyInitializer />
      {children}
      <AuthModal />
      <MicrophonePermissionModal />
      {pathname === "/" && <FloatingAskEzee />}
    </QueryClientProvider>
  );
}

"use client";

import { useEffect, useRef } from "react";
import { useLoadingStore } from "@/lib/store/use-loading-store";
import { useTranslation } from "react-i18next";

export function GlobalLoaderTrigger({
  message,
  heroMode = false,
}: {
  message?: string;
  heroMode?: boolean;
}) {
  const { startLoading } = useLoadingStore();
  const { t } = useTranslation();
  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    if (hasTriggeredRef.current) return;
    hasTriggeredRef.current = true;
    startLoading(
      message ? t(message) : t("Searching flights..."),
      false,
      heroMode,
    );
  }, [startLoading, message, heroMode]);

  return null;
}

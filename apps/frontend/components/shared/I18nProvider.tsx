"use client";

import React, { useEffect } from "react";
import { I18nextProvider } from "react-i18next";
import i18n from "@/lib/i18n";

export function I18nProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const applyLanguage = (lng: string) => {
      // RTL languages
      const rtlLangs = ["ar", "ur"];
      document.documentElement.dir = rtlLangs.includes(lng) ? "rtl" : "ltr";
      document.documentElement.lang = lng;
      // Persist to cookie for server-side detection support
      document.cookie = `lang=${lng}; path=/; max-age=31536000; SameSite=Lax`;
    };

    // Apply current language on mount (after hydration — safe to differ from server)
    applyLanguage(i18n.language);

    // Force Turkish domain to Turkish language (client-only)
    // i18n.ts already calls changeLanguage("tr") synchronously on the client,
    // but we keep this as a safety net in case the module loaded before the DOM.
    if (
      typeof window !== "undefined" &&
      window.location.hostname.toLowerCase().includes("tr.ezeeflights.com") &&
      i18n.language !== "tr"
    ) {
      i18n.changeLanguage("tr");
    }

    // Listen to future changes
    i18n.on("languageChanged", applyLanguage);

    return () => {
      i18n.off("languageChanged", applyLanguage);
    };
  }, []);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}

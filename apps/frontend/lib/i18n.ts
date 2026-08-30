"use client";

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Import all translation files statically for immediate availability
// This avoids hydration issues and flickering since we don't have to wait for HTTP requests
import en from "../translations/en.json";
import tr from "../translations/tr.json";
import ar from "../translations/ar.json";
import fr from "../translations/fr.json";
import hi from "../translations/hi.json";
import es from "../translations/es.json";
import et from "../translations/et.json";
import de from "../translations/de.json";
import zhHans from "../translations/zh-hans.json";
import zhHant from "../translations/zh-hant.json";
import ur from "../translations/ur.json";
import tl from "../translations/tl.json";
import jpn from "../translations/jpn.json";
import ko from "../translations/ko.json";
import th from "../translations/th.json";

export const SUPPORTED_LANGUAGES = [
  { code: "en", name: "English" },
  { code: "hi", name: "हिन्दी" },
  { code: "zh-hans", name: "简体中文" },
  { code: "zh-hant", name: "繁體中文" },
  { code: "ar", name: "العربية" },
  { code: "ur", name: "اردو" },
  { code: "tl", name: "Tagalog" },
  { code: "es", name: "Español" },
  { code: "fr", name: "Français" },
  { code: "de", name: "Deutsch" },
  { code: "tr", name: "Türkçe" },
  { code: "et", name: "Eesti" },
  { code: "jpn", name: "日本語" },
  { code: "ko", name: "한국어" },
  { code: "th", name: "ไทย" },
];

const resources = {
  en: { translation: en },
  tr: { translation: tr },
  ar: { translation: ar },
  fr: { translation: fr },
  hi: { translation: hi },
  es: { translation: es },
  et: { translation: et },
  de: { translation: de },
  "zh-hans": { translation: zhHans },
  "zh-hant": { translation: zhHant },
  ur: { translation: ur },
  tl: { translation: tl },
  jpn: { translation: jpn },
  ko: { translation: ko },
  th: { translation: th },
};

// SSR vs Client detection:
// typeof window === "undefined" means we're running on the server (SSR).
// We always initialize with lng="en" on the server so the SSR HTML output
// is identical to the initial client render — this eliminates hydration
// mismatches that happen when any user (on ANY domain) has a non-English
// language stored in their cookie (e.g. Turkish, Arabic, Hindi, etc.).
// LanguageDetector reads the cookie on the client and switches language
// after hydration. The I18nProvider useEffect forces Turkish specifically
// on tr.ezeeflights.com if no preference is stored.
const isClient = typeof window !== "undefined";

const supportedLngs = [
  "en",
  "tr",
  "ar",
  "fr",
  "hi",
  "es",
  "et",
  "de",
  "zh-hans",
  "zh-hant",
  "ur",
  "tl",
  "jpn",
  "ko",
  "th",
];

// Always initialize with "en" so that the SSR HTML and the initial client
// render are identical — eliminates hydration mismatches.
// LanguageDetector picks up the stored lang (cookie / localStorage) and
// switches after first render. I18nProvider forces "tr" on the Turkish
// domain via useEffect (client-only, runs after hydration).
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    // CRITICAL: pass an explicit lng only on the server so SSR always
    // outputs English. On the client we let LanguageDetector decide.
    ...(isClient ? {} : { lng: "en" }),
    fallbackLng: "en",
    supportedLngs,
    nonExplicitSupportedLngs: false,
    cleanCode: true,
    lowerCaseLng: true,
    interpolation: {
      escapeValue: false, // React already escapes by default
    },
    detection: {
      order: ["cookie", "localStorage", "navigator"],
      lookupCookie: "lang",
      caches: ["cookie", "localStorage"],
      convertDetectedLanguage: (lng: string) => {
        const normalized = (lng || "").toLowerCase();
        if (
          normalized === "zh-hant" ||
          normalized === "zh-tw" ||
          normalized === "zh-hk" ||
          normalized === "zh-mo"
        ) {
          return "zh-hant";
        }
        if (
          normalized === "zh-hans" ||
          normalized === "zh-cn" ||
          normalized === "zh-sg"
        ) {
          return "zh-hans";
        }
        if (normalized.startsWith("zh")) return "zh-hans";
        return normalized;
      },
    },
  });

// The I18nProvider (components/shared/I18nProvider.tsx) handles
// forcing Turkish on tr.ezeeflights.com via useEffect (client-only).
// No module-level domain checks needed here.
export default i18n;

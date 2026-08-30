"use client";

import * as React from "react";
import { useTranslation } from "react-i18next";
import { SUPPORTED_LANGUAGES } from "@/lib/i18n";
import { isTurkishDomain } from "@/lib/utils/domain";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe } from "lucide-react";
import { cn } from "@/lib/utils";

function resolveLanguageCode(active?: string): string {
  return (active || "en").toLowerCase();
}

function findSupportedLanguage(active?: string) {
  const lng = resolveLanguageCode(active);
  return (
    SUPPORTED_LANGUAGES.find((lang) => lng === lang.code) ||
    SUPPORTED_LANGUAGES.find(
      (lang) => lng.startsWith(lang.code) && (lng.length === lang.code.length || lng[lang.code.length] === "-"),
    ) ||
    SUPPORTED_LANGUAGES[0]
  );
}

export function LanguageSelector({
  isTransparent,
}: {
  isTransparent?: boolean;
}) {
  const { i18n } = useTranslation();
  const activeLng = i18n.resolvedLanguage || i18n.language;
  const currentLang = findSupportedLanguage(activeLng);

  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code);
  };

  const [isOpen, setIsOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const isTr = isTurkishDomain();
  const languagesToShow = isTr
    ? SUPPORTED_LANGUAGES.filter((lang) => lang.code === "tr" || lang.code === "en")
    : SUPPORTED_LANGUAGES;

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen} modal={false}>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "flex items-center gap-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-300",
            isTransparent
              ? "text-white hover:bg-white/10"
              : "text-foreground hover:bg-muted",
          )}
        >
          <span className="cursor-pointer">{currentLang.name}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        onPointerDownOutside={() => setIsOpen(false)}
        className={cn(
          "w-40 p-2 rounded-2xl glass shadow-2xl mt-3",
          isTransparent
            ? "bg-black/60 border-white/10 text-white"
            : "bg-background/80 border-border/40 text-foreground",
        )}
      >
        <div className="grid gap-1 max-h-[280px] overflow-y-auto pr-1">
          {languagesToShow.map((lang) => (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              className={cn(
                "flex items-center justify-between cursor-pointer rounded-xl px-3 py-2 transition-colors",
                currentLang.code === lang.code
                  ? "bg-redmix text-white font-medium"
                  : "hover:bg-redmix/10 hover:text-foreground",
              )}
            >
              <span>{lang.name}</span>
            </DropdownMenuItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

"use client";

import * as React from "react";
import { Mail, MapPin } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

type ContactLocation = {
  address: string;
  phone: string;
  country?: string;
  city?: string;
  flagType?: "image" | "svg";
  flagSrc?: string;
  flagSvg?: React.ReactNode;
};

function LocationCard({
  address,
  phone,
  country,
  city,
  flagType,
  flagSrc,
  flagSvg,
  compact = false,
}: ContactLocation & { compact?: boolean }) {
  const { t } = useTranslation();

  return (
    <div
      className={cn(
        "h-full rounded-3xl border border-border/60 bg-surface-container-lowest p-3",
        compact && "md:rounded-2xl md:p-3",
      )}
    >
      <div className="flex h-full flex-col items-start gap-3">
        <div className="flex items-center gap-2 border-b border-border/40 pb-2 w-full">
          {flagType === "image" && flagSrc ? (
            <div className="h-5 w-7 shrink-0 overflow-hidden rounded border border-border/50 shadow-sm flex items-center justify-center bg-muted">
              <img
                src={flagSrc}
                alt={t(country || "Flag")}
                className="h-full w-full object-cover"
              />
            </div>
          ) : flagType === "svg" && flagSvg ? (
            <div className="h-5 w-7 shrink-0 overflow-hidden rounded border border-border/50 shadow-sm flex items-center justify-center bg-muted">
              {flagSvg}
            </div>
          ) : (
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-redmix/5 dark:bg-red-500/10 text-redmix dark:text-red-400">
              <MapPin className="h-3.5 w-3.5" />
            </span>
          )}
          <span className="text-xs font-bold text-foreground truncate">
            {t(city || country || "Office")}
          </span>
        </div>
        <div className="min-w-0 space-y-2">
          <p className="text-xs font-semibold leading-relaxed text-foreground/80">
            {t(address)}
          </p>
          <a
            href={`tel:${phone.replace(/[^\d+]/g, "")}`}
            className="inline-flex min-h-10 items-center text-xs font-bold text-redmix dark:text-red-400 transition hover:underline mr-3"
          >
            {phone}
          </a>
          <span className="inline-flex items-center rounded-full bg-redmix/10 dark:bg-red-500/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-redmix dark:text-red-400">
            {t("24×7 Available")}
          </span>
        </div>
      </div>
    </div>
  );
}

function EmailCard({
  email,
  compact = false,
}: {
  email: string;
  compact?: boolean;
}) {
  const { t } = useTranslation();

  return (
    <a
      href={`mailto:${email}`}
      className={cn(
        "flex-col h-full min-h-[140px] justify-start gap-3 rounded-3xl border border-border/60 bg-surface-container-lowest p-3 transition hover:bg-muted/30 active:scale-[0.99]",
        compact && "md:min-h-0 md:rounded-2xl md:p-3",
      )}
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-redmix/5 dark:bg-red-500/10 text-redmix dark:text-red-400">
        <Mail className="h-4 w-4" />
      </span>
      <p className="text-sm font-medium tracking-wider text-foreground/80">
        {t("Email Us")}
      </p>
      <p className="mt-1 break-all text-xs font-bold text-redmix dark:text-red-400">{email}</p>
    </a>
  );
}

export function CollapsibleContactSection({
  locations,
  email,
  className,
  contentLayout = "three-column",
  title = "Contact Us",
  forceOpen,
  onHeaderClick,
  noAccordion = false,
}: {
  locations: ReadonlyArray<ContactLocation>;
  email: string;
  className?: string;
  contentLayout?: "stack" | "three-column";
  title?: string;
  forceOpen?: boolean;
  onHeaderClick?: () => void;
  noAccordion?: boolean;
}) {
  const { t } = useTranslation();
  const useThreeColumns = contentLayout === "three-column";
  const contactCount = locations.length + 1;

  const content = (
    <div
      className={cn(
        useThreeColumns
          ? cn(
              "grid gap-4 md:gap-3",
              locations.length > 3
                ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                : contactCount === 2
                  ? "grid-cols-1 md:grid-cols-2"
                  : "grid-cols-1 md:grid-cols-3",
            )
          : "space-y-3",
      )}
    >
      {locations.map((location, idx) => (
        <LocationCard
          key={`${location.address}-${idx}`}
          {...location}
          compact={useThreeColumns}
        />
      ))}
      <EmailCard email={email} compact={useThreeColumns} />
    </div>
  );

  if (noAccordion) {
    return content;
  }

  return (
    <Accordion
      type="single"
      collapsible
      className={className}
      {...(forceOpen !== undefined
        ? { value: forceOpen ? "footer-contact" : "" }
        : {})}
    >
      <AccordionItem
        value="footer-contact"
        className="overflow-hidden rounded-2xl border border-border/60 border-b border-b-border/60 bg-surface-container-lowest px-3 data-[state=open]:border-redmix/25"
      >
        <AccordionTrigger
          onClick={onHeaderClick}
          className="min-h-12 px-3 py-3 text-base font-semibold hover:no-underline"
        >
          <span className="flex min-w-0 flex-col items-start gap-0.5 text-left">
            <span>{t(title)}</span>
            <span className="text-xs font-medium normal-case tracking-normal text-foreground/80">
              {t("View all contact options")} · {contactCount}
            </span>
          </span>
        </AccordionTrigger>
        <AccordionContent className="px-1 pb-3 pt-0">
          {content}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

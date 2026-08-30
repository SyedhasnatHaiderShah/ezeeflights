"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { isNavPathActive } from "@/lib/auth/is-admin";
import type { FooterLink } from "@/lib/footer-links";

function LinkList({
  links,
  onLinkClick,
  showChevron = true,
  compact = false,
  desktopColumn = false,
}: {
  links: ReadonlyArray<FooterLink>;
  onLinkClick?: () => void;
  showChevron?: boolean;
  compact?: boolean;
  desktopColumn?: boolean;
}) {
  const { t } = useTranslation();
  const pathname = usePathname();

  return (
    <ul
      className={cn(
        "space-y-1",
        desktopColumn &&
          "flex flex-row flex-wrap gap-y-1 space-y-0 md:flex-col",
      )}
    >
      {links.map((link) => {
        const isActive = link.href ? isNavPathActive(pathname, link.href) : false;
        const className = cn(
          "flex items-center justify-between rounded-2xl px-2 py-3 text-xs transition-colors hover:bg-muted/60 active:bg-muted",
          isActive
            ? "font-semibold text-redmix"
            : "font-medium text-foreground",
          compact ? "min-h-10" : "min-h-11",
          desktopColumn &&
            "md:min-h-0 md:rounded-none md:px-0 md:py-1 text-xs font-semibold md:hover:bg-transparent md:hover:text-redmix md:hover:underline md:active:bg-transparent",
          desktopColumn && (isActive ? "md:text-redmix" : "md:text-foreground/80"),
        );

        const innerContent = (
          <>
            <span className="line-clamp-2">{t(link.label)}</span>
            {showChevron ? (
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground md:hidden" />
            ) : null}
          </>
        );

        return (
          <li key={`${link.href || link.label}-${link.label}`}>
            {link.href ? (
              <Link
                href={link.href as never}
                onClick={onLinkClick}
                className={className}
              >
                {innerContent}
              </Link>
            ) : (
              <span className={cn(className, "cursor-default")}>
                {innerContent}
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export function CollapsibleLinkSections({
  sections,
  onLinkClick,
  className,
  variant = "card",
  title = "Company, Products & Support",
  contentLayout = "stack",
  forceOpen,
  onHeaderClick,
  noAccordion = false,
}: {
  sections: ReadonlyArray<{
    title: string;
    value: string;
    links: ReadonlyArray<FooterLink>;
  }>;
  onLinkClick?: () => void;
  className?: string;
  variant?: "card" | "plain";
  title?: string;
  contentLayout?: "stack" | "three-column";
  forceOpen?: boolean;
  onHeaderClick?: () => void;
  noAccordion?: boolean;
}) {
  const { t } = useTranslation();
  const totalLinks = sections.reduce(
    (count, section) => count + section.links.length,
    0,
  );
  const useThreeColumns = contentLayout === "three-column";

  const content = (
    <div
      className={cn(
        useThreeColumns
          ? cn(
              "grid gap-4 md:gap-3",
              sections.length === 2 ? "md:grid-cols-2" : "md:grid-cols-3"
            )
          : "space-y-3",
      )}
    >
      {sections.map((section, index) => (
        <div
          key={section.value}
          className={cn(
            "min-w-0",
            useThreeColumns &&
              index > 0 &&
              "md:border-l-3 md:border-border/60 md:pl-3",
          )}
        >
          <p className="mb-2 text-sm font-medium tracking-wider text-foreground md:px-0">
            {t(section.title)}
          </p>
          <LinkList
            links={section.links}
            onLinkClick={onLinkClick}
            compact={variant === "plain"}
            showChevron={!useThreeColumns}
            desktopColumn={useThreeColumns}
          />
        </div>
      ))}
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
        ? { value: forceOpen ? "all-footer-links" : "" }
        : {})}
    >
      <AccordionItem
        value="all-footer-links"
        className={cn(
          variant === "card" &&
            "overflow-hidden rounded-2xl border border-border/60 border-b border-b-border/60 bg-surface-container-lowest px-3 data-[state=open]:border-redmix/25",
          variant === "plain" &&
            "border-0 border-b border-border/60 bg-transparent px-0 shadow-none",
        )}
      >
        <AccordionTrigger
          onClick={onHeaderClick}
          className={cn(
            "min-h-12 px-3 py-3 text-base font-semibold hover:no-underline",
            variant === "plain" && "px-1",
          )}
        >
          <span className="flex min-w-0 flex-col items-start gap-0.5 text-left">
            <span>{t(title)}</span>
            <span className="text-xs font-medium normal-case tracking-normal text-foreground/80">
              {t("View all links")} · {totalLinks}
            </span>
          </span>
        </AccordionTrigger>
        <AccordionContent
          className={cn("px-1 pb-3 pt-0", variant === "plain" && "px-0")}
        >
          {content}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

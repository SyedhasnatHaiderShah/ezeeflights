"use client";

import * as React from "react";
import {
  Apple,
  Facebook,
  Instagram,
  Linkedin,
  Play,
  Twitter,
  type LucideIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useTheme } from "next-themes";
import EzeeFlightsLogo from "@/components/ezee-flights-logo";
import { FOOTER_LINK_SECTIONS } from "@/lib/footer-links";
import { CollapsibleLinkSections } from "@/components/shared/CollapsibleLinkSections";
import { CollapsibleContactSection } from "@/components/shared/CollapsibleContactSection";
import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { getContactLocations, type ContactLocation } from "@/lib/utils/domain";

const socialIcons = [
  {
    icon: Facebook,
    href: "https://www.facebook.com/ezeeflightsusa",
    label: "Facebook",
  },
  {
    icon: Instagram,
    href: "https://www.instagram.com/ezeeflightss/",
    label: "Instagram",
  },
  { icon: Twitter, href: "https://x.com/Ezeeflightss", label: "Twitter" },
  {
    icon: Linkedin,
    href: "https://www.linkedin.com/company/ezee-flights/",
    label: "LinkedIn",
  },
] as const;

const globalSites = [
  {
    src: "/uk.png",
    label: "UK",
    href: "https://www.uk.ezeeflights.com/?_gl=1*lu8l7u*_gcl_au*NjMzOTc3MzY2LjE3NzQ4NTEwNjUuMTg1NjU4MjAxNC4xNzc1ODk3ODU5LjE3NzU4OTc4NTk.",
  },
  {
    src: "/ca.png",
    label: "Canada",
    href: "https://www.ezeeflights.ca/?_gl=1*tddahm*_gcl_au*NjMzOTc3MzY2LjE3NzQ4NTEwNjUuMTg1NjU4MjAxNC4xNzc1ODk3ODU5LjE3NzU4OTc4NTk.",
  },
  {
    src: "/ae.png",
    label: "UAE",
    href: "https://www.ezeeflights.ae/",
  },
  {
    src: "/turkey-flag.png",
    label: "Turkey",
    href: "https://tr.ezeeflights.com/",
  },
  {
    src: "/india-flag.png",
    label: "India",
    href: "https://in.ezeeflights.com/",
  },
] as const;

// Default contact locations for initial render / SSR
const DEFAULT_CONTACT_LOCATIONS = [
  {
    country: "United States",
    city: "San Francisco Office",
    address:
      "945 Taraval Street, San Francisco, CA 94116 United States of America",
    phone: "+1-888-604-0198",
    flagType: "image" as const,
    flagSrc: "/usa.png",
  },
  {
    country: "United Arab Emirates",
    city: "Dubai Office",
    address:
      "17th floor 1703 Venture Zone Business Center Fahidi Heights Khalid Bin Al Waleed Street Bur Dubai 44320",
    phone: "+971-04-254-3652",
    flagType: "image" as const,
    flagSrc: "/ae.png",
  },
] as const;

function AppButton({
  icon: Icon,
  label,
  sublabel,
  variant = "dark",
}: {
  icon: LucideIcon;
  label: string;
  sublabel: string;
  variant?: "dark" | "light";
}) {
  const { t } = useTranslation();

  return (
    <button
      type="button"
      className={cn(
        "inline-flex min-h-12 w-full items-center gap-3 rounded-2xl px-4 py-2.5 text-left transition active:scale-[0.98]",
        variant === "dark"
          ? "bg-[#1a1c1e] text-white shadow-md hover:opacity-95"
          : "border border-border bg-surface-container-lowest text-foreground shadow-sm hover:bg-muted/40",
      )}
    >
      <span
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
          variant === "dark" ? "bg-white/10" : "bg-muted",
        )}
      >
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0">
        <span className="block text-[10px] font-medium uppercase tracking-wide opacity-70">
          {t(sublabel)}
        </span>
        <span className="block truncate text-sm font-semibold leading-tight">
          {t(label)}
        </span>
      </span>
    </button>
  );
}

export function Footer() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [isMd, setIsMd] = React.useState(false);
  const [mdOpen, setMdOpen] = React.useState(false);
  const [locations, setLocations] = React.useState<
    ReadonlyArray<ContactLocation>
  >(DEFAULT_CONTACT_LOCATIONS);

  React.useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      setLocations(getContactLocations(window.location.hostname));
    }
    const handleResize = () => {
      setIsMd(window.innerWidth >= 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isDarkMode = mounted && theme === "dark";

  return (
    <footer className="w-full overflow-x-hidden bg-background pb-24 pt-4 md:min-h-0 md:pb-8 md:pt-12">
      <div className="mx-auto max-w-7xl space-y-4 px-4 md:space-y-8 md:px-5">
        {/* Brand surface */}
        <div className="rounded-[28px] border border-border/50 p-5 md:rounded-3xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-3">
              <EzeeFlightsLogo
                isDarkMode={isDarkMode}
                className="h-auto w-32 md:w-36"
              />
              <p className="max-w-sm text-sm font-medium leading-relaxed text-foreground/90">
                {t("Your journey begins with us")}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {socialIcons.map(({ icon: Icon, href, label }, index) => (
                <a
                  key={`social-${index}`}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1a1c1e] text-white transition-all hover:bg-redmix duration-300 ease-in-out"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Link groups and Contact section */}
        {isMd ? (
          locations.length > 3 ? (
            /* Global Site Layout: Separate Collapsible Sections for Links and Contacts to maximize space */
            <Accordion type="single" collapsible className="w-full space-y-4">
              {/* Links Accordion */}
              <AccordionItem
                value="footer-links"
                className="overflow-hidden rounded-2xl border border-border/60 bg-surface-container-lowest px-3 data-[state=open]:border-redmix/25"
              >
                <AccordionTrigger className="min-h-12 px-3 py-3 text-base font-semibold hover:no-underline">
                  <span className="flex min-w-0 flex-col items-start gap-0.5 text-left">
                    <span>{t("Company Directory & Useful Links")}</span>
                    <span className="text-xs font-medium normal-case tracking-normal text-foreground/80">
                      {t("View all links and site sections")}
                    </span>
                  </span>
                </AccordionTrigger>
                <AccordionContent className="px-1 pb-3 pt-4">
                  <CollapsibleLinkSections
                    sections={FOOTER_LINK_SECTIONS}
                    contentLayout="three-column"
                    noAccordion
                  />
                </AccordionContent>
              </AccordionItem>

              {/* Contacts Accordion */}
              <AccordionItem
                value="footer-contacts"
                className="overflow-hidden rounded-2xl border border-border/60 bg-surface-container-lowest px-3 data-[state=open]:border-redmix/25"
              >
                <AccordionTrigger className="min-h-12 px-3 py-3 text-base font-semibold hover:no-underline">
                  <span className="flex min-w-0 flex-col items-start gap-0.5 text-left">
                    <span>{t("Global Offices & Contact Support")}</span>
                    <span className="text-xs font-medium normal-case tracking-normal text-foreground/80">
                      {t("Get support from our global offices")}
                    </span>
                  </span>
                </AccordionTrigger>
                <AccordionContent className="px-1 pb-3 pt-4">
                  <CollapsibleContactSection
                    locations={locations}
                    email="sales@ezeeflights.com"
                    contentLayout="three-column"
                    noAccordion
                  />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          ) : (
            /* Regional Site Layout: Combined side-by-side in single Accordion */
            <Accordion
              type="single"
              collapsible
              value={mdOpen ? "footer-all" : ""}
              onValueChange={(val) => setMdOpen(val === "footer-all")}
              className="w-full"
            >
              <AccordionItem
                value="footer-all"
                className="overflow-hidden rounded-2xl border border-border/60 bg-surface-container-lowest px-3 data-[state=open]:border-redmix/25"
              >
                <AccordionTrigger className="min-h-12 px-3 py-3 text-base font-semibold hover:no-underline">
                  <span className="flex min-w-0 flex-col items-start gap-0.5 text-left">
                    <span>
                      {t("Company Directory, Support & Contact Details")}
                    </span>
                    <span className="text-xs font-medium normal-case tracking-normal text-foreground/80">
                      {t("View all links and contact options")}
                    </span>
                  </span>
                </AccordionTrigger>
                <AccordionContent className="px-1 pb-3 pt-0">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-[2fr_3fr] md:gap-8 pt-4">
                    <div className="min-w-0">
                      <CollapsibleLinkSections
                        sections={FOOTER_LINK_SECTIONS}
                        contentLayout="three-column"
                        noAccordion
                      />
                    </div>
                    <div className="min-w-0">
                      <CollapsibleContactSection
                        locations={locations}
                        email="sales@ezeeflights.com"
                        contentLayout="three-column"
                        noAccordion
                      />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )
        ) : (
          /* Mobile View */
          <div className="grid grid-cols-1 gap-4">
            <CollapsibleLinkSections
              sections={FOOTER_LINK_SECTIONS}
              contentLayout="three-column"
            />
            <CollapsibleContactSection
              locations={locations}
              email="sales@ezeeflights.com"
              contentLayout="three-column"
            />
          </div>
        )}

        {/* Global sites + trust */}
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-[28px] border border-border/60 p-4">
            <h3 className="mb-3 text-sm font-bold tracking-wider dark:text-muted-foreground text-foreground/80">
              {t("Our Global Sites")}
            </h3>
            <div className="flex flex-wrap gap-2">
              {globalSites.map((flag) => (
                <a
                  key={flag.label}
                  href={flag.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/30 px-3 py-2 text-xs font-semibold text-foreground transition hover:border-redmix/30 hover:bg-redmix/5 active:scale-[0.98]"
                >
                  <img
                    src={flag.src}
                    alt={flag.label}
                    className="h-4 w-6 rounded-sm object-cover shadow-sm"
                  />
                  {t(flag.label)}
                </a>
              ))}
            </div>

            <div className="mt-4 overflow-hidden rounded-2xl border border-border/40 bg-white p-1">
              <img
                src="/logos-banner-new.jpg"
                alt="Payment and Trust Logos"
                className="h-auto w-full"
              />
            </div>
          </div>

          {/* App download card */}
          <div className="rounded-[28px] border border-border/60 dark:bg-[#0f0f0f] bg-white p-5 dark:text-white text-foreground">
            <div className="space-y-1">
              <p className="text-sm font-bold tracking-wider dark:text-white/60 text-foreground/80">
                {t("Mobile App")}
              </p>
              <h4 className="text-xl font-bold tracking-tight">
                {t("Download our App")}
              </h4>
              <p className="text-xs dark:text-white/75 text-foreground/80">
                {t("Booking travels made easy on the go.")}
              </p>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <AppButton
                icon={Play}
                sublabel="Get it on"
                label="Google Play"
                variant="dark"
              />
              <AppButton
                icon={Apple}
                sublabel="Download on"
                label="App Store"
                variant="dark"
              />
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-white/10 pt-4">
              <div className="flex items-center gap-0.5 text-brand-yellow">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>
              <span className="text-xs font-bold">4.9 / 5</span>
              <span className="text-xs text-white/70">
                • {t("100,000+ Happy Users")}
              </span>
            </div>
          </div>
        </div>

        {/* SEO */}
        <div className="rounded-3xl border border-border/50 font-medium px-4 py-4 text-xs leading-relaxed text-foreground/80">
          <p>
            {t(
              "Ezee Flights is an ISO 9001:2015 certified, world-leading platform for booking the cheapest flights online. With our lowest fare guarantee and unbeatable value, you can explore the world’s most popular destinations within your budget! Ezee Flights provides trusted travel services worldwide, helping you discover new places with confidence and ease.",
            )}
          </p>
        </div>

        {/* Bottom bar */}
        <div className="rounded-3xl border border-border/60 px-4 py-4 text-xs text-foreground/80">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <p className="text-xs font-medium leading-relaxed">
              {t(
                "Copyright ©{{year}} EzeeFlights. All Rights Reserved. EzeeFlights is a part of Ezeewellness.",
                { year: new Date().getFullYear() },
              )}
            </p>
            <div className="flex text-xs flex-wrap items-center gap-3">
              <span className="rounded-full bg-muted px-3 py-1 font-medium text-foreground/80">
                Visa · Mastercard · Amex · PayPal · Stripe
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 font-medium text-emerald-700 dark:text-emerald-400">
                <span aria-hidden>🔒</span> {t("SSL SECURED")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

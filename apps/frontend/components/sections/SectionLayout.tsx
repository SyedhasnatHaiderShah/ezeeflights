"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { WhyChooseUs } from "./WhyChooseUs";

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.25 },
  },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  },
};

interface SectionLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  /** When false, content stays single column (e.g. review carousel). Default: true */
  twoColumn?: boolean;
}

export default function SectionLayout({
  title,
  subtitle,
  children,
  className,
  twoColumn = true,
}: SectionLayoutProps) {
  const { t } = useTranslation();
  const [pageVisible, setPageVisible] = React.useState(false);

  React.useEffect(() => {
    setPageVisible(true);
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <Header />
      </motion.div>
      <main className="flex-grow pt-16">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 md:py-6 lg:px-8">
          {/* Page title — FlightCard-style card, theme tokens only */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={pageVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.55, delay: 0.15, ease: "easeOut" }}
            className="mb-6 overflow-hidden rounded-2xl border border-border bg-white shadow-sm dark:bg-card"
          >
            <div className="border-b border-border/50 bg-muted/20 px-4 py-4 md:px-6 md:py-5">
              <motion.span
                initial={{ opacity: 0, y: -8 }}
                animate={pageVisible ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.45, delay: 0.25, ease: "easeOut" }}
                className="text-xs font-bold uppercase tracking-[0.2em] text-redmix"
              >
                {t("Company")}
              </motion.span>
              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={pageVisible ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.35, ease: "easeOut" }}
                className="mt-2 text-lg font-bold tracking-tight text-foreground"
              >
                {t(title)}
              </motion.h1>
              {subtitle ? (
                <motion.p
                  initial={{ opacity: 0, y: 12 }}
                  animate={pageVisible ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.45, ease: "easeOut" }}
                  className="mt-2 max-w-3xl text-sm text-foreground/80"
                >
                  {t(subtitle)}
                </motion.p>
              ) : null}
            </div>
          </motion.div>

          <motion.article
            variants={containerVariants}
            initial="hidden"
            animate={pageVisible ? "visible" : "hidden"}
            className={cn(
              twoColumn &&
                "grid grid-cols-1 items-start gap-5 md:grid-cols-2 md:gap-6 lg:gap-8",
              !twoColumn && "space-y-5",
              className,
            )}
          >
            {children}
          </motion.article>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{
            duration: 0.65,
            ease: [0.25, 0.46, 0.45, 0.94] as const,
          }}
        >
          <WhyChooseUs />
        </motion.div>
      </main>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <Footer />
      </motion.div>
    </div>
  );
}

/** Grid cell wrapper — use fullWidth for forms, carousels, etc. */
export function CompanySection({
  children,
  className,
  fullWidth = false,
}: {
  children: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
}) {
  return (
    <motion.div
      variants={sectionVariants}
      className={cn(
        "space-y-3 rounded-2xl border border-border bg-white p-4 shadow-sm dark:bg-card md:p-5",
        fullWidth && "md:col-span-2",
        className,
      )}
    >
      {children}
    </motion.div>
  );
}

export function CompanyProse({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p className={cn("text-sm leading-relaxed text-foreground/90", className)}>
      {children}
    </p>
  );
}

export function CompanyHeading({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h2
      className={cn(
        "flex items-center gap-2 border-b border-border/50 pb-2 text-sm font-bold tracking-wide text-foreground",
        className,
      )}
    >
      <span className="h-2 w-2 shrink-0 rounded-full bg-redmix" />
      {children}
    </h2>
  );
}

export function CompanyList({
  items,
  className,
}: {
  items: string[];
  className?: string;
}) {
  return (
    <ul
      className={cn(
        "list-disc space-y-2 pl-5 text-sm text-foreground/90",
        className,
      )}
    >
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

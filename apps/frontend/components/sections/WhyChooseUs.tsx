"use client";

import * as React from "react";
import {
  BadgeCheck,
  Smartphone,
  PhoneCall,
  ShieldCheck,
  LucideIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { getPrimaryPhone } from "@/lib/utils/domain";

interface Feature {
  icon: LucideIcon;
  title: string;
  text: string;
}

const getFeatures = (t: (key: string) => string, phone: string): Feature[] => [
  {
    icon: BadgeCheck,
    title: t("Best Price Guarantee"),
    text: t(
      "Discover unbeatable prices on international flights with our exclusive deals",
    ),
  },
  {
    icon: Smartphone,
    title: t("Easy Booking"),
    text: t("Best deals on international flights in just a few clicks"),
  },
  {
    icon: PhoneCall,
    title: t("24X7 Support"),
    text: t(
      "Get award-winning service and special deals by calling +1-888-604-0198",
    ).replace("+1-888-604-0198", phone),
  },
  {
    icon: ShieldCheck,
    title: t("Trust pay"),
    text: t("100% Payment Protection. Easy Return Policy."),
  },
];

function FeatureCard({
  feature,
  className,
}: {
  feature: Feature;
  className?: string;
}) {
  const Icon = feature.icon;

  return (
    <article
      className={cn(
        "group flex h-full min-h-[132px] w-full items-start gap-4 rounded-[28px] border border-border/60 p-4 shadow-sm transition-all duration-300 hover:border-redmix/20 hover:shadow-md active:scale-[0.99]",
        className,
      )}
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-redmix text-redmix transition-colors group-hover:bg-redmix text-white">
        <Icon className="h-5 w-5" />
      </span>

      <div className="min-w-0 flex-1">
        <h3 className="truncate text-base font-bold text-foreground transition-colors group-hover:text-redmix">
          {feature.title}
        </h3>
        <p className="mt-1 line-clamp-3 text-xs font-medium leading-relaxed text-foreground/80">
          {feature.text}
        </p>
      </div>
    </article>
  );
}

export function WhyChooseUs() {
  const { t } = useTranslation();
  const [phone, setPhone] = React.useState("+1-888-604-0198");

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      setPhone(getPrimaryPhone(window.location.hostname));
    }
  }, []);

  const features = getFeatures(t, phone);

  return (
    <section className="overflow-x-hidden border-t border-border/40 bg-background py-5 md:py-14">
      <div className="mx-auto max-w-[1200px] px-5">
        <div className="mb-6 rounded-[28px] border border-border/50 px-5 py-4 shadow-sm">
          <span className="block text-[10px] font-bold uppercase tracking-[0.22em] text-redmix">
            {t("The Modern Choice")}
          </span>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-foreground lg:text-3xl">
            {t("Why Choose Ezee Flights")}
          </h2>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar lg:grid lg:grid-cols-4 lg:gap-5 lg:overflow-visible lg:pb-0">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="w-[85vw] max-w-[320px] shrink-0 snap-start sm:w-[48%] lg:w-auto lg:max-w-none"
            >
              <FeatureCard feature={feature} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

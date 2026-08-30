"use client";

import React from "react";
import { Filter, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface CarFilterSidebarProps {
  categories: string[];
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  partners: string[];
  selectedPartners: string[];
  togglePartner: (partner: string) => void;
  unlimitedMileageOnly: boolean;
  setUnlimitedMileageOnly: (val: boolean) => void;
}

export function CarFilterSidebar({
  categories,
  selectedCategory,
  setSelectedCategory,
  partners,
  selectedPartners,
  togglePartner,
  unlimitedMileageOnly,
  setUnlimitedMileageOnly,
}: CarFilterSidebarProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-3 p-3 lg:p-0">
      {/* <div className="space-y-2">
        <h3 className="text-lg font-black flex items-center gap-2">
          <Filter className="w-5 h-5 text-brand-red" /> {t("Filters")}
        </h3>
        <div className="h-px bg-border/50" />
      </div> */}

      <div className="space-y-3">
        <p className="text-xs font-semibold text-foreground">
          {t("Vehicle Category")}
        </p>
        <div className="space-y-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "w-full flex items-center justify-between px-3 py-1 rounded-2xl text-xs font-bold transition-all cursor-pointer",
                selectedCategory === cat
                  ? "bg-brand-red text-redmix"
                  : "hover:bg-redmix/5",
              )}
            >
              {t(cat)}
              {selectedCategory === cat && <Check className="w-3 h-3" />}
            </button>
          ))}
        </div>
      </div>

      {partners.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-semibold text-foreground">{t("Vendor")}</p>
          <div className="flex flex-wrap gap-2">
            {partners.map((partner) => (
              <button
                key={partner}
                onClick={() => togglePartner(partner)}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-tighter transition-all border",
                  selectedPartners.includes(partner)
                    ? "bg-background text-redmix"
                    : "border-border hover:border-brand-red/50",
                )}
              >
                {partner}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* <div className="space-y-3">
        <p className="text-xs font-semibold text-foreground">
          {t("Rental Policies")}
        </p>
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer group">
            <div
              onClick={() => setUnlimitedMileageOnly(!unlimitedMileageOnly)}
              className={cn(
                "w-5 h-5 rounded-md border flex items-center justify-center transition-all",
                unlimitedMileageOnly
                  ? "bg-brand-red border-brand-red"
                  : "border-border group-hover:border-brand-red/50",
              )}
            >
              {unlimitedMileageOnly && <Check className="w-3 h-3 text-white" />}
            </div>
            <span className="text-xs font-bold">{t("Unlimited Mileage")}</span>
          </label>
        </div>
      </div> */}
    </div>
  );
}

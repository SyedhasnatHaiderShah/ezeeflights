"use client";

import Link from "next/link";
import SectionLayout, {
  CompanyProse,
  CompanySection,
} from "@/components/sections/SectionLayout";
import { Reviews } from "@/components/sections/Reviews";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

export default function ReviewPage() {
  const { t } = useTranslation();

  return (
    <SectionLayout
      title={t("Review")}
      subtitle={t("See what our travellers say about Ezee Flights")}
      twoColumn={false}
    >
      <CompanySection className="space-y-8 p-6 md:p-8">
        <div className="space-y-3">
          <CompanyProse>
            {t(
              "Read genuine reviews from travellers who booked their flights with Ezee Flights. Your feedback helps us improve and helps others travel with confidence.",
            )}
          </CompanyProse>
        </div>

        <Reviews />

        <div className="flex justify-center pt-2">
          <Button
            asChild
            className="h-11 rounded-xl bg-redmix px-6 font-bold text-white shadow-lg shadow-redmix/20 hover:brightness-110"
          >
            <Link href="/reviews">{t("View All Reviews")}</Link>
          </Button>
        </div>
      </CompanySection>
    </SectionLayout>
  );
}

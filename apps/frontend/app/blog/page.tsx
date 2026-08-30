"use client";

import Link from "next/link";
import SectionLayout, {
  CompanyProse,
  CompanySection,
} from "@/components/sections/SectionLayout";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

export default function BlogPage() {
  const { t } = useTranslation();

  return (
    <SectionLayout
      title="Blog"
      subtitle="Travel tips, guides, and inspiration from Ezee Flights"
    >
      <CompanySection>
        <CompanyProse>
          {t(
            "Our travel blog is coming soon. Check back for expert tips on booking international flights, destination guides, and the latest deals from Ezee Flights.",
          )}
        </CompanyProse>
      </CompanySection>

      <CompanySection>
        <div className="flex flex-wrap gap-3">
          <Button
            asChild
            className="h-11 rounded-xl bg-redmix px-6 font-bold text-white shadow-lg shadow-redmix/20 hover:brightness-110"
          >
            <Link href="/deals">{t("Browse Deals")}</Link>
          </Button>
          <Button asChild variant="outline" className="h-11 rounded-xl font-semibold">
            <Link href="/destinations">{t("Explore Destinations")}</Link>
          </Button>
        </div>
      </CompanySection>
    </SectionLayout>
  );
}

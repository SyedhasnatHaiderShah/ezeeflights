"use client";

import SectionLayout, { CompanyHeading, CompanySection } from "@/components/sections/SectionLayout";
import { FAQ_ITEMS } from "@/lib/company-pages-content";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useTranslation } from "react-i18next";

const FAQ_CATEGORIES = [...new Set(FAQ_ITEMS.map((item) => item.category))];

export default function FaqPage() {
  const { t } = useTranslation();

  return (
    <SectionLayout
      title="FAQ"
      subtitle="FAQs - Answers to Your Flights Booking Queries"
      twoColumn={false}
    >
      <CompanySection className="space-y-8 p-6 md:p-8">
        {FAQ_CATEGORIES.map((category) => {
          const items = FAQ_ITEMS.filter((item) => item.category === category);

          return (
            <div key={category} className="space-y-3">
              <CompanyHeading>{t(category)}</CompanyHeading>
              <Accordion type="single" collapsible className="space-y-2">
                {items.map((item, index) => (
                  <AccordionItem
                    key={`${category}-${index}`}
                    value={`${category}-${index}`}
                    className="overflow-hidden rounded-xl border border-border/60 bg-muted/10 px-3 dark:bg-muted/20"
                  >
                    <AccordionTrigger className="py-3 text-left text-sm font-semibold text-foreground hover:no-underline [&[data-state=open]]:text-redmix">
                      {t(item.question)}
                    </AccordionTrigger>
                    <AccordionContent className="pb-3 text-sm leading-relaxed text-muted-foreground">
                      {t(item.answer)}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          );
        })}
      </CompanySection>
    </SectionLayout>
  );
}

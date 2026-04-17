'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface FaqItem {
  q: string;
  a: string;
}

export function SupportFaqAccordion({ faqs }: { faqs: FaqItem[] }) {
  return (
    <Accordion type="single" collapsible className="w-full">
      {faqs.map((faq, index) => (
        <AccordionItem key={faq.q} value={`faq-${index}`}>
          <AccordionTrigger>{faq.q}</AccordionTrigger>
          <AccordionContent>{faq.a}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

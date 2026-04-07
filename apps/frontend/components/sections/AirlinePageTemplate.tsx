"use client";

import * as React from "react";
import { Header } from "@/components/sections/Header";
import { Hero } from "@/components/sections/Hero";
import { WhyChooseUs } from "@/components/sections/WhyChooseUs";
import { FAQSection } from "@/components/sections/FAQSection";
import { Footer } from "@/components/sections/Footer";
import { AppImage } from "@/components/ui/app-image";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

export interface AirlineSection {
  title: string;
  paragraphs: string[];
}

export interface AirlineData {
  topImage?: string;
  hero: {
    title: React.ReactNode;
    description: string;
  };
  intro: {
    title: string;
    text: string;
  };
  sections: AirlineSection[];
  conclusion: string;
}

interface AirlinePageTemplateProps {
  data: AirlineData;
}

export function AirlinePageTemplate({ data }: AirlinePageTemplateProps) {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground transition-colors duration-300">
      <Header />

      <main className="flex-grow">
        <Hero title={data.hero.title} description={data.hero.description} />

        <section className="py-12 bg-background">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <ScrollReveal>
              {data.topImage && (
                <div className="relative w-full aspect-[21/9] rounded-2xl overflow-hidden mb-12 shadow-2xl border border-border/50">
                  <AppImage
                    src={data.topImage}
                    alt={data.intro.title}
                    fill
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>
              )}

              <div className="prose prose-slate dark:prose-invert max-w-none">
                <h2 className="text-3xl font-black tracking-tight mb-6">
                  {data.intro.title}
                </h2>
                <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                  {data.intro.text}
                </p>

                <div className="grid gap-12 mt-16">
                  {data.sections.map((section, idx) => (
                    <div key={idx} className="space-y-4">
                      <h3 className="text-2xl font-bold text-foreground">
                        {section.title}
                      </h3>
                      {section.paragraphs.map((p, pIdx) => (
                        <p
                          key={pIdx}
                          className={
                            p.startsWith("•") || p.startsWith("-")
                              ? "text-muted-foreground leading-relaxed pl-4 border-l-2 border-brand-red/20"
                              : "text-muted-foreground leading-relaxed"
                          }
                        >
                          {p}
                        </p>
                      ))}
                    </div>
                  ))}

                  <div className="pt-8 border-t border-border">
                    <h3 className="text-2xl font-bold text-foreground mb-4">
                      Conclusion
                    </h3>
                    <p className="text-muted-foreground leading-relaxed italic">
                      {data.conclusion}
                    </p>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        <ScrollReveal minHeight="600px">
          <FAQSection />
        </ScrollReveal>

        <ScrollReveal minHeight="500px">
          <WhyChooseUs />
        </ScrollReveal>
      </main>

      <Footer />
    </div>
  );
}
